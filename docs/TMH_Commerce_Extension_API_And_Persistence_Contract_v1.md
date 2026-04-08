# TMH Commerce Extension — API And Persistence Contract v1

## Status
Locked planning artifact for the current TMH commerce implementation phase.

## Purpose

Define the normalized API payloads, route responsibilities, persistence writes, and correlation/reference fields required for the TMH Commerce Extension to implement subscriptions, preferences, account visibility, and request flows without ad hoc contract drift.

This document should be read together with:

- `TMH_Commerce_Extension_Canonical_Domain_Model_v1.md`
- `TMH_Commerce_Extension_Status_And_Mapping_Spec_v1.md`
- `TMH_Commerce_Extension_Subscription_Payment_Strategy_v1.md`

---

## 1. Contract rules

1. UI-facing routes return normalized app objects only.
2. Provider-specific payloads and raw Zoho payloads stay inside adapter/service layers.
3. Confirmation routes must read persisted snapshots rather than recomputing state from scratch where confirmation accuracy matters.
4. Every write-producing route must generate or propagate stable correlation and reference fields.
5. Public routes remain product- and commerce-focused, not provider-focused.

---

## 2. Normalized payload shapes

These shapes define the API boundary. Internal persistence may contain more fields.

## 2.1 `CustomerSummary`

```ts
type CustomerSummary = {
  customerId: string;
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
};
```

---

## 2.2 `SubscriptionSummary`

```ts
type SubscriptionSummary = {
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
};
```

---

## 2.3 `OrderSummary`

```ts
type OrderSummary = {
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
};
```

---

## 2.4 `OrderLineSummary`

```ts
type OrderLineSummary = {
  orderLineId: string;
  lineType: 'subscription_package' | 'service_request' | 'follow_up_quote';
  label: string;
  plan?: string;
  quantity: number;
  unitPrice?: number;
  billingInterval?: 'monthly' | 'annual';
  disposition: 'payable_now' | 'requires_follow_up';
  sourceRecordId?: string;
};
```

---

## 2.5 `PaymentSummary`

```ts
type PaymentSummary = {
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
};
```

---

## 2.6 `RequestSummary`

```ts
type RequestSummary = {
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
};
```

---

## 2.7 `PreferenceProfileSummary`

```ts
type PreferenceProfileSummary = {
  customerId?: string;
  email: string;
  globalOptOut: boolean;
  categories: unknown[];
  updatedAt?: string;
  crmSyncStatus?: 'synced' | 'pending_sync' | 'sync_failed';
  isNew?: boolean;
};
```

---

## 2.8 `CheckoutIntentSummary`

```ts
type CheckoutIntentSummary = {
  checkoutIntentId: string;
  orderId: string;
  customerId: string;
  token?: string;
  billingInterval: 'monthly' | 'annual';
  paymentStatus: 'initiated' | 'pending' | 'succeeded' | 'failed' | 'cancelled';
  reference: string;
  createdAt: string;
};
```

---

## 3. Persistence ownership

## 3.1 Zoho-backed commercial persistence

Zoho-backed persistence should hold the durable commercial records needed by the app:

- customer/contact/account linkage
- order records
- request records
- normalized subscription references
- normalized payment references required for account visibility
- preference state

## 3.2 App-side persistence or app-managed integration persistence

The app or its integration layer should hold transient or snapshot-style records needed for safe hosted-flow orchestration:

- checkout intents
- basket snapshots
- confirmation snapshots
- reconciliation logs
- correlation logs

### Rule

If Zoho can safely store checkout intent snapshots for v1, that is acceptable. If not, the app may persist them separately. The API contract does not depend on where the snapshot is stored, only that confirmation reads a durable stored snapshot.

---

## 4. Required correlation and reference fields

The following fields must exist in the route flow and logs where relevant.

## 4.1 Core identifiers

- `customer_id`
- `order_id`
- `order_line_id`
- `subscription_id`
- `payment_id`
- `request_id`
- `checkout_intent_id`

## 4.2 CRM identifiers

- `crm_contact_id`
- `crm_account_id`
- `crm_order_id`
- `crm_request_id`

## 4.3 Payment/provider identifiers

- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `provider_payment_id`
- `provider_invoice_id`
- `provider_session_id`

