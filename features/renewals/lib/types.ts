import type {
  Address,
  CurrencyCode,
  OrderSummary,
  PaymentSummary,
  RequestSummary,
} from '@/lib/commerce/types';

export interface RenewalAccount {
  type: 'organization' | 'individual' | string;
  name: string;
  companyNumber?: string | null;
  vatNumber?: string | null;
  address: Address;
}

export interface RenewalContact {
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string | null;
  phone?: string | null;
  position?: string | null;
}

export interface TrademarkClass {
  nice: string;
  description: string;
}

export interface TrademarkOwner {
  name: string;
  address: string;
}

export interface RenewalTrademark {
  id: string;
  wordMark: string;
  markType: string;
  status: string;
  jurisdiction: string;
  applicationNumber: string;
  registrationNumber?: string | null;
  applicationDate?: string | null;
  registrationDate?: string | null;
  expiryDate?: string | null;
  nextRenewalDate?: string | null;
  imageUrl?: string | null;
  classes: TrademarkClass[];
  classesCount: number;
  proprietor?: TrademarkOwner | null;
}

export interface RenewalLinks {
  bookCall?: string;
  termsConditions?: string;
  managePreferences?: string;
}

export interface RenewalDetailsResponse {
  token: string;
  account: RenewalAccount;
  contact: RenewalContact;
  primaryTrademark: RenewalTrademark;
  additionalRenewals: RenewalTrademark[];
  links?: RenewalLinks;
}

export interface RenewalScreening {
  ownershipChange: boolean;
  classesChange: boolean;
}

export interface RenewalSelection {
  primaryTrademarkId: string;
  selectedTrademarkIds: string[];
}

export interface RenewalConsents {
  authorisedToRenew: boolean;
  contactConsent: boolean;
}

export interface RenewalFlowContext {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPath?: string;
}

export interface CreateRenewalOrderRequest {
  token: string;
  source: 'renewal-landing' | string;
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  screening: RenewalScreening;
  selection: RenewalSelection;
  consents: RenewalConsents;
  context?: RenewalFlowContext;
}

export interface RenewalOrderLineItem {
  orderLineId?: string | null;
  lineType?: string;
  sku?: string | null;
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  disposition?: 'payable_now' | 'included' | 'informational' | string;
  sourceRecordId?: string | null;
}

export interface RenewalOrderDetails {
  orderId: string;
  dealToken?: string | null;
  currency: CurrencyCode;
  totals: {
    subtotal: number;
    vat: number;
    total: number;
  };
  trademarks: Array<{
    id: string;
    wordMark: string;
    registrationNumber?: string | null;
    applicationNumber?: string | null;
    markType?: string | null;
    classesCount?: number | null;
  }>;
  lineItems: RenewalOrderLineItem[];
}

export interface CreateRenewalOrderResponse {
  request: RequestSummary;
  order: OrderSummary;
  orderDetails: RenewalOrderDetails;
}

export interface RenewalOrderResponse {
  request?: RequestSummary;
  order: OrderSummary;
  orderDetails: RenewalOrderDetails;
  payment?: PaymentSummary | null;
}

export interface CreateRenewalPaymentLinkResponse {
  orderId: string;
  dealToken?: string | null;
  paymentUrl: string;
  payment: PaymentSummary;
}

export interface RenewalPaymentStatusResponse {
  orderId: string;
  paymentId?: string | null;
  status: PaymentSummary['status'];
  updatedAt?: string | null;
}

export interface RenewalConfirmationResponse {
  orderId: string;
  requestId?: string | null;
  paymentStatus: PaymentSummary['status'];
  confirmedAt?: string | null;
  reference?: string | null;
}
