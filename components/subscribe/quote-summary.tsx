'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, ExternalLink, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { MonitoringPlan, MonitoringQuoteResponse, TrademarkSelection } from '@/lib/types/monitoring';

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

export function QuoteSummary({
  quote,
  selections,
  billingFrequency,
  bookingUrl,
  quoteLoading,
  checkoutPending,
  paymentMonitoringActive,
  quoteError,
  onCheckout,
}: {
  quote: MonitoringQuoteResponse | null;
  selections: Record<string, TrademarkSelection>;
  billingFrequency: 'monthly' | 'annual';
  bookingUrl?: string;
  quoteLoading?: boolean;
  checkoutPending?: boolean;
  paymentMonitoringActive?: boolean;
  quoteError?: string | null;
  onCheckout: () => void;
}) {
  const selectedItems =
    quote?.lineItems.filter((item) => selections[item.trademarkId]?.selected) ??
    [];
  const payableItems = selectedItems.filter((item) => !item.requiresQuote);
  const followUpItems = selectedItems.filter((item) => item.requiresQuote);

  const currentTotal =
    billingFrequency === 'annual'
      ? (quote?.summary.payableTotalAnnual ?? 0)
      : (quote?.summary.payableTotalMonthly ?? 0);
  const displayedSubtotal =
    billingFrequency === 'annual'
      ? (quote?.summary.subtotalAnnual ?? 0)
      : (quote?.summary.subtotalMonthly ?? 0);
  const displayedDiscount =
    billingFrequency === 'annual'
      ? (quote?.summary.discountAnnual ?? 0)
      : (quote?.summary.discountMonthly ?? 0);
  const displayedVat =
    billingFrequency === 'annual'
      ? (quote?.summary.vatAnnual ?? 0)
      : (quote?.summary.vatMonthly ?? 0);
  const ctaLabel = paymentMonitoringActive
    ? 'Waiting for payment...'
    : 'Continue to payment';

  return (
    <Card className="sticky top-24">
      <CardHeader className="border-b">
        <CardTitle>Quote summary</CardTitle>
        <CardDescription>
          Review what is payable now versus what still needs a short follow-up
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        {quoteError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {quoteError}
          </div>
        ) : null}

        <div className="grid gap-3 rounded-xl border p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">
              Selected trademarks
            </span>
            <span className="font-medium">{selectedItems.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">Payable now</span>
            <span className="font-medium">{payableItems.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-sm">
              Requires follow-up
            </span>
            <span className="font-medium">{followUpItems.length}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <span className="text-muted-foreground text-sm">Subtotal</span>
            <span className="font-medium">
              {formatMoney(displayedSubtotal)}
            </span>
          </div>
          {quote && displayedDiscount > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">Discount</span>
              <span className="font-medium text-green-700">
                -{formatMoney(displayedDiscount)}
              </span>
            </div>
          ) : null}
          {quote && displayedVat > 0 ? (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-sm">VAT</span>
              <span className="font-medium">{formatMoney(displayedVat)}</span>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-3 border-t pt-3">
            <span className="text-sm font-medium">
              Total payable{' '}
              {billingFrequency === 'annual' ? 'per year' : 'per month'}
            </span>
            <span className="text-lg font-semibold">
              {formatMoney(currentTotal)}
              <span className="text-muted-foreground text-sm font-normal">
                /{billingFrequency === 'annual' ? 'year' : 'mo'}
              </span>
            </span>
          </div>
          {billingFrequency === 'annual' && quote ? (
            <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800">
              Saved {formatMoney(quote.summary.annualSaving)} per year compared
              with the monthly subscription
            </div>
          ) : null}
        </div>

        <div className="grid gap-3">
          {followUpItems.length ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
              <div className="flex items-start gap-2 text-amber-950">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <div className="text-sm font-medium">Still to arrange</div>
                  <ul className="mt-2 grid gap-2 text-sm text-amber-900">
                    {followUpItems.map((item) => (
                      <li
                        key={item.trademarkId}
                        className="flex items-center justify-between gap-3"
                      >
                        <span>{item.trademarkName}</span>
                        <span>{planLabel(item.plan)}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-sm text-amber-900/80">
                    These MAD items are not included in today&apos;s payment, book
                    a short call so we can finish the quote
                  </p>
                  {bookingUrl ? (
                    <Button asChild size="sm" className="mt-3">
                      <Link href={bookingUrl} target="_blank" rel="noreferrer">
                        Schedule follow-up call
                        <ExternalLink />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>
      <div className="flex justify-end px-6 pb-6">
        <Button
          onClick={onCheckout}
          disabled={
            checkoutPending ||
            quoteLoading ||
            paymentMonitoringActive ||
            payableItems.length === 0
          }
          className="min-w-[220px]"
        >
          {checkoutPending ? <Loader2 className="animate-spin" /> : null}
          {ctaLabel}
          <ArrowRight />
        </Button>
      </div>
    </Card>
  );
}
