export type BillingInterval = 'monthly' | 'annual';

export type OrderStatus =
  | 'draft'
  | 'pending_checkout'
  | 'pending_confirmation'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

export type SubscriptionStatus =
  | 'pending_checkout'
  | 'pending_confirmation'
  | 'active'
  | 'past_due'
  | 'cancel_at_period_end'
  | 'cancelled';

export type PaymentStatus =
  | 'initiated'
  | 'pending'
  | 'succeeded'
  | 'failed'
  | 'cancelled';

export type RequestStatus =
  | 'submitted'
  | 'triaged'
  | 'awaiting_customer'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type RequestType = 'audit' | 'renewal' | 'application' | 'support';

export type OrderKind = 'subscription' | 'service_request';

export type OrderLineType =
  | 'subscription_package'
  | 'service_request'
  | 'follow_up_quote';

export type OrderLineDisposition = 'payable_now' | 'requires_follow_up';

export type PreferenceSyncStatus = 'synced' | 'pending_sync' | 'sync_failed';

export type CustomerSummary = {
  customerId: string;
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
};

export type SubscriptionSummary = {
  subscriptionId: string;
  orderId: string;
  provider: string;
  planFamily: string;
  billingInterval: BillingInterval;
  status: SubscriptionStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  startedAt?: string;
  lastPaidAt?: string;
  reference: string;
};

export type OrderSummary = {
  orderId: string;
  kind: OrderKind;
  status: OrderStatus;
  billingInterval?: BillingInterval;
  currency: string;
  totalDueNow: number;
  totalFollowUp?: number;
  createdAt: string;
  confirmedAt?: string;
  reference: string;
};

export type OrderLineSummary = {
  orderLineId: string;
  orderId?: string;
  lineType: OrderLineType;
  label: string;
  plan?: string;
  quantity: number;
  unitPrice?: number;
  billingInterval?: BillingInterval;
  disposition: OrderLineDisposition;
  sourceRecordId?: string;
};

export type PaymentSummary = {
  paymentId: string;
  orderId: string;
  subscriptionId?: string;
  provider: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  reference: string;
};

export type RequestSummary = {
  requestId: string;
  requestType: RequestType;
  status: RequestStatus;
  summary: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  reference: string;
};

export type PreferenceProfileSummary = {
  customerId?: string;
  email: string;
  globalOptOut: boolean;
  categories: unknown[];
  updatedAt?: string;
  crmSyncStatus?: PreferenceSyncStatus;
  isNew?: boolean;
};

export type CheckoutIntentSummary = {
  checkoutIntentId: string;
  orderId: string;
  customerId: string;
  token?: string;
  billingInterval: BillingInterval;
  paymentStatus: PaymentStatus;
  reference: string;
  createdAt: string;
};

export type CommerceAccountSummary = {
  customer: CustomerSummary;
  orders: OrderSummary[];
  subscriptions: SubscriptionSummary[];
  payments: PaymentSummary[];
  requests: RequestSummary[];
};

export type CreateCommerceRequestInput = {
  customerId: string;
  requestType: RequestType;
  summary: string;
  orderId?: string;
  details?: Record<string, unknown>;
};
