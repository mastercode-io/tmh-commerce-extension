import type {
  BillingFrequency,
  MonitoringClientData,
  MonitoringCheckoutIntentPayload,
  MonitoringCheckoutIntentTrademark,
  MonitoringPlan,
  MonitoringPlanBreakdown,
  MonitoringQuoteLineItem,
  MonitoringQuoteResponse,
  MonitoringTrademark,
  TrademarkSelection,
} from '@/lib/types/monitoring';

function getSelectedTrademarkMap(clientData: MonitoringClientData) {
  return new Map(
    clientData.trademarks.map((trademark) => [trademark.id, trademark]),
  );
}

function getNominalMonthlyPrice(
  trademark: MonitoringTrademark,
  plan: MonitoringPlan,
): number | null {
  switch (plan) {
    case 'monitoring_essentials':
      return 24;
    case 'annual_review':
      return 14;
    case 'monitoring_defence':
      if (!trademark.riskProfile) {
        return null;
      }

      if (trademark.riskProfile === 'low') {
        return 49;
      }

      if (trademark.riskProfile === 'medium') {
        return trademark.status === 'registered' ? 79 : 99;
      }

      return trademark.status === 'registered' ? 99 : 149;
  }
}

function getMonthlyDiscount(selections: TrademarkSelection[]): number {
  const selectedEssentials = selections.filter(
    (selection) =>
      selection.selected && selection.plan === 'monitoring_essentials',
  ).length;
  const selectedAnnual = selections.filter(
    (selection) => selection.selected && selection.plan === 'annual_review',
  ).length;

  const essentialsDiscount = Math.max(0, selectedEssentials - 1) * 12;
  const annualDiscount = Math.max(0, selectedAnnual - 1) * 7;

  return essentialsDiscount + annualDiscount;
}

function getAppliedPriceForSelection(args: {
  selection: TrademarkSelection;
  nominalMonthlyPrice: number | null;
  planOccurrences: Record<MonitoringPlan, number>;
  billingFrequency: BillingFrequency;
}) {
  const { selection, nominalMonthlyPrice, planOccurrences, billingFrequency } = args;

  if (nominalMonthlyPrice === null) {
    return null;
  }

  const occurrence = (planOccurrences[selection.plan] ?? 0) + 1;
  planOccurrences[selection.plan] = occurrence;

  if (selection.plan === 'monitoring_essentials') {
    return billingFrequency === 'monthly'
      ? occurrence === 1
        ? 24
        : 12
      : occurrence === 1
        ? 240
        : 120;
  }

  if (selection.plan === 'annual_review') {
    return billingFrequency === 'monthly'
      ? occurrence === 1
        ? 14
        : 7
      : occurrence === 1
        ? 140
        : 70;
  }

  return billingFrequency === 'monthly'
    ? nominalMonthlyPrice
    : nominalMonthlyPrice * 10;
}

function buildPlanBreakdown(
  lineItems: MonitoringQuoteLineItem[],
): MonitoringPlanBreakdown[] {
  return (
    ['monitoring_defence', 'monitoring_essentials', 'annual_review'] as const
  ).map((plan) => {
    const relevantItems = lineItems.filter(
      (lineItem) => lineItem.plan === plan && lineItem.selected,
    );

    return {
      plan,
      selectedCount: relevantItems.length,
      payableNowCount: relevantItems.filter((lineItem) => lineItem.payableNow)
        .length,
      requiresQuoteCount: relevantItems.filter(
        (lineItem) => lineItem.requiresQuote,
      ).length,
    };
  });
}

function shouldApplyVat(clientData: MonitoringClientData) {
  return clientData.clientLocation === 'UK';
}

export function createDefaultSelections(
  clientData: MonitoringClientData,
  plan: MonitoringPlan,
): TrademarkSelection[] {
  return clientData.trademarks.map((trademark) => ({
    trademarkId: trademark.id,
    plan,
    selected: true,
  }));
}