## 4.4 Flow identifiers

- `token`
- `reference`
- `correlation_id`

### Rules

- `reference` is the stable user-facing and support-facing commercial reference.
- `correlation_id` is generated per write-triggering request or callback and is primarily for logs/debug support.
- `provider_session_id` must be stored on checkout-intent creation if the hosted gateway returns it at that stage.

---

## 5. Public route contracts

## 5.1 `GET /api/subscribe/monitoring`

### Purpose

Resolve a commercial entry token into customer and offer context for the monitoring subscription flow.

### Request

Query params:

- `token` required

### Reads

- entry token record or token resolver
- customer/contact/account context
- eligible monitoring source records

### Writes

- none required
- optional correlation log entry

### Response

```ts
type MonitoringEntryResponse = {
  token: string;
  customer: CustomerSummary;
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl?: string;
  preSelectedPlan?: string;
  items: {
    sourceRecordId: string;
    name: string;
    brandName?: string;
    type: 'word_mark' | 'figurative' | 'combined';
    jurisdiction: string;
    applicationDate: string;
    registrationDate?: string;
    expiryDate?: string;
    registrationNumber?: string;
    status: string;
    riskProfile?: 'low' | 'medium' | 'high';
    imageUrl?: string;
  }[];
};
```

### Notes

- Item `status` above is a source-item status, not an order/subscription/payment status.
- This route should not create an order.

---

## 5.2 `POST /api/subscribe/monitoring/quote`

### Purpose

Validate the basket and return the authoritative quote split between payable-now and follow-up lines.

### Request

```ts
type MonitoringQuoteRequest = {
  token: string;
  billingInterval: 'monthly' | 'annual';
  selections: {
    sourceRecordId: string;
    plan: string;
    selected: boolean;
  }[];
};
```

### Reads

- token context
- eligible items
- pricing rules

### Writes

- none required for MVP
- optional quote audit trail

### Response

```ts
type MonitoringQuoteResponse = {
  billingInterval: 'monthly' | 'annual';
  orderLines: OrderLineSummary[];
  selectedCount: number;
  payableNowCount: number;
  requiresFollowUpCount: number;
  subtotal: number;
  discount: number;
  totalDueNow: number;
  annualSaving?: number;
};
```

### Rules

- This route must be server-authoritative.
- It must not trust stale client totals.
- It must classify each selected line into `payable_now` or `requires_follow_up`.

---

## 5.3 `POST /api/subscribe/monitoring/checkout`

### Purpose

Create or update the commercial order, persist the checkout intent snapshot, and return the hosted payment/setup redirect details.

### Request

Same request shape as quote.

### Reads

- token context
- eligible items
- server quote calculation

### Writes

- create or update `Order`
- write `Order.status = pending_checkout`
- write `OrderLine` snapshot rows
- create `CheckoutIntent`
- create normalized initial `Payment` record with `status = initiated`
- store returned `provider_session_id` if available

### Response

```ts
type MonitoringCheckoutResponse = {
  checkoutIntent: CheckoutIntentSummary;
  order: OrderSummary;
  payment: PaymentSummary;
  redirectUrl: string;
};
```

### Required stored fields

- `checkout_intent_id`
- `order_id`
- `customer_id`
- `reference`
- `correlation_id`
- `provider`
- `provider_session_id?`
- quote/basket snapshot

---

## 5.4 `GET /api/subscribe/monitoring/confirm`

### Purpose

Return the persisted confirmation snapshot and normalized commercial state after hosted payment/setup return.

### Request

Query params:

- `token` required
- `session` required

### Reads

- `CheckoutIntent`
- persisted basket snapshot
- normalized `Order`
- normalized `Payment`
- normalized `Subscription` when applicable

### Writes

- optional reconciliation log entry
- optional final status sync if the confirmation read path is also allowed to perform safe refresh logic

### Response

```ts
type MonitoringConfirmResponse = {
  customer: CustomerSummary;
  checkoutIntent: CheckoutIntentSummary;
  order: OrderSummary;
  payment: PaymentSummary;
  subscription?: SubscriptionSummary;
  orderLines: OrderLineSummary[];
  helpPhoneNumber: string;
  helpEmail: string;
  bookingUrl?: string;
};
```

### Rules

