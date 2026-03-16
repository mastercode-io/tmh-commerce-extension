import type {
  BillingFrequency,
  MonitoringClientData,
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
  const discountMonthly = getMonthlyDiscount(
    selections.filter((selection) => {
      const lineItem = lineItems.find(
        (candidate) => candidate.trademarkId === selection.trademarkId,
      );
      return Boolean(lineItem?.payableNow);
    }),
  );
  const totalMonthly = Math.max(0, subtotalMonthly - discountMonthly);
  const totalAnnual = totalMonthly * 10;
  const annualSaving = totalMonthly * 2;

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
      discountMonthly,
      totalMonthly,
      totalAnnual,
      annualSaving,
    },
  };
}
