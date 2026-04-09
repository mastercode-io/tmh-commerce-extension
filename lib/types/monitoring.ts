export type MonitoringPlan =
  | 'monitoring_defence'
  | 'monitoring_essentials'
  | 'annual_review';

export type BillingFrequency = 'monthly' | 'annual';

export type MonitoringRiskProfile = 'low' | 'medium' | 'high';
export type MonitoringClientLocation = 'UK' | 'INT';

export type MonitoringTrademarkStatus = 'pending' | 'registered' | 'expired';

export type MonitoringTrademarkType = 'word_mark' | 'figurative' | 'combined';

export type MonitoringApiErrorCode =
  | 'invalid_token'
  | 'expired_token'
  | 'no_trademarks'
  | 'server_error'
  | 'upstream_error'
  | 'config_error'
  | 'invalid_request'
  | 'invalid_session'
  | 'nothing_payable';

export interface MonitoringTrademark {
  id: string;
  name: string;
  brandName: string;
  type: MonitoringTrademarkType;
  jurisdiction: string;
  applicationDate?: string;
  registrationDate?: string;
  expiryDate?: string;
  registrationNumber?: string;
  status: MonitoringTrademarkStatus;
  riskProfile?: MonitoringRiskProfile;
  imageUrl?: string;
}

export interface MonitoringClientData {
  token: string;
  clientName: string;
  companyName?: string;
  clientLocation?: MonitoringClientLocation;
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl: string;
  trademarks: MonitoringTrademark[];
  preSelectedPlan?: MonitoringPlan;
}

export interface TrademarkSelection {
  trademarkId: string;
  plan: MonitoringPlan;
  selected: boolean;
}

export interface MonitoringQuoteLineItem {
  trademarkId: string;
  trademarkName: string;
  brandName: string;
  plan: MonitoringPlan;
  selected: boolean;
  payableNow: boolean;
  requiresQuote: boolean;
  monthlyPrice: number | null;
  annualPrice: number | null;
}

export interface MonitoringPlanBreakdown {
  plan: MonitoringPlan;
  selectedCount: number;
  payableNowCount: number;
  requiresQuoteCount: number;
}

export interface MonitoringQuoteSummary {
  selectedCount: number;
  payableNowCount: number;
  requiresQuoteCount: number;
  subtotalMonthly: number;
  subtotalAnnual: number;
  discountMonthly: number;
  discountAnnual: number;
  totalMonthly: number;
  totalAnnual: number;
  vatMonthly: number;
  vatAnnual: number;
  payableTotalMonthly: number;
  payableTotalAnnual: number;
  annualSaving: number;
}

export interface MonitoringQuoteResponse {
  billingFrequency: BillingFrequency;
  lineItems: MonitoringQuoteLineItem[];
  payableNowLineItems: MonitoringQuoteLineItem[];
  followUpLineItems: MonitoringQuoteLineItem[];
  planBreakdown: MonitoringPlanBreakdown[];
  summary: MonitoringQuoteSummary;
}

export interface MonitoringQuoteRequest {
  token: string;
  billingFrequency: BillingFrequency;
  selections: TrademarkSelection[];
}

export interface MockCheckoutSession {
  token: string;
  clientName: string;
  companyName?: string;
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl: string;
  billingFrequency: BillingFrequency;
  quote: MonitoringQuoteResponse;
  firstPaymentDate: string;
  reference: string;
  createdAt: string;
}

export interface MonitoringCheckoutRequest {
  token: string;
  billingFrequency: BillingFrequency;
  selections: TrademarkSelection[];
}

export interface MonitoringCheckoutIntentTrademark {
  trademarkId: string;
  name: string;
  brandName: string;
  type: MonitoringTrademarkType;
  jurisdiction: string;
  registrationNumber?: string;
  plan: MonitoringPlan;
  billingFrequency: BillingFrequency;
  payableNow: boolean;
  requiresQuote: boolean;
  appliedPrice: number | null;
  currency: 'GBP';
}

export interface MonitoringCheckoutIntentPayload {
  billingFrequency: BillingFrequency;
  selectedTrademarks: MonitoringCheckoutIntentTrademark[];
  summary: {
    billingFrequency: BillingFrequency;
    selectedCount: number;
    fullPriceSubtotal: number;
    discount: number;
    subtotal: number;
    vat: number;
    payableTotal: number;
  };
}

export interface MonitoringCheckoutResponse {
  redirectUrl: string;
  session: string;
  reference: string;
}

export interface MonitoringConfirmationResponse {
  clientName: string;
  companyName?: string;
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl: string;
  billingFrequency: BillingFrequency;
  firstPaymentDate: string;
  reference: string;
  paidItems: MonitoringQuoteLineItem[];
  followUpItems: MonitoringQuoteLineItem[];
  summary: MonitoringQuoteSummary;
}

export interface MonitoringApiError {
  code: MonitoringApiErrorCode;
  message: string;
}
