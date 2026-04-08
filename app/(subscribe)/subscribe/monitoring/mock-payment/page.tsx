import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  BadgePoundSterling,
  CalendarCheck2,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';

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
import type { MockCheckoutSession } from '@/lib/types/monitoring';
import { canUseMockMonitoringSubscription } from '@/lib/monitoring/config';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

const planLabels: Record<
  MockCheckoutSession['quote']['payableNowLineItems'][number]['plan'],
  string
> = {
  monitoring_defence: 'MAD',
  monitoring_essentials: 'Monitoring Essentials',
  annual_review: 'Annual Review',
};

export default async function MockPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; session?: string }>;
}) {
  if (!canUseMockMonitoringSubscription()) {
    notFound();
  }

  const { token, session: sessionParam } = await searchParams;

  let session: MockCheckoutSession | null = null;

  if (sessionParam) {
    try {
      session = JSON.parse(sessionParam) as MockCheckoutSession;
    } catch {
      session = null;
    }
  }

  if (!token || !session) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardHeader className="border-b">
          <CardTitle>Hosted payment unavailable</CardTitle>
          <CardDescription>
            The local payment session is missing or invalid.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-between">
          <div className="text-muted-foreground text-sm">
            Please return to the quote and try again.
          </div>
          <Button variant="outline" asChild>
            <Link href="/subscribe/monitoring?token=demo-monitoring-001">
              <ArrowLeft />
              Open subscription quote
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  const amount =
    session.billingFrequency === 'annual'
      ? session.quote.summary.totalAnnual
      : session.quote.summary.totalMonthly;
  const successHref = `/subscribe/monitoring/confirm?token=${encodeURIComponent(token)}&session=${encodeURIComponent(sessionParam ?? '')}`;
  const cancelHref = `/subscribe/monitoring?token=${encodeURIComponent(token)}&checkout=cancelled`;
  const failureHref = `/subscribe/monitoring?token=${encodeURIComponent(token)}&checkout=failed`;
  const backHref = `/subscribe/monitoring?token=${encodeURIComponent(token)}`;

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Badge variant="secondary" className="mb-3">
            Local hosted payment simulator
          </Badge>
          <h1 className="text-3xl font-semibold tracking-tight">
            Set up your subscription payment
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            This local-only page simulates the external hosted payment journey
            so success, cancel, and failure return states can be exercised end
            to end before the Zoho/Xero hosted gateway is available.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href={backHref}>
            <ArrowLeft />
            Back to quote
          </Link>
        </Button>
      </div>

      <Card className="ring-primary/15 bg-background ring-2">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="text-primary size-5" />
            Secure mandate summary
          </CardTitle>
          <CardDescription>
            Client: {session.clientName}. Billing cadence:{' '}
            {session.billingFrequency}.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-muted/40 rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                <BadgePoundSterling className="size-4" />
                Amount due
              </div>
              <div className="mt-2 text-2xl font-semibold">
                {formatMoney(amount)}
                <span className="text-muted-foreground text-sm font-normal">
                  /{session.billingFrequency === 'annual' ? 'year' : 'month'}
                </span>
              </div>
            </div>
            <div className="bg-muted/40 rounded-xl border p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs tracking-[0.16em] uppercase">
                <CalendarCheck2 className="size-4" />
                First collection
              </div>
              <div className="mt-2 text-base font-medium">1 April 2026</div>
            </div>
          </div>

          <div className="rounded-xl border">
            {session.quote.payableNowLineItems.map((item) => {
              const itemAmount =
                session.billingFrequency === 'annual'
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
                      {planLabels[item.plan]}
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {formatMoney(itemAmount)}
                    {session.billingFrequency === 'annual' ? '/year' : '/mo'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <CreditCard className="size-4" />
            No real payment details are collected in this local simulator.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link href={cancelHref}>Return as cancelled</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={failureHref}>Simulate failure</Link>
            </Button>
            <Button asChild>
              <Link href={successHref}>Complete setup</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
