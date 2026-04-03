'use client';

import { ImageIcon, Layers3, ShieldAlert, Type } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type {
  MonitoringPlan,
  MonitoringQuoteLineItem,
  MonitoringTrademark,
  TrademarkSelection,
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

function typeIcon(type: MonitoringTrademark['type']) {
  if (type === 'word_mark') {
    return Type;
  }

  if (type === 'figurative') {
    return ImageIcon;
  }

  return Layers3;
}

function typeLabel(type: MonitoringTrademark['type']) {
  if (type === 'word_mark') {
    return 'Word';
  }

  return 'Image';
}

function statusLabel(status: MonitoringTrademark['status']) {
  if (status === 'registered') {
    return 'Registered';
  }

  if (status === 'expired') {
    return 'Expired';
  }

  return 'Pending';
}

function priceLabel(
  lineItem: MonitoringQuoteLineItem | undefined,
  billingFrequency: 'monthly' | 'annual',
) {
  if (!lineItem) {
    return 'Unavailable';
  }

  if (lineItem.requiresQuote) {
    return 'Quote required';
  }

  const amount =
    billingFrequency === 'annual'
      ? lineItem.annualPrice
      : lineItem.monthlyPrice;

  if (amount === null) {
    return 'Quote required';
  }

  return `${formatMoney(amount)}${billingFrequency === 'annual' ? '/year' : '/mo'}`;
}

export function TrademarkSelectionTable({
  trademarks,
  selections,
  lineItems,
  billingFrequency,
  bookingUrl,
  quoteLoading,
  onToggleTrademark,
  onToggleAll,
  onPlanChange,
}: {
  trademarks: MonitoringTrademark[];
  selections: Record<string, TrademarkSelection>;
  lineItems: MonitoringQuoteLineItem[];
  billingFrequency: 'monthly' | 'annual';
  bookingUrl?: string;
  quoteLoading?: boolean;
  onToggleTrademark: (trademarkId: string, selected: boolean) => void;
  onToggleAll: (selected: boolean) => void;
  onPlanChange: (trademarkId: string, plan: MonitoringPlan) => void;
}) {
  const lineItemMap = new Map(
    lineItems.map((item) => [item.trademarkId, item]),
  );
  const allSelected = trademarks.every((item) => selections[item.id]?.selected);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Configure coverage by trademark
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Adjust plans per trademark, then review payable items and follow-up
            items in the summary
          </p>
        </div>
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="text-primary text-sm font-medium"
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>

      <div className="hidden rounded-xl border lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <span className="sr-only">Select</span>
              </TableHead>
              <TableHead>Trademark</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trademarks.map((trademark) => {
              const selection = selections[trademark.id];
              const lineItem = lineItemMap.get(trademark.id);
              const Icon = typeIcon(trademark.type);

              return (
                <TableRow
                  key={trademark.id}
                  data-state={selection?.selected ? 'selected' : undefined}
                >
                  <TableCell>
                    <input
                      aria-label={`Select ${trademark.name}`}
                      type="checkbox"
                      checked={selection?.selected ?? false}
                      onChange={(event) =>
                        onToggleTrademark(trademark.id, event.target.checked)
                      }
                      className="border-input text-primary accent-primary size-4 rounded"
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{trademark.name}</div>
                      <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline">{trademark.jurisdiction}</Badge>
                        <Badge variant="secondary">
                          {statusLabel(trademark.status)}
                        </Badge>
                        {trademark.brandName ? (
                          <span>Brand: {trademark.brandName}</span>
                        ) : null}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Icon className="text-muted-foreground size-4" />
                      {typeLabel(trademark.type)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={selection?.plan ?? 'monitoring_essentials'}
                      onValueChange={(value) =>
                        onPlanChange(trademark.id, value as MonitoringPlan)
                      }
                    >
                      <SelectTrigger className="w-[220px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monitoring_essentials">
                          Monitoring Essentials
                        </SelectItem>
                        <SelectItem value="annual_review">
                          Annual Review
                        </SelectItem>
                        <SelectItem value="monitoring_defence">MAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {priceLabel(lineItem, billingFrequency)}
                    </div>
                    <div className="text-muted-foreground mt-1 text-xs">
                      {selection?.selected ? (
                        quoteLoading ? (
                          'Refreshing quote...'
                        ) : lineItem?.requiresQuote ? (
                          bookingUrl ? (
                            <a
                              href={bookingUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary font-medium"
                            >
                              Book a call
                            </a>
                          ) : (
                            'Requires follow-up'
                          )
                        ) : (
                          planLabel(selection.plan)
                        )
                      ) : (
                        'Not included'
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 lg:hidden">
        {trademarks.map((trademark) => {
          const selection = selections[trademark.id];
          const lineItem = lineItemMap.get(trademark.id);
          const Icon = typeIcon(trademark.type);

          return (
            <div
              key={trademark.id}
              className={cn(
                'bg-background rounded-xl border p-4',
                selection?.selected && 'ring-primary/15 ring-2',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    aria-label={`Select ${trademark.name}`}
                    type="checkbox"
                    checked={selection?.selected ?? false}
                    onChange={(event) =>
                      onToggleTrademark(trademark.id, event.target.checked)
                    }
                    className="border-input text-primary accent-primary mt-1 size-4 rounded"
                  />
                  <div>
                    <div className="font-medium">{trademark.name}</div>
                    <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline">{trademark.jurisdiction}</Badge>
                      <Badge variant="secondary">
                        {statusLabel(trademark.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
                {lineItem?.requiresQuote ? (
                  <ShieldAlert className="size-4 text-amber-600" />
                ) : null}
              </div>

              <div className="mt-4 grid gap-3">
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Icon className="size-4" />
                  {typeLabel(trademark.type)}
                </div>

                <Select
                  value={selection?.plan ?? 'monitoring_essentials'}
                  onValueChange={(value) =>
                    onPlanChange(trademark.id, value as MonitoringPlan)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monitoring_essentials">
                      Monitoring Essentials
                    </SelectItem>
                    <SelectItem value="annual_review">Annual Review</SelectItem>
                    <SelectItem value="monitoring_defence">MAD</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-medium">
                    {priceLabel(lineItem, billingFrequency)}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {selection?.selected ? 'Selected' : 'Not included'}
                  </div>
                </div>

                {selection?.selected &&
                lineItem?.requiresQuote &&
                bookingUrl ? (
                  <a
                    href={bookingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary text-sm font-medium"
                  >
                    Book a call for this MAD quote
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