export function calculateMonitoringQuote(
  clientData: MonitoringClientData,
  billingFrequency: BillingFrequency,
  selections: TrademarkSelection[],
): MonitoringQuoteResponse {
  const trademarksById = getSelectedTrademarkMap(clientData);

  const lineItems = selections
    .map<MonitoringQuoteLineItem | null>((selection) => {
      const trademark = trademarksById.get(selection.trademarkId);

      if (!trademark) {
        return null;
      }

      const nominalMonthlyPrice = getNominalMonthlyPrice(
        trademark,
        selection.plan,
      );
      const requiresQuote =
        selection.plan === 'monitoring_defence' && nominalMonthlyPrice === null;

      return {
        trademarkId: trademark.id,
        trademarkName: trademark.name,
        brandName: trademark.brandName,
        plan: selection.plan,
        selected: selection.selected,
        payableNow: selection.selected && !requiresQuote,
        requiresQuote,
        monthlyPrice: nominalMonthlyPrice,
        annualPrice:
          nominalMonthlyPrice === null ? null : nominalMonthlyPrice * 10,
      };
    })
    .filter(
      (lineItem): lineItem is MonitoringQuoteLineItem => lineItem !== null,
    );

  const payableNowLineItems = lineItems.filter(
    (lineItem) => lineItem.payableNow,
  );
  const followUpLineItems = lineItems.filter(
    (lineItem) => lineItem.selected && lineItem.requiresQuote,
  );

  const subtotalMonthly = payableNowLineItems.reduce(
    (total, lineItem) => total + (lineItem.monthlyPrice ?? 0),
    0,
  );
  const subtotalAnnual = payableNowLineItems.reduce(
    (total, lineItem) => total + (lineItem.annualPrice ?? 0),
    0,
  );
  const discountMonthly = getMonthlyDiscount(
    selections.filter((selection) => {
      const lineItem = lineItems.find(
        (candidate) => candidate.trademarkId === selection.trademarkId,
      );
      return Boolean(lineItem?.payableNow);
    }),
  );
  const discountAnnual = discountMonthly * 10;
  const totalMonthly = Math.max(0, subtotalMonthly - discountMonthly);
  const totalAnnual = Math.max(0, subtotalAnnual - discountAnnual);
  const vatMonthly = shouldApplyVat(clientData) ? totalMonthly * 0.2 : 0;
  const vatAnnual = shouldApplyVat(clientData) ? totalAnnual * 0.2 : 0;
  const payableTotalMonthly = totalMonthly + vatMonthly;
  const payableTotalAnnual = totalAnnual + vatAnnual;
  const annualSaving = Math.max(
    0,
    payableTotalMonthly * 12 - payableTotalAnnual,
  );

  return {
    billingFrequency,
    lineItems,
    payableNowLineItems,
    followUpLineItems,
    planBreakdown: buildPlanBreakdown(lineItems),
    summary: {
      selectedCount: lineItems.filter((lineItem) => lineItem.selected).length,
      payableNowCount: payableNowLineItems.length,
      requiresQuoteCount: followUpLineItems.length,
      subtotalMonthly,
      subtotalAnnual,
      discountMonthly,
      discountAnnual,
      totalMonthly,
      totalAnnual,
      vatMonthly,
      vatAnnual,
      payableTotalMonthly,
      payableTotalAnnual,
      annualSaving,
    },
  };
}

export function buildMonitoringCheckoutIntentPayload(
  clientData: MonitoringClientData,
  billingFrequency: BillingFrequency,
  selections: TrademarkSelection[],
  quote: MonitoringQuoteResponse,
): MonitoringCheckoutIntentPayload {
  const trademarksById = getSelectedTrademarkMap(clientData);
  const planOccurrences: Record<MonitoringPlan, number> = {
    monitoring_defence: 0,
    monitoring_essentials: 0,
    annual_review: 0,
  };

  const selectedTrademarks = selections
    .filter((selection) => selection.selected)
    .map<MonitoringCheckoutIntentTrademark | null>((selection) => {
      const trademark = trademarksById.get(selection.trademarkId);

      if (!trademark) {
        return null;
      }

      const nominalMonthlyPrice = getNominalMonthlyPrice(trademark, selection.plan);
      const requiresQuote =
        selection.plan === 'monitoring_defence' && nominalMonthlyPrice === null;

      return {
        trademarkId: trademark.id,
        name: trademark.name,
        brandName: trademark.brandName,
        type: trademark.type,
        jurisdiction: trademark.jurisdiction,
        registrationNumber: trademark.registrationNumber,
        plan: selection.plan,
        billingFrequency,
        payableNow: !requiresQuote,
        requiresQuote,
        appliedPrice: getAppliedPriceForSelection({
          selection,
          nominalMonthlyPrice,
          planOccurrences,
          billingFrequency,
        }),
        currency: 'GBP',
      };
    })
    .filter(
      (trademark): trademark is MonitoringCheckoutIntentTrademark =>
        trademark !== null,
    );

  return {
    billingFrequency,
    selectedTrademarks,
    summary: {
      billingFrequency,
      selectedCount: quote.summary.selectedCount,
      fullPriceSubtotal:
        billingFrequency === 'annual'
          ? quote.summary.subtotalAnnual
          : quote.summary.subtotalMonthly,
      discount:
        billingFrequency === 'annual'
          ? quote.summary.discountAnnual
          : quote.summary.discountMonthly,
      subtotal:
        billingFrequency === 'annual'
          ? quote.summary.totalAnnual
          : quote.summary.totalMonthly,
      vat:
        billingFrequency === 'annual'
          ? quote.summary.vatAnnual
          : quote.summary.vatMonthly,
      payableTotal:
        billingFrequency === 'annual'
          ? quote.summary.payableTotalAnnual
          : quote.summary.payableTotalMonthly,
    },
  };
}
