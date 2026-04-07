import type {
  CommerceAccountSummary,
  CustomerSummary,
  OrderSummary,
  PaymentSummary,
  RequestSummary,
  SubscriptionSummary,
} from '@/lib/commerce/types';

function hasStringField<TField extends string>(
  value: unknown,
  field: TField,
): value is Record<TField, string> {
  const candidate = value as Record<string, unknown>;

  return (
    value !== null &&
    typeof value === 'object' &&
    field in candidate &&
    typeof candidate[field] === 'string'
  );
}

function hasNumberField<TField extends string>(
  value: unknown,
  field: TField,
): value is Record<TField, number> {
  const candidate = value as Record<string, unknown>;

  return (
    value !== null &&
    typeof value === 'object' &&
    field in candidate &&
    typeof candidate[field] === 'number'
  );
}

function hasBooleanField<TField extends string>(
  value: unknown,
  field: TField,
): value is Record<TField, boolean> {
  const candidate = value as Record<string, unknown>;

  return (
    value !== null &&
    typeof value === 'object' &&
    field in candidate &&
    typeof candidate[field] === 'boolean'
  );
}

export function isCustomerSummary(value: unknown): value is CustomerSummary {
  return (
    hasStringField(value, 'customerId') &&
    hasStringField(value, 'fullName') &&
    hasStringField(value, 'email')
  );
}

export function isOrderSummary(value: unknown): value is OrderSummary {
  return (
    hasStringField(value, 'orderId') &&
    hasStringField(value, 'kind') &&
    hasStringField(value, 'status') &&
    hasStringField(value, 'currency') &&
    hasNumberField(value, 'totalDueNow') &&
    hasStringField(value, 'createdAt') &&
    hasStringField(value, 'reference')
  );
}

export function isSubscriptionSummary(
  value: unknown,
): value is SubscriptionSummary {
  return (
    hasStringField(value, 'subscriptionId') &&
    hasStringField(value, 'orderId') &&
    hasStringField(value, 'provider') &&
    hasStringField(value, 'planFamily') &&
    hasStringField(value, 'billingInterval') &&
    hasStringField(value, 'status') &&
    hasBooleanField(value, 'cancelAtPeriodEnd') &&
    hasStringField(value, 'reference')
  );
}

export function isPaymentSummary(value: unknown): value is PaymentSummary {
  return (
    hasStringField(value, 'paymentId') &&
    hasStringField(value, 'orderId') &&
    hasStringField(value, 'provider') &&
    hasStringField(value, 'status') &&
    hasNumberField(value, 'amount') &&
    hasStringField(value, 'currency') &&
    hasStringField(value, 'reference')
  );
}

export function isRequestSummary(value: unknown): value is RequestSummary {
  return (
    hasStringField(value, 'requestId') &&
    hasStringField(value, 'requestType') &&
    hasStringField(value, 'status') &&
    hasStringField(value, 'summary') &&
    hasStringField(value, 'createdAt') &&
    hasStringField(value, 'updatedAt') &&
    hasStringField(value, 'reference')
  );
}

export function isCommerceAccountSummary(
  value: unknown,
): value is CommerceAccountSummary {
  return (
    value !== null &&
    typeof value === 'object' &&
    'customer' in value &&
    isCustomerSummary(value.customer) &&
    'orders' in value &&
    Array.isArray(value.orders) &&
    value.orders.every(isOrderSummary) &&
    'subscriptions' in value &&
    Array.isArray(value.subscriptions) &&
    value.subscriptions.every(isSubscriptionSummary) &&
    'payments' in value &&
    Array.isArray(value.payments) &&
    value.payments.every(isPaymentSummary) &&
    'requests' in value &&
    Array.isArray(value.requests) &&
    value.requests.every(isRequestSummary)
  );
}
