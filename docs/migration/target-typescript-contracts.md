# Target TypeScript Contracts

This document provides code-ready TypeScript contracts for implementing the migrated flows in `tmh-commerce-extension`.

These are intentionally target-facing:
- camelCase only
- UI-safe contracts
- suitable for `features/renewals/lib/types.ts` and `features/audit/lib/types.ts`

They are not meant to mirror CRM payloads directly.

## 1. Shared Primitives

```ts
export type CurrencyCode = 'GBP' | string;

export type RequestType = 'renewal' | 'audit' | 'application' | 'support';

export type RequestStatus =
  | 'submitted'
  | 'in_review'
  | 'quoted'
  | 'pending_checkout'
  | 'paid'
  | 'completed'
  | 'cancelled';

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'pending_checkout'
  | 'paid'
  | 'completed'
  | 'cancelled'
  | 'failed';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export interface Address {
  line1: string;
  line2?: string | null;
  city: string;
  county?: string | null;
  postcode: string;
  country: string;
}

export interface RequestSummary {
  requestId: string;
  requestType: RequestType;
  status: RequestStatus;
  summary: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string | null;
  reference?: string | null;
}

export interface OrderSummary {
  orderId: string;
  kind: 'service_request' | string;
  status: OrderStatus;
  currency: CurrencyCode;
  totalDueNow: number;
  totalFollowUp?: number;
  createdAt: string;
  reference?: string | null;
}

export interface PaymentSummary {
  paymentId?: string | null;
  status: PaymentStatus;
  reference?: string | null;
  paymentUrl?: string | null;
  updatedAt?: string | null;
}
```

## 2. Renewal Contracts

```ts
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

export interface FlowContext {
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
  context?: FlowContext;
}

export interface OrderLineItem {
  orderLineId?: string | null;
  lineType?: string;
  sku?: string | null;
  label: string;
  quantity: number;
  unitPrice: number;
  total: number;
  disposition?: 'payable_now' | 'included' | 'informational' | string;
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
  }>;
  lineItems: OrderLineItem[];
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
  payment: PaymentSummary;
}

export interface RenewalPaymentStatusResponse {
  orderId: string;
  payment: PaymentSummary;
}
```

## 3. Audit Contracts

```ts
export type AuditSectionName =
  | 'contact'
  | 'preferences'
  | 'tmStatus'
  | 'temmy'
  | 'tmInfo'
  | 'goods'
  | 'billing'
  | 'appointment'
  | 'paymentOptions';

export interface AuditLeadRequest {
  token?: string;
  lead: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface AuditLeadResponse {
  token: string;
  lead: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  request?: RequestSummary;
}

export interface AuditContactSection {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface AuditPreferencesSection {
  methods: string[];
}

export interface AuditTmStatusSection {
  status: 'existing' | 'new' | string;
  tmAppNumber?: string;
  tmName?: string;
}

export interface AuditTemmySection {
  selected?: string | null;
  results?: {
    items: unknown[];
  };
}

export interface AuditTmInfoSection {
  types?: string[];
  name?: string;
  jurisdictions?: string[];
  otherJurisdiction?: string | null;
  imageUploadChoice?: 'yes' | 'later' | string;
  imageFile?: unknown;
}

export interface AuditGoodsSection {
  description?: string;
  website?: string;
}

export interface AuditBillingSection {
  type: 'Individual' | 'Organisation' | string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  address: Address;
  invoiceEmail?: string;
  invoicePhone?: string;
}

export interface AuditAppointmentSection {
  scheduled?: boolean;
  skipped?: boolean;
  slotId?: string | null;
}

export interface AuditPaymentOptionsSection {
  termsAccepted: boolean;
  socialMediaAddon?: boolean;
}

export interface AuditSections {
  contact?: AuditContactSection;
  preferences?: AuditPreferencesSection;
  tmStatus?: AuditTmStatusSection;
  temmy?: AuditTemmySection;
  tmInfo?: AuditTmInfoSection;
  goods?: AuditGoodsSection;
  billing?: AuditBillingSection;
  appointment?: AuditAppointmentSection;
  paymentOptions?: AuditPaymentOptionsSection;
}

export interface UpdateAuditSectionRequest<TSection = unknown> {
  orderId?: string;
  token?: string;
  section: AuditSectionName;
  data: TSection;
}

export interface UpdateAuditSectionResponse {
  orderId: string;
  success: boolean;
  message?: string | null;
  orderStatus?: OrderStatus | string;
  checkoutUrl?: string | null;
}

export interface AuditOrderResponse {
  orderId: string;
  dealId?: string | null;
  status: OrderStatus | string;
  currency: CurrencyCode;
  createdAt: string;
  updatedAt: string;
  request?: RequestSummary;
  sections: AuditSections;
  pricing: {
    lineItems: OrderLineItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  payment?: PaymentSummary | null;
}

export interface CreateAuditPaymentRequest {
  paymentOptions: {
    termsAccepted: boolean;
    socialMediaAddon?: boolean;
  };
}

export interface CreateAuditPaymentResponse {
  orderId: string;
  checkoutUrl: string;
  order: OrderSummary;
  payment: PaymentSummary;
}
```

## 4. Suggested Placement In The Target Repo

If the rebuild starts immediately, a good first cut is:

- `features/renewals/lib/types.ts`
- `features/audit/lib/types.ts`
- `lib/commerce/types.ts` only for truly shared primitives

Keep flow-specific payload contracts close to the flow, not buried in the generic commerce layer.
