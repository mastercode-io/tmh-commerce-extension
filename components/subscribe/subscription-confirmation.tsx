'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  Phone,
  ShieldCheck,
} from 'lucide-react';

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
import type {
  MonitoringConfirmationResponse,
  MonitoringPlan,
} from '@/lib/types/monitoring';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function planLabel(plan: MonitoringPlan) {
  switch (plan) {
    case 'monitoring_defence':
      return 'MAD';
    case 'monitoring_essentials':
      return 'Monitoring Essentials';
    case 'annual_review':
      return 'Annual Review';
  }
}

async function fetchConfirmation(token: string, session: string) {
  const response = await fetch(
    `/api/subscribe/monitoring/confirm?token=${encodeURIComponent(token)}&session=${encodeURIComponent(session)}`,
    { cache: 'no-store' },
  );
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      typeof data === 'object' &&
        data !== null &&
        'message' in data &&
        typeof data.message === 'string'
        ? data.message
        : 'Confirmation details could not be loaded.',
    );
  }

  return data as MonitoringConfirmationResponse;
}

export function SubscriptionConfirmation({
  token,
  session,
}: {
  token: string | null;
  session: string | null;
}) {
  const [state, setState] = React.useState<'loading' | 'error' | 'ready'>(
    token && session ? 'loading' : 'error',
  );
  const [payload, setPayload] =
    React.useState<MonitoringConfirmationResponse | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(
    token && session ? null : 'The confirmation session is missing or invalid.',
  );

  React.useEffect(() => {
    if (!token || !session) {
      return;
    }

    const safeToken = token;
    const safeSession = session;
    let cancelled = false;

    async function load() {
      try {
        const data = await fetchConfirmation(safeToken, safeSession);

        if (cancelled) {
          return;
        }

        setPayload(data);
        setState('ready');
      } catch (error) {
        if (cancelled) {
          return;
        }

        setState('error');
        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Confirmation details could not be loaded.',
        );
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [session, token]);

  if (state === 'loading') {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardHeader className="border-b">
          <CardTitle>Loading confirmation</CardTitle>
          <CardDescription>
            Fetching the result of your mock GoCardless checkout session.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <LoadingSkeleton lines={4} />
        </CardContent>
      </Card>
    );
  }

  if (state === 'error' || !payload) {
    return (
      <Card className="mx-auto max-w-3xl">
        <CardHeader className="border-b">
          <CardTitle>Confirmation unavailable</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardFooter className="justify-between">
          <div className="text-muted-foreground text-sm">
            Please return to the quote and try again.
          </div>
          <Button variant="outline" asChild>
            <Link href="/subscribe/monitoring?token=demo-monitoring-001">
              <ArrowLeft />
              Back to demo quote
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const amount =
    payload.billingFrequency === 'annual'
      ? payload.summary.totalAnnual
      : payload.summary.totalMonthly;

  return (
    <div className="mx-auto grid max-w-4xl gap-6">
      <Card className="ring-primary/15 bg-background ring-2">
        <CardHeader className="border-b">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge variant="secondary" className="mb-3">
                Subscription confirmed
              </Badge>
              <CardTitle className="flex items-center gap-2 text-3xl tracking-tight">
                <CheckCircle2 className="text-primary size-7" />
                You&apos;re all set, {payload.clientName}
              </CardTitle>
              <CardDescription className="mt-3 max-w-2xl">
                Your monitoring subscription has been created in the mock CRM
                and linked to the mock Direct Debit setup.
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/portfolio">Go to portal</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 pt-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="rounded-xl border">
              {payload.paidItems.map((item) => {
                const itemAmount =
                  payload.billingFrequency === 'annual'
                    ? (item.annualPrice ?? 0)
                    : (item.monthlyPrice ?? 0);

                return (
                  <div
                    key={item.trademarkId}
                    className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 last:border-b-0"
                  >
                    <div>
                      <div className="font-medium">{item.trademarkName}</div>
                      <div className="text-muted-foreground mt-1 text-sm">
                        {planLabel(item.plan)}
                      </div>
                    </div>
                    <div className="text-sm font-medium">
                      {formatMoney(itemAmount)}
                      {payload.billingFrequency === 'annual' ? '/year' : '/mo'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-3 rounded-xl border p-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="text-primary size-4" />
                Payment summary
              </div>
              <div className="text-2xl font-semibold">
                {formatMoney(amount)}
                <span className="text-muted-foreground text-sm font-normal">
                  /{payload.billingFrequency === 'annual' ? 'year' : 'month'}
                </span>
              </div>
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <CalendarDays className="size-4" />
                First collection: {payload.firstPaymentDate}
              </div>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border p-4">
            <div className="text-sm font-medium">What happens next</div>
            <ul className="text-muted-foreground grid gap-2 text-sm">
              <li>Your monitoring service will begin within 24 hours.</li>
              <li>You will receive a confirmation email shortly.</li>
              <li>
                Monitoring items will appear in the portal once the backend
                integration is live.
              </li>
            </ul>
          </div>

          {payload.followUpItems.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="text-sm font-medium text-amber-950">
                Still to arrange
              </div>
              <p className="mt-2 text-sm text-amber-900/80">
                These items were not included in today&apos;s payment because
                they still need a short review call before MAD pricing can be
                confirmed.
              </p>
              <ul className="mt-3 grid gap-2 text-sm text-amber-950">
                {payload.followUpItems.map((item) => (
                  <li
                    key={item.trademarkId}
                    className="flex items-center justify-between gap-3"
                  >
                    <span>{item.trademarkName}</span>
                    <span>{planLabel(item.plan)}</span>
                  </li>
                ))}
              </ul>
              {payload.bookingUrl ? (
                <Button asChild className="mt-4">
                  <Link
                    href={payload.bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open mock Zoho Bookings
                    <ExternalLink />
                  </Link>
                </Button>
              ) : null}
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Phone className="size-4" />
            Questions? Call {payload.helpPhoneNumber}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link
                href={`/subscribe/monitoring?token=${encodeURIComponent(token ?? 'demo-monitoring-001')}`}
              >
                <ArrowLeft />
                Back to quote
              </Link>
            </Button>
            <Button asChild>
              <Link href="/portfolio">Portal overview</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
