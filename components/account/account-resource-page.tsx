'use client';

import * as React from 'react';
import Link from 'next/link';

import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type {
  OrderSummary,
  PaymentSummary,
  RequestSummary,
  SubscriptionSummary,
} from '@/lib/commerce/types';

type AccountResource = 'orders' | 'subscriptions' | 'payments' | 'requests';

type AccountResourceItem =
  | OrderSummary
  | SubscriptionSummary
  | PaymentSummary
  | RequestSummary;

type AccountResourceResponse =
  | {
      resource: AccountResource;
      customerId: string;
      items: AccountResourceItem[];
      correlationId: string;
    }
  | {
      code: string;
      message: string;
      correlationId: string;
    };

type AccountResourceLoadState =
  | { status: 'idle' | 'loading' }
  | {
      status: 'ready';
      items: AccountResourceItem[];
      customerId: string;
      correlationId: string;
    }
  | { status: 'error'; message: string; correlationId?: string };

const RESOURCE_TITLES: Record<AccountResource, string> = {
  orders: 'Orders',
  subscriptions: 'Subscriptions',
  payments: 'Payments',
  requests: 'Requests',
};

const RESOURCE_DESCRIPTIONS: Record<AccountResource, string> = {
  orders: 'Subscription and service request orders from Zoho.',
  subscriptions: 'Recurring commerce subscriptions and their normalized statuses.',
  payments: 'Payment attempts, successful collections, and provider references.',
  requests: 'Audit, renewal, application, and support requests.',
};

function isSuccessResponse(
  payload: AccountResourceResponse,
): payload is Extract<AccountResourceResponse, { items: AccountResourceItem[] }> {
  return 'items' in payload;
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

function isOrder(item: AccountResourceItem): item is OrderSummary {
  return 'orderId' in item && 'kind' in item && 'totalDueNow' in item;
}

function isSubscription(
  item: AccountResourceItem,
): item is SubscriptionSummary {
  return 'subscriptionId' in item && 'planFamily' in item;
}

function isPayment(item: AccountResourceItem): item is PaymentSummary {
  return 'paymentId' in item && 'amount' in item;
}

function itemKey(item: AccountResourceItem) {
  if (isOrder(item)) {
    return item.orderId;
  }

  if (isSubscription(item)) {
    return item.subscriptionId;
  }

  if (isPayment(item)) {
    return item.paymentId;
  }

  const request = item as RequestSummary;

  return request.requestId;
}

function AccountResourceRow({ item }: { item: AccountResourceItem }) {
  if (isOrder(item)) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-medium">{statusLabel(item.kind)}</div>
          <div className="text-muted-foreground text-xs">
            {formatDate(item.createdAt)} · Ref {item.reference}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            {formatCurrency(item.totalDueNow, item.currency)}
          </div>
          <Badge variant="outline">{statusLabel(item.status)}</Badge>
        </div>
      </div>
    );
  }

  if (isSubscription(item)) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-medium">{item.planFamily}</div>
          <div className="text-muted-foreground text-xs">
            {item.billingInterval} · {item.provider} · Ref {item.reference}
          </div>
        </div>
        <Badge variant="secondary">{statusLabel(item.status)}</Badge>
      </div>
    );
  }

  if (isPayment(item)) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="font-medium">
            {formatCurrency(item.amount, item.currency)}
          </div>
          <div className="text-muted-foreground text-xs">
            {item.provider} · Ref {item.reference}
          </div>
        </div>
        <Badge variant="secondary">{statusLabel(item.status)}</Badge>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="font-medium">{item.summary}</div>
        <div className="text-muted-foreground text-xs">
          {statusLabel(item.requestType)} · Updated {formatDate(item.updatedAt)} ·
          Ref {item.reference}
        </div>
      </div>
      <Badge variant="outline">{statusLabel(item.status)}</Badge>
    </div>
  );
}

export function AccountResourcePage({
  resource,
  customerId,
  email,
  devMode,
}: {
  resource: AccountResource;
  customerId?: string;
  email?: string;
  devMode?: boolean;
}) {
  const accountParams = new URLSearchParams();

  if (customerId) {
    accountParams.set('customerId', customerId);
  }

  if (email) {
    accountParams.set('email', email);
  }

  const accountQueryString = accountParams.toString();
  const accountQuery = accountQueryString ? `?${accountQueryString}` : '';
  const [state, setState] = React.useState<AccountResourceLoadState>({
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

    fetch(`/api/account/${resource}?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        const payload = (await response.json()) as AccountResourceResponse;

        if (!response.ok || !isSuccessResponse(payload)) {
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
          items: payload.items,
          customerId: payload.customerId,
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
  }, [customerId, email, resource]);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={RESOURCE_TITLES[resource]}
        description={RESOURCE_DESCRIPTIONS[resource]}
        actions={
          <>
            {resource === 'requests' ? (
              <Button asChild>
                <Link href={`/requests/new${accountQuery}`}>New request</Link>
              </Button>
            ) : null}
            <Button variant="outline" asChild>
              <Link href={`/account${accountQuery}`}>Account overview</Link>
            </Button>
          </>
        }
      />

      {state.status === 'loading' ? (
        <Card>
          <CardContent className="text-muted-foreground py-8 text-sm">
            Loading {RESOURCE_TITLES[resource].toLowerCase()}...
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

      {state.status === 'ready' ? (
        state.items.length ? (
          <div className="grid gap-3">
            {state.items.map((item) => (
              <AccountResourceRow key={itemKey(item)} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={`No ${RESOURCE_TITLES[resource].toLowerCase()} yet`}
            description="Zoho returned a valid empty result for this account."
          />
        )
      ) : null}

      {devMode && state.status === 'ready' ? (
        <Card>
          <CardContent className="text-muted-foreground grid gap-1 py-4 text-xs">
            <div>Customer ID: {state.customerId}</div>
            <div>Correlation ID: {state.correlationId}</div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
