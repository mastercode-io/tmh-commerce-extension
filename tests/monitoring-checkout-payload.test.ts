import test from 'node:test';
import assert from 'node:assert/strict';

import { buildMonitoringCheckoutIntentPayload } from '../lib/monitoring/pricing.ts';
import type { MonitoringClientData, TrademarkSelection } from '../lib/types/monitoring.ts';

test('buildMonitoringCheckoutIntentPayload includes only selected trademarks with applied discounts', () => {
  const clientData: MonitoringClientData = {
    token: 'abc',
    clientName: 'Test Client',
    clientLocation: 'UK',
    helpPhoneNumber: '01618335400',
    helpEmail: 'test@example.com',
    bookingUrl: 'https://bookings.example.com',
    trademarks: [
      {
        id: 'tm-1',
        name: 'Alpha',
        brandName: 'Alpha',
        type: 'word_mark',
        jurisdiction: 'UK',
        registrationNumber: 'UK1',
        status: 'registered',
      },
      {
        id: 'tm-2',
        name: 'Beta',
        brandName: 'Beta',
        type: 'word_mark',
        jurisdiction: 'UK',
        registrationNumber: 'UK2',
        status: 'registered',
      },
      {
        id: 'tm-3',
        name: 'Gamma',
        brandName: 'Gamma',
        type: 'figurative',
        jurisdiction: 'UK',
        registrationNumber: 'UK3',
        status: 'registered',
      },
    ],
  };

  const selections: TrademarkSelection[] = [
    { trademarkId: 'tm-1', plan: 'monitoring_essentials', selected: true },
    { trademarkId: 'tm-2', plan: 'monitoring_essentials', selected: true },
    { trademarkId: 'tm-3', plan: 'annual_review', selected: false },
  ];

  const quote = {
    billingFrequency: 'monthly' as const,
    lineItems: [],
    payableNowLineItems: [],
    followUpLineItems: [],
    planBreakdown: [],
    summary: {
      selectedCount: 2,
      payableNowCount: 2,
      requiresQuoteCount: 0,
      subtotalMonthly: 48,
      subtotalAnnual: 480,
      discountMonthly: 12,
      discountAnnual: 120,
      totalMonthly: 36,
      totalAnnual: 360,
      vatMonthly: 7.2,
      vatAnnual: 72,
      payableTotalMonthly: 43.2,
      payableTotalAnnual: 432,
      annualSaving: 86.4,
    },
  };

  const payload = buildMonitoringCheckoutIntentPayload(
    clientData,
    'monthly',
    selections,
    quote,
  );

  assert.deepEqual(payload, {
    billingFrequency: 'monthly',
    selectedTrademarks: [
      {
        trademarkId: 'tm-1',
        name: 'Alpha',
        brandName: 'Alpha',
        jurisdiction: 'UK',
        registrationNumber: 'UK1',
        plan: 'monitoring_essentials',
        billingFrequency: 'monthly',
        payableNow: true,
        requiresQuote: false,
        appliedPrice: 24,
        currency: 'GBP',
      },
      {
        trademarkId: 'tm-2',
        name: 'Beta',
        brandName: 'Beta',
        jurisdiction: 'UK',
        registrationNumber: 'UK2',
        plan: 'monitoring_essentials',
        billingFrequency: 'monthly',
        payableNow: true,
        requiresQuote: false,
        appliedPrice: 12,
        currency: 'GBP',
      },
    ],
    summary: {
      billingFrequency: 'monthly',
      selectedCount: 2,
      fullPriceSubtotal: 48,
      discount: 12,
      subtotal: 36,
      vat: 7.2,
      payableTotal: 43.2,
    },
  });
});
