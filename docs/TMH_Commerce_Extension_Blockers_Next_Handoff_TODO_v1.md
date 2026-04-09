# TMH Commerce Extension - Blockers, Next Handoff, and TODO v1

## Status

Active implementation handoff document.

## Purpose

This document consolidates the current dependency blockers and the next implementation tasks for the TMH Commerce Extension. It is intended for app, Zoho CRM, Xero/payment, and auth handoff work.

The app-side implementation currently builds and passes local gates, but live production validation is blocked by external Zoho custom APIs and real customer identity context.

## Current Local Quality Gate

Last known app-side gate:

```bash
npm test
npm run lint
npm run build
```

Expected result:

- `npm test`: 14 passing tests
- `npm run lint`: passing
- `npm run build`: passing

## Required Environment Variables

| Variable | Used By | Required In Production | Notes |
| --- | --- | --- | --- |
| `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL` | `GET/POST /api/settings/notifications` | Yes | Existing Zoho custom API for loading and saving email preferences. |
| `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` | Monitoring subscription route family | Yes | New Zoho custom API for token resolution, checkout intent creation, and checkout confirmation. |
| `ZOHO_COMMERCE_CUSTOM_API_URL` | Account and request route family | Yes | New generic Zoho custom API for customer/account/order/subscription/payment/request operations. |
| `TMH_REQUIRE_ZOHO_MONITORING_SUBSCRIPTION` | Monitoring subscription strict mode | Yes | Set to `true` outside local demo environments. Production Vercel deployments already enforce strict behavior. |
| `TMH_GENERAL_ENQUIRY_BOOKING_URL` | Booking handoff links | Yes | Approved TMH booking URL. |
| `DEV_MODE` | API/UI debug output | No | Must be unset or `false` in production. |

## External Blockers

### B1 - Zoho Monitoring Subscription Custom API

Status: blocked on Zoho implementation/configuration.

Required env var:

```txt
ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL
```

App adapter:

```txt
lib/zoho/subscriptions.ts
```

App routes that depend on it:

- `GET /api/subscribe/monitoring`
- `POST /api/subscribe/monitoring/quote`
- `POST /api/subscribe/monitoring/checkout`
- `GET /api/subscribe/monitoring/confirm`

Operations Zoho must support:

- `monitoring_subscription.resolve_token`
- `monitoring_subscription.create_checkout_intent`
- `monitoring_subscription.confirm_checkout`

Acceptance criteria:

- Real token resolves to customer and eligible trademark context.
- Checkout intent is persisted durably in Zoho or Zoho-backed storage.
- Hosted Xero payment gateway redirect is returned.
- Confirmation reads persisted checkout/order/payment/subscription state.
- Responses match the shapes in this doc and `TMH_Commerce_Extension_Zoho_Subscription_Custom_API_Contract_v1.md`.

### B2 - Xero Payment Gateway Setup Through Zoho

Status: blocked on Zoho/Xero payment gateway wiring.

Decision already locked:

- v1 subscription hosted payment/setup uses the Xero payment gateway.
- Xero's built-in Stripe/GoCardless integrations are enough for v1.
- Direct Stripe/GoCardless integrations are future-release work.

Zoho must return:

```ts
type MonitoringCheckoutResponse = {
  redirectUrl: string;
  session: string;
  reference: string;
};
```

Acceptance criteria:

- `redirectUrl` sends the customer to the hosted Xero payment/setup flow.
- `session` is a durable checkout intent reference that can be confirmed later.
- `reference` is support-facing and stable, for example `TMH-MON-ABC123`.
- Confirmation can distinguish success, pending, failed, and cancelled states through normalized app fields.

### B3 - Zoho Generic Commerce Custom API

Status: blocked on Zoho implementation/configuration.

Required env var:

```txt
ZOHO_COMMERCE_CUSTOM_API_URL
```

App adapter:

```txt
lib/zoho/commerce.ts
```

App routes that depend on it:

- `GET /api/account/summary`
- `GET /api/account/[resource]`
- `POST /api/requests`

Operations Zoho must support:

- `commerce.account_summary.get`
- `commerce.customer.get`
- `commerce.orders.list`
- `commerce.subscriptions.list`
- `commerce.payments.list`
- `commerce.requests.list`
- `commerce.requests.create`

Acceptance criteria:

- Account summary and resource list routes return normalized payloads.
- `POST /api/requests` creates a real Zoho request record.
- Request creation returns a normalized request reference.
- Responses match the shapes in this doc and `TMH_Commerce_Extension_Zoho_Commerce_Custom_API_Contract_v1.md`.

### B4 - Preferences Production Confirmation

