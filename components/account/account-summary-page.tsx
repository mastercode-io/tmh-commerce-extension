'use client';

import * as React from 'react';
import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  CommerceAccountSummary,
  OrderSummary,
  PaymentSummary,
  RequestSummary,
  SubscriptionSummary,
} from '@/lib/commerce/types';

type AccountSummaryResponse =
  | {
      account: CommerceAccountSummary;
      correlationId: string;
    }
  | {
      code: string;
      message: string;
      correlationId: string;
    };

type AccountLoadState =
  | { status: 'idle' | 'loading' }
  | { status: 'ready'; account: CommerceAccountSummary; correlationId: string }
  | { status: 'error'; message: string; correlationId?: string };

function isAccountSummaryResponse(
  payload: AccountSummaryResponse,
): payload is Extract<AccountSummaryResponse, { account: CommerceAccountSummary }> {
  return 'account' in payload;
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) {
    return 'Not set';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function statusLabel(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function SummaryMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="grid gap-1">
        <div className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

function SubscriptionsList({
  subscriptions,
}: {
  subscriptions: SubscriptionSummary[];
}) {
  if (!subscriptions.length) {
    return (
      <EmptyState
        title="No subscriptions yet"
        description="Monitoring subscriptions will appear here once checkout is confirmed."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {subscriptions.slice(0, 3).map((subscription) => (
        <div
          key={subscription.subscriptionId}
          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="font-medium">{subscription.planFamily}</div>
            <div className="text-muted-foreground text-xs">
              {subscription.billingInterval} · Ref {subscription.reference}
            </div>
          </div>
          <Badge variant="secondary">{statusLabel(subscription.status)}</Badge>
        </div>
      ))}
    </div>
  );
}

function OrdersList({ orders }: { orders: OrderSummary[] }) {
  if (!orders.length) {
    return (
      <EmptyState
        title="No orders yet"
        description="Subscription and request orders will appear here after they are created."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {orders.slice(0, 4).map((order) => (
        <div
          key={order.orderId}
          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="font-medium">{statusLabel(order.kind)}</div>
            <div className="text-muted-foreground text-xs">
              {formatDate(order.createdAt)} · Ref {order.reference}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">
              {formatCurrency(order.totalDueNow, order.currency)}
            </div>
            <Badge variant="outline">{statusLabel(order.status)}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

function PaymentsList({ payments }: { payments: PaymentSummary[] }) {
  if (!payments.length) {
    return (
      <EmptyState
        title="No payments yet"
        description="Payment attempts and successful collections will appear here."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {payments.slice(0, 4).map((payment) => (
        <div
          key={payment.paymentId}
          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="font-medium">
              {formatCurrency(payment.amount, payment.currency)}
            </div>
            <div className="text-muted-foreground text-xs">
              {payment.provider} · Ref {payment.reference}
            </div>
          </div>
          <Badge variant="secondary">{statusLabel(payment.status)}</Badge>
        </div>
      ))}
    </div>
  );
}

function RequestsList({ requests }: { requests: RequestSummary[] }) {
  if (!requests.length) {
    return (
      <EmptyState
        title="No service requests yet"
        description="Audit, renewal, application, and support requests will appear here."
      />
    );
  }

  return (
    <div className="grid gap-3">
      {requests.slice(0, 4).map((request) => (
        <div
          key={request.requestId}
          className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="font-medium">{request.summary}</div>
            <div className="text-muted-foreground text-xs">
              {statusLabel(request.requestType)} · Updated{' '}
              {formatDate(request.updatedAt)}
            </div>
          </div>
          <Badge variant="outline">{statusLabel(request.status)}</Badge>
        </div>
      ))}
    </div>
  );
}

function AccountSummaryContent({
  account,
  correlationId,
  devMode,
}: {
  account: CommerceAccountSummary;
  correlationId: string;
  devMode: boolean;
}) {
  const accountQuery = new URLSearchParams({
    customerId: account.customer.customerId,
  }).toString();
  const activeSubscriptions = account.subscriptions.filter(
    (subscription) => subscription.status === 'active',
  ).length;
  const succeededPaymentsTotal = account.payments
    .filter((payment) => payment.status === 'succeeded')
    .reduce((total, payment) => total + payment.amount, 0);
  const firstPaymentCurrency = account.payments[0]?.currency ?? 'GBP';

  return (
    <div className="grid gap-6">
      <PageHeader
        title={`Account for ${account.customer.fullName}`}
        description={
          account.customer.companyName
            ? `${account.customer.companyName} · ${account.customer.email}`
            : account.customer.email
        }
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings/notifications">Email preferences</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryMetric label="Orders" value={account.orders.length} />
        <SummaryMetric label="Subscriptions" value={activeSubscriptions} />
        <SummaryMetric
          label="Successful payments"
          value={formatCurrency(succeededPaymentsTotal, firstPaymentCurrency)}
        />
        <SummaryMetric label="Requests" value={account.requests.length} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subscriptions</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/account/subscriptions?${accountQuery}`}>View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <SubscriptionsList subscriptions={account.subscriptions} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/account/orders?${accountQuery}`}>View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <OrdersList orders={account.orders} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payments</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/account/payments?${accountQuery}`}>View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <PaymentsList payments={account.payments} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Requests</CardTitle>
            <CardAction>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/account/requests?${accountQuery}`}>View all</Link>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RequestsList requests={account.requests} />
          </CardContent>
        </Card>
      </div>

      {devMode ? (
        <Card>
          <CardHeader>
            <CardTitle>Account Sync Debug</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-xs">
            Correlation ID: {correlationId}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function AccountSummaryPage({
  customerId,
  email,
  devMode,
}: {
  customerId?: string;
  email?: string;
  devMode?: boolean;
}) {
  const [state, setState] = React.useState<AccountLoadState>({
    status: customerId || email ? 'loading' : 'idle',
  });

  React.useEffect(() => {
    if (!customerId && !email) {
      setState({ status: 'idle' });
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams();

    if (customerId) {
      params.set('customerId', customerId);
    }

    if (email) {
      params.set('email', email);
    }

    setState({ status: 'loading' });

    fetch(`/api/account/summary?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        const payload = (await response.json()) as AccountSummaryResponse;

        if (!response.ok || !isAccountSummaryResponse(payload)) {
          setState({
            status: 'error',
            message:
              'message' in payload
                ? payload.message
                : 'We could not load account data right now.',
            correlationId:
              'correlationId' in payload ? payload.correlationId : undefined,
          });
          return;
        }

        setState({
          status: 'ready',
          account: payload.account,
          correlationId: payload.correlationId,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'We could not load account data right now.',
        });
      });

    return () => controller.abort();
  }, [customerId, email]);

  if (state.status === 'ready') {
    return (
      <AccountSummaryContent
        account={state.account}
        correlationId={state.correlationId}
        devMode={Boolean(devMode)}
      />
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Account"
        description="Commerce activity, subscription status, payments, and service requests."
        actions={
          <Button variant="outline" asChild>
            <Link href="/settings/notifications">Email preferences</Link>
          </Button>
        }
      />

      {state.status === 'loading' ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-sm">
            Loading account data...
          </CardContent>
        </Card>
      ) : null}

      {state.status === 'idle' ? (
        <EmptyState
          title="Account context required"
          description="This page is ready for normalized commerce data, but it needs an authenticated customer context or an email/customerId query while auth is still mocked."
        />
      ) : null}

      {state.status === 'error' ? (
        <EmptyState
          title="Account data unavailable"
          description={
            devMode && state.correlationId
              ? `${state.message} Correlation ID: ${state.correlationId}`
              : state.message
          }
        />
      ) : null}
    </div>
  );
}
