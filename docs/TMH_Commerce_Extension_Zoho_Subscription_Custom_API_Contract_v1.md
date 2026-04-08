# TMH Commerce Extension — Zoho Subscription Custom API Contract v1

## Status

Implementation contract for the v1 Zoho CRM custom API used by the monitoring subscription flow.

## Purpose

Define the Zoho CRM custom API endpoint contract that the Next.js app adapter in `lib/zoho/subscriptions.ts` calls for subscription requests.

This contract covers v1 hosted subscription setup through the Xero payment gateway. Direct Stripe or GoCardless integrations remain future work.

---

## 1. App Adapter

The app uses one Zoho custom API endpoint configured by:

```txt
ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL
```

If this variable is not configured, local/demo monitoring routes keep using the existing mock-backed path.

When the variable is configured, these app routes call the Zoho custom API through `lib/zoho/subscriptions.ts`:

- `GET /api/subscribe/monitoring`
- `POST /api/subscribe/monitoring/quote`
- `POST /api/subscribe/monitoring/checkout`
- `GET /api/subscribe/monitoring/confirm`

The app sends `X-Correlation-Id` as a request header and includes the same value in the JSON body as `correlationId`.

---

## 2. Transport Envelope

### Method

All operations use:

```txt
POST {ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL}
```

### Headers

```txt
Accept: application/json
Content-Type: application/json
X-Correlation-Id: <correlation-id>
```

### Request Body

Every request includes:

```ts
type ZohoMonitoringSubscriptionRequest = {
  operation:
    | 'monitoring_subscription.resolve_token'
    | 'monitoring_subscription.create_checkout_intent'
    | 'monitoring_subscription.confirm_checkout';
  correlationId: string;
  token?: string;
  origin?: string;
  billingFrequency?: 'monthly' | 'annual';
  selectedTrademarks?: {
    trademarkId: string;
    name: string;
    brandName: string;
    jurisdiction: string;
    registrationNumber?: string;
    plan: 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
    billingFrequency: 'monthly' | 'annual';
    payableNow: boolean;
    requiresQuote: boolean;
    appliedPrice: number | null;
    currency: 'GBP';
  }[];
  session?: string;
};
```

### Response Envelopes Accepted By The App

The app accepts either a direct JSON response:

```json
{ "token": "abc", "clientName": "Amelia Carter" }
```

Or a wrapped response:

```json
{ "data": { "token": "abc", "clientName": "Amelia Carter" } }
```

The shared Zoho client also supports the existing Zoho custom API wrapper style:

```json
{
  "crmAPIResponse": {
    "status_code": 200,
    "body": "{\"data\":{\"token\":\"abc\"}}"
  }
}
```

---

## 3. Operation: Resolve Token

### Request

```json
{
  "operation": "monitoring_subscription.resolve_token",
  "correlationId": "3f3c8fd1-7128-42bb-b87b-3c6e55f8e62d",
  "token": "customer-entry-token",
  "origin": "https://example.com"
}
```

### Zoho Responsibilities

- Validate the token.
- Reject expired, unknown, or revoked tokens.
- Resolve customer/contact/account context.
- Return trademarks eligible for monitoring subscription consideration.
- Return booking/help metadata suitable for the customer-facing flow.
- Do not create an order or checkout intent during this operation.

### Success Response

```ts
type MonitoringClientData = {
  token: string;
  clientName: string;
  companyName?: string;
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl: string;
  preSelectedPlan?: 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
  trademarks: {
    id: string;
    name: string;
    brandName: string;
    type: 'word_mark' | 'figurative' | 'combined';
    jurisdiction: string;
    applicationDate?: string;
    registrationDate?: string;
    expiryDate?: string;
    registrationNumber?: string;
    status: 'pending' | 'registered' | 'expired';
    riskProfile?: 'low' | 'medium' | 'high';
    imageUrl?: string;
  }[];
};
```

---

## 4. Operation: Create Checkout Intent

### Request

```json
{
  "operation": "monitoring_subscription.create_checkout_intent",
  "correlationId": "3f3c8fd1-7128-42bb-b87b-3c6e55f8e62d",
  "token": "customer-entry-token",
  "origin": "https://example.com",
  "billingFrequency": "monthly",
  "selectedTrademarks": [
    {
      "trademarkId": "crm_tm_1",
      "name": "LUMA LANE",
      "brandName": "Luma Lane",
      "jurisdiction": "UK",
      "registrationNumber": "UK00003163853",
      "plan": "monitoring_essentials",
      "billingFrequency": "monthly",
      "payableNow": true,
      "requiresQuote": false,
      "appliedPrice": 24,
      "currency": "GBP"
    },
    {
      "trademarkId": "crm_tm_2",
      "name": "LUMA LANE HOME",
      "brandName": "Luma Lane Home",
      "jurisdiction": "UK",
      "registrationNumber": "UK00003163854",
      "plan": "monitoring_essentials",
      "billingFrequency": "monthly",
      "payableNow": true,
      "requiresQuote": false,
      "appliedPrice": 12,
      "currency": "GBP"
    }
  ]
}
```