Status: app route is wired; production endpoint still needs environment confirmation.

Required env var:

```txt
ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL
```

App adapter:

```txt
lib/zoho/preferences.ts
```

App route:

- `GET /api/settings/notifications?email=...`
- `POST /api/settings/notifications`

Acceptance criteria:

- Production environment variable points to the correct Zoho custom API.
- GET returns a normalized preference profile.
- POST saves idempotently and rejects malformed category/topic options before Zoho.
- Response includes `crmSyncStatus`, `correlationId`, and `x-correlation-id`.

### B5 - Authenticated Customer Context

Status: not implemented; current account/request surfaces accept temporary query-param identity.

Temporary supported identity inputs:

- `customerId`
- `email`

Affected routes:

- `/account?customerId=...`
- `/account?email=...`
- `/account/orders?customerId=...`
- `/account/subscriptions?customerId=...`
- `/account/payments?customerId=...`
- `/account/requests?customerId=...`
- `/requests/new?customerId=...`
- `/requests/new?email=...`

Required future change:

- Replace query-param identity with authenticated customer context.
- Server routes should resolve identity from auth/session rather than trusting URL parameters.
- Keep query-param path only if explicitly retained for internal support/debug usage behind appropriate controls.

Acceptance criteria:

- Account pages load without customer identity in the URL for authenticated users.
- Request submissions use authenticated customer identity.
- Direct access without auth returns a controlled unauthenticated/unauthorized state.

### B6 - Live Integration Validation

Status: blocked until B1, B2, B3, and B4 are configured.

Acceptance criteria:

- Full monitoring subscription flow can be completed from a real token.
- Account summary reflects the created order/subscription/payment after checkout.
- Request creation appears in account request history.
- Preference updates round-trip through Zoho.
- All write responses include a usable correlation ID for support/debug.

## App Public API Contracts

### `GET /api/settings/notifications`

Purpose:

Load email preferences for one email address.

Query:

```ts
type Query = {
  email: string;
};
```

Success response:

```ts
type Response = {
  email: string;
  categories: NotificationPreferenceCategory[];
  optOut?: true;
  new?: true;
  crmSyncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  correlationId: string;
  profile: {
    customerId?: string;
    email: string;
    globalOptOut: boolean;
    categories: NotificationPreferenceCategory[];
    updatedAt?: string;
    crmSyncStatus?: 'synced' | 'pending_sync' | 'sync_failed';
    isNew?: boolean;
  };
};
```

Error response:

```ts
type ErrorResponse = {
  code: 'invalid_request' | 'config_error' | 'upstream_error' | 'invalid_response' | 'server_error';
  message: string;
  correlationId: string;
  crmSyncStatus: 'sync_failed';
};
```

Headers:

```txt
x-correlation-id: <correlation-id>
```

### `POST /api/settings/notifications`

Purpose:

Save email preferences or global opt-out state.

Request body for category save:

```ts
type NotificationPreferencesSaveRequest = {
  email: string;
  categories: {
    category: string;
    topics: {
      topic: string;
      label: string;
      option: 'Tell Me More' | 'Keep Me Posted' | 'No Thanks';
    }[];
  }[];
};
```

Request body for global opt-out:

```ts
type NotificationPreferencesOptOutRequest = {
  email: string;
  optOut: true;
};
```

Success response:

Same shape as `GET /api/settings/notifications`.

Validation rules:

- `email` must be a non-blank string.
- Save payload must contain a `categories` array.
- Every topic option must be one of:
  - `Tell Me More`
  - `Keep Me Posted`
  - `No Thanks`
- Opt-out payload must use `optOut: true`.

### `GET /api/subscribe/monitoring`

Purpose:

Resolve a tokenized monitoring subscription context.

Query:

```ts
type Query = {
  token: string;
};
```

Zoho operation when configured:

```txt
monitoring_subscription.resolve_token
```

Success response:

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

Error response:

```ts
type ErrorResponse = {
  code: string;
  message: string;
};
```

Headers:

```txt
x-correlation-id: <correlation-id>
```

### `POST /api/subscribe/monitoring/quote`

Purpose:

Validate selected monitoring items and return authoritative quote classification.

Request body:

```ts
type MonitoringQuoteRequest = {
  token: string;
  billingFrequency: 'monthly' | 'annual';
  selections: {
    trademarkId: string;
    plan: 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
    selected: boolean;
  }[];
};
```

Success response:

