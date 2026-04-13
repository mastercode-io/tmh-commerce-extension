import type {
  Address,
  OrderStatus,
  OrderSummary,
  PaymentSummary,
  RequestSummary,
} from '@/lib/commerce/types';

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
    items: TemmyResultItem[];
  };
}

export interface TemmyResultItem {
  application_number: string;
  verbal_element_text: string;
  status: string;
  expiry_date: string | null;
  applicants: Array<{ name: string }>;
}

export interface TemmySearchResponse {
  source: string;
  data: {
    items: TemmyResultItem[];
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

export interface AuditOrderLineItem {
  orderLineId?: string | null;
  orderId?: string | null;
  lineType?: string;
  label: string;
  quantity: number;
  unitPrice: number;
  disposition?: 'payable_now' | 'included' | 'informational' | string;
}

export interface AuditOrderResponse {
  orderId: string;
  dealId?: string | null;
  status: OrderStatus | string;
  currency: string;
  createdAt: string;
  updatedAt: string;
  request?: RequestSummary;
  sections: AuditSections;
  pricing: {
    lineItems: AuditOrderLineItem[];
    subtotal: number;
    vat: number;
    total: number;
  };
  payment?: PaymentSummary | null;
}

export interface CreateAuditPaymentRequest {
  paymentOptions: {
    termsAccepted: boolean;
  };
}

export interface CreateAuditPaymentResponse {
  orderId: string;
  checkoutUrl: string;
  order: OrderSummary;
  payment: PaymentSummary;
}

export interface AuditConfirmationResponse {
  orderId: string;
  paymentStatus: PaymentSummary['status'];
  confirmedAt?: string | null;
  reference?: string | null;
}
