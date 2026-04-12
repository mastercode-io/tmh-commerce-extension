'use client';

import * as React from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getRenewalDemoPaymentSnapshot,
  readRenewalDemoOrder,
} from '@/lib/renewals/demo-storage';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { requestRenewalJson, RenewalApiResponseError } from '@/lib/renewals/client';
import type { RenewalConfirmationResponse } from '@/features/renewals/lib/types';

type RenewalConfirmationApiResponse = RenewalConfirmationResponse & {
  correlationId: string;
};

export function RenewalConfirmationScreen({ orderId }: { orderId: string }) {
  const [confirmation, setConfirmation] =
    React.useState<RenewalConfirmationResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function loadConfirmation() {
      setLoading(true);
      setError(null);

      try {
        const response =
          await requestRenewalJson<RenewalConfirmationApiResponse>(
            `/api/renewals/orders/${orderId}/confirmation`,
          );

        if (!cancelled) {
          setConfirmation(response);
        }
      } catch (requestError) {
        const fallback = getRenewalDemoPaymentSnapshot({ orderId }) ?? (() => {
          const snapshot = readRenewalDemoOrder(orderId);
          return snapshot ? { snapshot } : null;
        })();

        if (!cancelled && fallback) {
          setConfirmation({
            orderId: fallback.snapshot.order.orderId,
            requestId: fallback.snapshot.request?.requestId,
            paymentStatus: fallback.snapshot.payment?.status ?? 'initiated',
            confirmedAt: fallback.snapshot.confirmedAt,
            reference: fallback.snapshot.order.reference,
          });
          return;
        }

        if (!cancelled) {
          setError(
            requestError instanceof RenewalApiResponseError
              ? requestError.message
              : 'We could not load the renewal confirmation right now.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadConfirmation();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading confirmation</CardTitle>
          <CardDescription>
            We&apos;re checking the final payment status for this order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={4} />
        </CardContent>
      </Card>
    );
  }

  if (!confirmation) {
    return (
      <EmptyState
        title="Confirmation unavailable"
        description={error ?? 'This order confirmation could not be loaded.'}
        action={
          <Button variant="outline" asChild>
            <Link href={`/orders/${orderId}`}>Back to order</Link>
          </Button>
        }
      />
    );
  }

  if (confirmation.paymentStatus !== 'succeeded') {
    return (
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <XCircle className="text-destructive size-5" />
            Confirmation not ready
          </CardTitle>
          <CardDescription>
            The payment is still {confirmation.paymentStatus}. Return to the order page to continue checking the status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3 pt-4">
          <Button asChild>
            <Link href={`/orders/${orderId}`}>Back to order</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl">
      <CardHeader className="border-b">
        <Badge variant="secondary" className="mb-3 w-fit">
          Renewal confirmed
        </Badge>
        <CardTitle className="flex items-center gap-2 text-3xl">
          <CheckCircle2 className="text-primary size-6" />
          Payment received
        </CardTitle>
        <CardDescription>
          Your renewal order has been confirmed and handed off for processing.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-6">
        <div className="grid gap-3 rounded-xl border p-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
              Order
            </div>
            <div className="mt-2 font-medium">{confirmation.orderId}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
              Reference
            </div>
            <div className="mt-2 font-medium">{confirmation.reference ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
              Request
            </div>
            <div className="mt-2 font-medium">{confirmation.requestId ?? '—'}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
              Confirmed at
            </div>
            <div className="mt-2 font-medium">
              {confirmation.confirmedAt ?? 'Pending confirmation timestamp'}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/renewal">Start another renewal</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/account/orders">View account orders</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