```ts
type MonitoringQuoteResponse = {
  billingFrequency: 'monthly' | 'annual';
  lineItems: MonitoringQuoteLineItem[];
  payableNowLineItems: MonitoringQuoteLineItem[];
  followUpLineItems: MonitoringQuoteLineItem[];
  planBreakdown: {
    plan: 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
    count: number;
    subtotalMonthly: number;
    subtotalAnnual: number;
  }[];
  summary: {
    selectedCount: number;
    payableNowCount: number;
    requiresQuoteCount: number;
    subtotalMonthly: number;
    subtotalAnnual: number;
    discountMonthly: number;
    discountAnnual: number;
    totalMonthly: number;
    totalAnnual: number;
    annualSaving: number;
  };
};

type MonitoringQuoteLineItem = {
  trademarkId: string;
  trademarkName: string;
  plan: 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
  billingFrequency: 'monthly' | 'annual';
  monthlyPrice: number;
  annualPrice: number;
  payableNow: boolean;
  requiresFollowUp: boolean;
  followUpReason?: string;
};
```

Current implementation note:

- Quote calculation still uses the monitoring service seam.
- Real production quote inputs depend on Zoho token/item resolution.

### `POST /api/subscribe/monitoring/checkout`

Purpose:

Create a persisted checkout intent and return a hosted Xero payment gateway redirect.

Request body:

```ts
type MonitoringCheckoutRequest = {
  token: string;
  billingFrequency: 'monthly' | 'annual';
  selectedTrademarks: {
    trademarkId: string; // same value as resolve_token trademarks[].id
    name: string;
    brandName: string;
    type: 'word_mark' | 'figurative' | 'combined';
    jurisdiction: string;
    registrationNumber?: string;
    plan: 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
    billingFrequency: 'monthly' | 'annual';
    payableNow: boolean;
    requiresQuote: boolean;
    appliedPrice: number | null;
    currency: 'GBP';
  }[];
  summary: {
    billingFrequency: 'monthly' | 'annual';
    selectedCount: number;
    fullPriceSubtotal: number;
    discount: number;
    subtotal: number;
    vat: number;
    payableTotal: number;
  };
};
```

Zoho operation when configured:

```txt
monitoring_subscription.create_checkout_intent
```

Success response:

```ts
type MonitoringCheckoutResponse = {
  redirectUrl: string;
  session: string;
  reference: string;
};
```

Zoho responsibilities:

- Revalidate token and selected trademark IDs.
- Persist basket/checkout snapshot.
- Treat `selectedTrademarks` as the authoritative checkout payload for v1.
- Treat `summary` as the narrowed order/quote summary for the chosen billing frequency.
- For UK clients, expect VAT at `20%` of the post-discount subtotal.
- Create or update normalized commercial records:
  - order with `status = pending_checkout`
  - payment/setup record with `status = initiated`
  - subscription draft/reference where applicable
  - follow-up request/line records for quote-required selections
- Create hosted Xero payment gateway redirect.
- Store `correlationId`, app reference, session reference, and provider references.

### `GET /api/subscribe/monitoring/confirm`

Purpose:

Read persisted checkout state and return customer-facing confirmation.

Query:

```ts
type Query = {
  token: string;
  session: string;
};
```

Zoho operation when configured:

```txt
monitoring_subscription.confirm_checkout
```

Success response:

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
  lineItems: MonitoringQuoteLineItem[];
  payableNowLineItems: MonitoringQuoteLineItem[];
  followUpLineItems: MonitoringQuoteLineItem[];
  summary: MonitoringQuoteResponse['summary'];
};
```

Required production behavior:

- Do not recompute the confirmation from the token alone.
- Read the persisted checkout snapshot and current normalized order/payment/subscription state.
- Surface pending, failed, and cancelled states through normalized app status fields where applicable.

### `GET /api/account/summary`

Purpose:

Load account landing summary.

Query:

```ts
type Query = {
  customerId?: string;
  email?: string;
};
```

Current rule:

- One of `customerId` or `email` is required while auth is mocked.
- This must later be replaced by authenticated customer context.

Zoho operation:

```txt
commerce.account_summary.get
```

Success response:

```ts
type Response = {
  account: CommerceAccountSummary;
  correlationId: string;
};