### Zoho Responsibilities

- Revalidate the token and selected trademark IDs.
- Persist the checkout intent and basket snapshot.
- Treat `selectedTrademarks` as the authoritative checkout payload for v1.
- Use the provided `appliedPrice` per selected trademark instead of expecting a full quote object.
- Create or update durable commercial records needed for v1:
  - customer/contact/account linkage
  - order record with `status = pending_checkout`
  - subscription draft/reference where applicable
  - payment/setup record with `status = initiated`
  - follow-up request/line records for quote-required selections
- Create or request the Xero payment gateway hosted setup/payment URL.
- Store the `correlationId`, app `reference`, and provider/session references.
- Build the return URL back to the app using `origin`.

Rules:

- Only selected trademarks are sent in this operation.
- `selectedTrademarks` already includes the applied per-trademark price for the chosen billing frequency.
- Where a second or subsequent trademark on the same discount-eligible plan receives a reduced price, the reduced value is sent directly in `appliedPrice`.
- Do not expect the app to send the full quote matrix or all available pricing permutations in this operation.

### Success Response

```ts
type MonitoringCheckoutResponse = {
  redirectUrl: string;
  session: string;
  reference: string;
};
```

Rules:

- `redirectUrl` must be the customer-facing hosted payment/setup URL.
- `session` must be a durable checkout intent/session reference that can be sent back to confirmation.
- `reference` must be a stable TMH support-facing reference, for example `TMH-MON-ABC123`.

---

## 5. Operation: Confirm Checkout

### Request

```json
{
  "operation": "monitoring_subscription.confirm_checkout",
  "correlationId": "3f3c8fd1-7128-42bb-b87b-3c6e55f8e62d",
  "token": "customer-entry-token",
  "session": "checkout-intent-or-provider-session-id"
}
```

### Zoho Responsibilities

- Validate the token/session pairing.
- Read the persisted checkout snapshot.
- Read current normalized order/payment/subscription state where available.
- Return the customer-facing confirmation snapshot.
- Do not recompute quote state from the current token context alone.

### Success Response

```ts
type MonitoringConfirmationResponse = {
  clientName: string;
  companyName?: string;
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl: string;
  billingFrequency: 'monthly' | 'annual';
  firstPaymentDate: string;
  reference: string;
  paidItems: MonitoringQuoteLineItem[];
  followUpItems: MonitoringQuoteLineItem[];
  summary: MonitoringQuoteSummary;
};
```

The app currently requires the fields above. Zoho may return extra normalized fields such as `order`, `payment`, `subscription`, or `checkoutIntent`; the app will ignore them until the UI is upgraded.

---

## 6. Error Contract

Zoho should return HTTP status codes that match the error class, either directly or via `crmAPIResponse.status_code`.

Body:

```ts
type MonitoringSubscriptionError = {
  code:
    | 'invalid_token'
    | 'expired_token'
    | 'no_trademarks'
    | 'invalid_request'
    | 'invalid_session'
    | 'nothing_payable'
    | 'upstream_error'
    | 'server_error';
  message: string;
};
```

Recommended mappings:

| Code | Status | Meaning |
| --- | --- | --- |
| `invalid_token` | 400 | Token missing, malformed, revoked, or unknown |
| `expired_token` | 410 | Token was valid but has expired |
| `no_trademarks` | 404 | Token resolved but no eligible monitoring records exist |
| `invalid_request` | 400 | Request body is incomplete or inconsistent |
| `invalid_session` | 400 | Confirmation session is missing, unknown, or not paired with the token |
| `nothing_payable` | 400 | Checkout requested without any payable-now line |
| `upstream_error` | 502 | Xero gateway or internal CRM dependency failed |
| `server_error` | 500 | Unexpected custom API failure |

The Next.js adapter preserves app-level `code` values when Zoho returns them in the response body.

---

## 7. Required Persistence Fields

At minimum, the custom API must persist enough data to reconcile support cases and confirmation reads:

- `correlation_id`
- `token`
- `customer_id` or Zoho contact/account IDs
- `crm_order_id`
- `checkout_intent_id` or equivalent session ID
- `reference`
- `billing_interval`
- `basket_snapshot`
- `quote_snapshot`
- `order_status`
- `payment_status_latest`
- `subscription_status`
- `provider`
- `provider_session_id`
- `created_at`
- `updated_at`

For v1, `provider` should represent the hosted path through the Xero payment gateway, while downstream Stripe/GoCardless details remain internal to Xero unless explicitly exposed later.
