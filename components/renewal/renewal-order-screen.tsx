'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ExternalLink, Loader2, RefreshCcw, ShieldCheck } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { pollPaymentStatus } from '@/lib/commerce/payment-polling';
import {
  getRenewalDemoPaymentSnapshot,
  readRenewalDemoOrder,
  saveRenewalDemoOrder,
  startRenewalDemoPayment,
  toRenewalOrderResponse,
} from '@/lib/renewals/demo-storage';
import { requestRenewalJson, RenewalApiResponseError } from '@/lib/renewals/client';
import type {
  CreateRenewalPaymentLinkResponse,
  RenewalOrderResponse,
  RenewalPaymentStatusResponse,
} from '@/features/renewals/lib/types';

type RenewalOrderApiResponse = RenewalOrderResponse & {
  correlationId: string;
};

type RenewalPaymentLinkApiResponse = CreateRenewalPaymentLinkResponse & {
  correlationId: string;
};

type RenewalPaymentStatusApiResponse = RenewalPaymentStatusResponse & {
  correlationId: string;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function RenewalOrderScreen({
  orderId,
  showDemoHelpers,
}: {
  orderId: string;
  showDemoHelpers: boolean;
}) {
  const router = useRouter();
  const [isNavigating, startNavigation] = React.useTransition();
  const [order, setOrder] = React.useState<RenewalOrderResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [startingPayment, setStartingPayment] = React.useState(false);
  const [polling, setPolling] = React.useState(false);
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrder = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await requestRenewalJson<RenewalOrderApiResponse>(
        `/api/renewals/orders/${orderId}`,
      );
      if (showDemoHelpers) {
        const existing = readRenewalDemoOrder(orderId);
        saveRenewalDemoOrder({
          token: existing?.token ?? 'tok_123',
          request: response.request,
          order: response.order,
          orderDetails: response.orderDetails,
          payment: response.payment,
        });
      }
      setOrder(response);
    } catch (requestError) {
      const fallback = showDemoHelpers ? readRenewalDemoOrder(orderId) : null;

      if (fallback) {
        const paymentState = getRenewalDemoPaymentSnapshot({ orderId });
        setOrder(toRenewalOrderResponse(paymentState?.snapshot ?? fallback));
        setLoading(false);
        return;
      }

      setError(
        requestError instanceof RenewalApiResponseError
          ? requestError.message
          : 'We could not load this renewal order right now.',
      );
    } finally {
      setLoading(false);
    }
  }, [orderId, showDemoHelpers]);

  const startPolling = React.useCallback(async () => {
    if (polling) {
      return;
    }

    setPolling(true);
    setError(null);

    try {
      const result = await pollPaymentStatus(async () => {
        try {
          const response =
            await requestRenewalJson<RenewalPaymentStatusApiResponse>(
              `/api/renewals/orders/${orderId}/payment-status`,
            );

          return {
            status: response.status,
            updatedAt: response.updatedAt,
          };
        } catch (requestError) {
          if (!showDemoHelpers) {
            throw requestError;
          }

          const fallback = getRenewalDemoPaymentSnapshot({ orderId });

          if (!fallback) {
            throw requestError;
          }

          setOrder(toRenewalOrderResponse(fallback.snapshot));

          return {
            status: fallback.payment.status,
            updatedAt: fallback.updatedAt,
          };
        }
      });

      if (result.status === 'succeeded') {
        startNavigation(() => {
          router.push(`/orders/${orderId}/confirmation`);
        });
        return;
      }

      if (result.status === 'failed' || result.status === 'cancelled') {
        await loadOrder();
        setError(
          result.status === 'failed'
            ? 'Payment did not complete. You can try the hosted payment step again.'
            : 'Payment was cancelled. You can restart the hosted payment step when ready.',
        );
        return;
      }

      if (result.status === 'timeout') {
        await loadOrder();
        setError('Payment is still processing. Use refresh to recheck the current status.');
      }
    } catch (requestError) {
      setError(
        requestError instanceof RenewalApiResponseError
          ? requestError.message
          : 'We could not verify payment status right now.',
      );
    } finally {
      setPolling(false);
    }
  }, [loadOrder, orderId, polling, router, showDemoHelpers]);

  React.useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  React.useEffect(() => {
    if (
      !order?.payment ||
      (order.payment.status !== 'initiated' && order.payment.status !== 'pending')
    ) {
      return;
    }

    void startPolling();
  }, [order, startPolling]);

  async function handleStartPayment() {
    setStartingPayment(true);
    setError(null);

    try {
      const response = await requestRenewalJson<RenewalPaymentLinkApiResponse>(
        `/api/renewals/orders/${orderId}/payment-link`,
        {
          method: 'POST',
          body: JSON.stringify({ termsAccepted }),
        },
      );

      window.location.assign(response.paymentUrl);
    } catch (requestError) {
      if (showDemoHelpers) {
        const fallback = startRenewalDemoPayment({ orderId });

        if (fallback) {
          window.location.assign(fallback.paymentUrl);
          return;
        }
      }

      setError(
        requestError instanceof RenewalApiResponseError
          ? requestError.message
          : 'We could not start payment right now.',
      );
      setStartingPayment(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading order</CardTitle>
          <CardDescription>
            We&apos;re loading the renewal order details from the server.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={5} />
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Order unavailable"
        description={error ?? 'This renewal order could not be loaded.'}
        action={
          <Button variant="outline" asChild>
            <Link href="/renewal">Back to renewal</Link>
          </Button>
        }
      />
    );
  }

  const paymentStatus = order.payment?.status ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="grid gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="secondary" className="mb-3">
              Renewal order
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight">
              Review and pay
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              This order is server-authoritative. Review the selected trademarks,
              confirm the terms, and continue to hosted payment.
            </p>
          </div>
          <Button variant="outline" onClick={() => void loadOrder()} disabled={loading || polling}>
            <RefreshCcw />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Selected trademarks</CardTitle>
            <CardDescription>
              Order {order.order.reference}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {order.orderDetails.trademarks.map((trademark) => (
              <div key={trademark.id} className="rounded-xl border p-4">
                <div className="text-sm font-medium">{trademark.wordMark}</div>
                <div className="text-muted-foreground mt-1 text-sm">
                  {trademark.registrationNumber ?? trademark.applicationNumber}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Charges</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4">
            {order.orderDetails.lineItems.map((lineItem) => (
              <div
                key={lineItem.orderLineId ?? lineItem.label}
                className="flex items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <div className="text-sm font-medium">{lineItem.label}</div>
                  <div className="text-muted-foreground mt-1 text-sm">
                    Quantity {lineItem.quantity}
                  </div>
                </div>
                <div className="text-sm font-medium">
                  {formatMoney(lineItem.total)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle>Terms</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 pt-4">
            <label className="flex items-start gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
                className="mt-1"
              />
              <div className="grid gap-1">
                <div className="text-sm font-medium">
                  I accept the renewal terms and conditions
                </div>
                <div className="text-muted-foreground text-sm">
                  Payment cannot start until the terms are accepted.
                </div>
              </div>
            </label>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              onClick={() => void handleStartPayment()}
              disabled={
                !termsAccepted ||
                startingPayment ||
                polling ||
                isNavigating
              }
            >
              {startingPayment ? (
                <>
                  <Loader2 className="animate-spin" />
                  Starting payment
                </>
              ) : (
                <>
                  Open hosted payment
                  <ExternalLink />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {error ? (
          <EmptyState
            title="Order action unavailable"
            description={error}
          />
        ) : null}
      </div>

      <div className="grid gap-6">
        <Card className="ring-primary/15 ring-2">
          <CardHeader className="border-b">
            <CardTitle>Order summary</CardTitle>
            <CardDescription>
              {order.orderDetails.trademarks.length} trademarks in this order
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(order.orderDetails.totals.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>VAT</span>
              <span>{formatMoney(order.orderDetails.totals.vat)}</span>
            </div>
            <div className="flex items-center justify-between border-t pt-3 text-base font-medium">
              <span>Total due now</span>
              <span>{formatMoney(order.orderDetails.totals.total)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Payment status
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Order status</span>
              <span>{order.order.status}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Payment</span>
              <span>{paymentStatus ?? 'not started'}</span>
            </div>
            {polling ? (
              <div className="text-muted-foreground mt-2 flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Checking payment status...
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