type CommerceAccountSummary = {
  customer: CustomerSummary;
  orders: OrderSummary[];
  subscriptions: SubscriptionSummary[];
  payments: PaymentSummary[];
  requests: RequestSummary[];
};
```

### `GET /api/account/[resource]`

Purpose:

Load one account resource list.

Supported resources:

- `orders`
- `subscriptions`
- `payments`
- `requests`

Queries:

```ts
type Query = {
  customerId?: string;
  email?: string;
};
```

Operations:

```txt
commerce.orders.list
commerce.subscriptions.list
commerce.payments.list
commerce.requests.list
```

If only `email` is supplied, the app first calls:

```txt
commerce.customer.get
```

Success response:

```ts
type Response = {
  resource: 'orders' | 'subscriptions' | 'payments' | 'requests';
  customerId: string;
  items: OrderSummary[] | SubscriptionSummary[] | PaymentSummary[] | RequestSummary[];
  correlationId: string;
};
```

### `POST /api/requests`

Purpose:

Create a normalized service request in Zoho.

Request body:

```ts
type CreateCommerceRequestPayload = {
  customerId?: string;
  email?: string;
  requestType: 'audit' | 'renewal' | 'application' | 'support';
  summary: string;
  details?: Record<string, unknown>;
};
```

Current rule:

- One of `customerId` or `email` is required while auth is mocked.
- `summary` must be a non-blank string.
- `details`, if supplied, must be an object.

Operations:

```txt
commerce.customer.get
commerce.requests.create
```

If `customerId` is supplied, the app can call `commerce.requests.create` directly. If only `email` is supplied, the app first resolves `customerId` with `commerce.customer.get`.

Success response:

```ts
type Response = {
  request: RequestSummary;
  correlationId: string;
};
```

Status:

```txt
201 Created
```

## Normalized Commerce Shapes

```ts
type CustomerSummary = {
  customerId: string;
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
};

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

## Zoho Custom API Transport Requirements

All new Zoho custom API calls use:

```txt
POST <configured custom API URL>
Accept: application/json
Content-Type: application/json
X-Correlation-Id: <correlation-id>
```

Every request body includes:

```ts
type BaseZohoCustomApiRequest = {
  operation: string;
  correlationId: string;
};
```

The app accepts three response envelope styles:

Direct response:

```json
{ "customerId": "cust_123", "fullName": "Amelia Carter", "email": "a@example.com" }
```

Data wrapper:

```json
{
  "data": {
    "customerId": "cust_123",
    "fullName": "Amelia Carter",
    "email": "a@example.com"
  }
}
```

Zoho custom API wrapper:

```json
{
  "crmAPIResponse": {
    "status_code": 200,
    "body": "{\"data\":{\"customerId\":\"cust_123\",\"fullName\":\"Amelia Carter\",\"email\":\"a@example.com\"}}"
  }
}
```

## Next TODO Tasks

### T1 - Implement Zoho monitoring subscription custom API

Owner: Zoho/CRM side.

Required operations:

- `monitoring_subscription.resolve_token`
- `monitoring_subscription.create_checkout_intent`
- `monitoring_subscription.confirm_checkout`

Deliverables:

- Endpoint URL for `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL`.
- Real token fixture for app validation.
- Real checkout fixture that creates a hosted Xero gateway redirect.
- Confirmation fixture that returns persisted state.

Validation:

```bash
npm test
npm run lint
npm run build
```

Then manually validate:

- `/subscribe/monitoring?token=<real-token>`
- quote step
- checkout redirect
- confirmation return

### T2 - Implement Zoho generic commerce custom API

Owner: Zoho/CRM side.

Required operations:

- `commerce.account_summary.get`
- `commerce.customer.get`
- `commerce.orders.list`
- `commerce.subscriptions.list`
- `commerce.payments.list`
- `commerce.requests.list`
- `commerce.requests.create`

Deliverables:

- Endpoint URL for `ZOHO_COMMERCE_CUSTOM_API_URL`.
- Customer fixture with order/subscription/payment/request records.
- Request creation fixture.

Manual validation:

- `/account?customerId=<customer-id>`
- `/account/orders?customerId=<customer-id>`
- `/account/subscriptions?customerId=<customer-id>`
- `/account/payments?customerId=<customer-id>`
- `/account/requests?customerId=<customer-id>`
- `/requests/new?customerId=<customer-id>`

### T3 - Confirm production preferences endpoint

Owner: Zoho/CRM side plus app deploy owner.

Deliverables:

- Confirm `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL` in production.
- Confirm expected category/topic payloads.
- Confirm save behavior is idempotent.

Manual validation:

- `/settings/notifications?email=<known-email>`
- save category preferences
- save global opt-out
- confirm `x-correlation-id` is present

### T4 - Replace query-param customer identity with auth/session context

Owner: app/auth implementation.

Current state:

- Account and request surfaces accept `customerId` or `email` query params.

Required future state:

- Server routes infer customer identity from auth/session.
- Query-param identity is removed or restricted to support/debug flows.
- Unauthenticated users get a controlled auth response rather than a generic invalid request.

Affected files:

