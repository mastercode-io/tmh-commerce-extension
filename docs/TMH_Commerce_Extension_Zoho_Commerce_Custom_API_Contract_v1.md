# TMH Commerce Extension — Zoho Commerce Custom API Contract v1

## Status

Implementation contract for the normalized Zoho CRM commerce adapter.

## Purpose

Define the generic Zoho custom API boundary used for account/customer/order/subscription/payment/request data outside the dedicated monitoring subscription checkout custom API.

The matching app adapter lives in `lib/zoho/commerce.ts`. Shared normalized app types live in `lib/commerce/types.ts`.

---

## 1. Endpoint

The app uses one generic Zoho commerce custom API endpoint configured by:

```txt
ZOHO_COMMERCE_CUSTOM_API_URL
```

All operations use:

```txt
POST {ZOHO_COMMERCE_CUSTOM_API_URL}
```

Headers:

```txt
Accept: application/json
Content-Type: application/json
X-Correlation-Id: <correlation-id>
```

The request body also includes `correlationId`.

---

## 2. Accepted Response Envelopes

The app accepts a direct normalized response:

```json
{ "customerId": "cust_123", "fullName": "Amelia Carter", "email": "a@example.com" }
```

Or a wrapped response:

```json
{
  "data": {
    "customerId": "cust_123",
    "fullName": "Amelia Carter",
    "email": "a@example.com"
  }
}
```

The shared Zoho client also supports the existing Zoho custom API wrapper:

```json
{
  "crmAPIResponse": {
    "status_code": 200,
    "body": "{\"data\":{\"customerId\":\"cust_123\"}}"
  }
}
```

---

## 3. Operations

### `commerce.account_summary.get`

Purpose:

Return the account landing summary for a customer.

Request:

```ts
type Request = {
  operation: 'commerce.account_summary.get';
  correlationId: string;
  customerId?: string;
  email?: string;
};
```

Response:

```ts
type CommerceAccountSummary = {
  customer: CustomerSummary;
  orders: OrderSummary[];
  subscriptions: SubscriptionSummary[];
  payments: PaymentSummary[];
  requests: RequestSummary[];
};
```

### `commerce.customer.get`

Purpose:

Resolve the normalized commercial customer.

Request:

```ts
type Request = {
  operation: 'commerce.customer.get';
  correlationId: string;
  customerId?: string;
  email?: string;
};
```

Response:

```ts
type CustomerSummary = {
  customerId: string;
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
};
```

### `commerce.orders.list`

Purpose:

Return normalized commercial orders for a customer.

Request:

```ts
type Request = {
  operation: 'commerce.orders.list';
  correlationId: string;
  customerId: string;
};
```

Response:

```ts
type OrderSummary[] = {
  orderId: string;
  kind: 'subscription' | 'service_request';
  status:
    | 'draft'
    | 'pending_checkout'
    | 'pending_confirmation'
    | 'confirmed'
    | 'failed'
    | 'cancelled';
  billingInterval?: 'monthly' | 'annual';
  currency: string;
  totalDueNow: number;
  totalFollowUp?: number;
  createdAt: string;
  confirmedAt?: string;
  reference: string;
}[];
```

### `commerce.subscriptions.list`

Purpose:

Return normalized subscription records for a customer.

Request:

```ts
type Request = {
  operation: 'commerce.subscriptions.list';
  correlationId: string;
  customerId: string;
};
```

Response:

```ts
type SubscriptionSummary[] = {
  subscriptionId: string;
  orderId: string;
  provider: string;
  planFamily: string;
  billingInterval: 'monthly' | 'annual';
  status:
    | 'pending_checkout'
    | 'pending_confirmation'
    | 'active'
    | 'past_due'
    | 'cancel_at_period_end'
    | 'cancelled';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  startedAt?: string;
  lastPaidAt?: string;
  reference: string;
}[];
```

### `commerce.payments.list`

Purpose:

Return normalized payment records for a customer.

Request:

```ts
type Request = {
  operation: 'commerce.payments.list';
  correlationId: string;
  customerId: string;
};
```

Response:

```ts
type PaymentSummary[] = {
  paymentId: string;
  orderId: string;
  subscriptionId?: string;
  provider: string;
  status: 'initiated' | 'pending' | 'succeeded' | 'failed' | 'cancelled';
  amount: number;
  currency: string;
  paidAt?: string;
  failedAt?: string;
  failureReason?: string;
  reference: string;
}[];
```

### `commerce.requests.list`

Purpose:

Return normalized service requests for a customer.

Request:

```ts
type Request = {
  operation: 'commerce.requests.list';
  correlationId: string;
  customerId: string;
};
```

Response:

```ts
type RequestSummary[] = {
  requestId: string;
  requestType: 'audit' | 'renewal' | 'application' | 'support';
  status:
    | 'submitted'
    | 'triaged'
    | 'awaiting_customer'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  summary: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  reference: string;
}[];
```

### `commerce.requests.create`

Purpose:

Create a normalized service request in Zoho.

Request:

```ts
type Request = {
  operation: 'commerce.requests.create';
  correlationId: string;
  request: {
    customerId: string;
    requestType: 'audit' | 'renewal' | 'application' | 'support';
    summary: string;
    orderId?: string;
    details?: Record<string, unknown>;
  };
};
```

Response:

```ts
type RequestSummary = {
  requestId: string;
  requestType: 'audit' | 'renewal' | 'application' | 'support';
  status: 'submitted' | 'triaged' | 'awaiting_customer' | 'in_progress' | 'completed' | 'cancelled';
  summary: string;
  createdAt: string;
  updatedAt: string;
  orderId?: string;
  reference: string;
};
```

---

## 4. Error Contract

Zoho should return a meaningful HTTP status through either the raw response or `crmAPIResponse.status_code`.

Recommended error body:

```ts
type ZohoCommerceError = {
  code:
    | 'invalid_request'
    | 'not_found'
    | 'unauthorized'
    | 'upstream_error'
    | 'server_error';
  message: string;
};
```

The app adapter currently maps transport/config/shape errors into `ZohoCommerceError` instances. Route-level user-facing mapping should be added when the account and request API routes are implemented.

---

## 5. Implementation Rules

- Return normalized app fields, not raw Zoho module/field names.
- Map raw Zoho and payment-provider statuses into the enums defined in `TMH_Commerce_Extension_Status_And_Mapping_Spec_v1.md`.
- Preserve `correlationId` on Zoho records or logs for write operations.
- Do not expose Stripe, GoCardless, or Xero-specific raw payloads to the UI.
- For v1 subscriptions, use provider-neutral app fields even though hosted setup runs through the Xero payment gateway.