- This route must read the stored confirmation snapshot and normalized commercial state.
- It must not recompute a fresh basket for display.
- If reconciliation is still pending, it may return `pending_confirmation` states rather than pretending success.

---

## 5.5 `GET /api/settings/notifications`

### Purpose

Load preference state for a commercial contact.

### Request

Query params:

- `email` required for current flow

### Reads

- Zoho-backed preference state

### Writes

- none

### Response

- `PreferenceProfileSummary`

### Notes

- Debug payloads may exist in dev mode, but production-facing payloads should remain normalized.

---

## 5.6 `POST /api/settings/notifications`

### Purpose

Persist preference updates for a commercial contact.

### Request

Normalized preference save or global opt-out payload.

### Reads

- existing preference state if needed for merge/validation

### Writes

- preference state in Zoho-backed persistence
- optional correlation log entry

### Response

- `PreferenceProfileSummary`

---

## 6. Planned account-read route family

These routes are part of the target contract for the narrowed TMH commerce scope, even if they do not yet exist in code.

## 6.1 `GET /api/account/summary`

### Reads

- `Customer`
- latest `Subscriptions`
- latest `Orders`
- latest `Payments`
- latest `Requests`

### Response

```ts
type AccountSummaryResponse = {
  customer: CustomerSummary;
  subscriptions: SubscriptionSummary[];
  recentOrders: OrderSummary[];
  recentPayments: PaymentSummary[];
  recentRequests: RequestSummary[];
};
```

---

## 6.2 `GET /api/account/orders`

Returns paginated `OrderSummary[]`.

---

## 6.3 `GET /api/account/payments`

Returns paginated `PaymentSummary[]`.

---

## 6.4 `GET /api/account/subscriptions`

Returns paginated `SubscriptionSummary[]`.

---

## 6.5 `GET /api/account/requests`

Returns paginated `RequestSummary[]`.

---

## 7. Planned request-write route family

## 7.1 `POST /api/requests`

### Purpose

Create a commercial service request.

### Request

```ts
type CreateRequestInput = {
  customerId?: string;
  email: string;
  requestType: 'audit' | 'renewal' | 'application' | 'support';
  summary: string;
  metadata?: Record<string, unknown>;
};
```

### Writes

- create or resolve `Customer`
- create `Request`
- optionally create linked `Order` if the request is commercially order-backed from day one
- store `correlation_id`

### Response

- `RequestSummary`

---

## 8. Write matrix

| Route | Reads | Writes | Must persist references |
|---|---|---|---|
| `GET /api/subscribe/monitoring` | token, customer context, eligible items | none | optional `correlation_id` |
| `POST /api/subscribe/monitoring/quote` | token, eligible items, pricing rules | optional quote audit | `correlation_id` if audited |
| `POST /api/subscribe/monitoring/checkout` | token, quote inputs, pricing rules | `Order`, `OrderLine`, `CheckoutIntent`, initial `Payment` | `order_id`, `checkout_intent_id`, `reference`, `correlation_id`, `provider`, `provider_session_id?` |
| `GET /api/subscribe/monitoring/confirm` | `CheckoutIntent`, `Order`, `Payment`, `Subscription` | optional reconciliation log | `checkout_intent_id`, `reference`, `provider_session_id` |
| `GET /api/settings/notifications` | preference state | none | optional `correlation_id` |
| `POST /api/settings/notifications` | existing preference state if needed | preference state | `correlation_id`, `email`, `customer_id?` |
| `POST /api/requests` | customer lookup if needed | `Request`, optional `Order` | `request_id`, `reference`, `correlation_id`, `crm_request_id` |

---

## 9. Logging and supportability rules

Every write-producing route should log at least:

- `correlation_id`
- route name
- actor context if known
- `customer_id` if known
- `order_id` / `request_id` / `checkout_intent_id` if created or resolved
- `provider`
- `provider_session_id` if applicable
- final normalized status written

Support tooling and admin/debug visibility should be built around these normalized references, not around raw provider payloads.

---

## 10. Locked implementation rule

> The TMH Commerce Extension must implement public commerce routes against the normalized payload shapes and write responsibilities defined here. Every route that creates or mutates commercial state must persist stable references and correlation identifiers so hosted payment/setup, CRM reconciliation, and account visibility remain traceable and deterministic.