- `app/api/account/summary/route.ts`
- `app/api/account/[resource]/route.ts`
- `app/api/requests/route.ts`
- `app/(dashboard)/account/page.tsx`
- `app/(dashboard)/account/orders/page.tsx`
- `app/(dashboard)/account/subscriptions/page.tsx`
- `app/(dashboard)/account/payments/page.tsx`
- `app/(dashboard)/account/requests/page.tsx`
- `app/(dashboard)/requests/new/page.tsx`

### T5 - Live validation and final mock fallback removal

Owner: app implementation after Zoho/Xero endpoints are ready.

Current state:

- Monitoring subscription flow keeps local/demo mock fallback when `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` is absent and strict mode is not required.
- Old portal routes redirect away from mock surfaces.
- Archived portal components remain in the tree as unused future-reference code.

Required future state:

- Validate real Zoho/Xero monitoring flow.
- Decide whether to remove or keep local/demo monitoring fallback.
- If removing fallback, delete or archive:
  - `lib/monitoring/mock-data.ts`
  - `lib/monitoring/session.ts`
  - `app/(subscribe)/subscribe/monitoring/mock-payment/page.tsx`
  - `app/(subscribe)/subscribe/monitoring/mock-booking/page.tsx`

### T6 - Add route/integration tests after test harness decision

Owner: app implementation.

Current state:

- Lightweight Node tests cover dependency-light validators and config policy.
- Next route handlers are not directly tested because the current lightweight runner has no Next/alias route harness.

Options:

- Add a Next-aware route test harness.
- Add Playwright/API smoke checks against a running dev server.
- Keep local tests pure and rely on integration environment smoke testing for routes.

Recommended first test cases:

- `POST /api/requests` rejects malformed payloads.
- `GET /api/account/summary` rejects missing identity.
- `POST /api/settings/notifications` rejects invalid topic options.
- Monitoring strict mode returns a controlled integration error without Zoho config.

## Current App-Side Endpoint Inventory

| Endpoint | Status | External Dependency |
| --- | --- | --- |
| `GET /api/settings/notifications` | Implemented | `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL` |
| `POST /api/settings/notifications` | Implemented | `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL` |
| `GET /api/subscribe/monitoring` | Implemented with adapter/fallback | `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` for production |
| `POST /api/subscribe/monitoring/quote` | Implemented with service seam | Real Zoho item/quote source for production |
| `POST /api/subscribe/monitoring/checkout` | Implemented with adapter/fallback | `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` and Xero gateway |
| `GET /api/subscribe/monitoring/confirm` | Implemented with adapter/fallback | `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` |
| `GET /api/account/summary` | Implemented | `ZOHO_COMMERCE_CUSTOM_API_URL` |
| `GET /api/account/[resource]` | Implemented | `ZOHO_COMMERCE_CUSTOM_API_URL` |
| `POST /api/requests` | Implemented | `ZOHO_COMMERCE_CUSTOM_API_URL` |

## Current UI Surface Inventory

| Route | Status | Notes |
| --- | --- | --- |
| `/subscribe/monitoring` | Implemented | Production validation blocked by Zoho monitoring subscription API and Xero gateway. |
| `/subscribe/monitoring/confirm` | Implemented | Production validation blocked by persisted confirmation state. |
| `/settings/notifications` | Implemented | Uses preferences API. |
| `/account` | Implemented | Temporary query-param identity until auth is wired. |
| `/account/orders` | Implemented | Temporary query-param identity until auth is wired. |
| `/account/subscriptions` | Implemented | Temporary query-param identity until auth is wired. |
| `/account/payments` | Implemented | Temporary query-param identity until auth is wired. |
| `/account/requests` | Implemented | Temporary query-param identity until auth is wired. |
| `/requests/new` | Implemented | Temporary query-param identity until auth is wired. |
| `/portfolio` | Redirects | Redirects to `/account`. |
| `/watchlist` | Redirects | Redirects to `/account`. |
| `/asset/[id]` | Redirects | Redirects to `/account`. |
| `/welcome` | Redirects | Redirects to `/account`. |
| `/discovery` | Redirects | Redirects to `/account`. |
| `/renew/[id]` | Redirects | Redirects to `/requests/new?requestType=renewal`. |

## Handoff Summary

The app-side contracts are ready for Zoho implementation and live validation. The next productive work is not more local UI scaffolding; it is endpoint delivery and test fixtures from Zoho/Xero plus auth/customer context wiring.

Until those are available, app-side production cutover remains blocked on:

- `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL`
- Xero gateway redirect creation through Zoho
- `ZOHO_COMMERCE_CUSTOM_API_URL`
- production confirmation of `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL`
- authenticated customer identity replacing query-param identity
