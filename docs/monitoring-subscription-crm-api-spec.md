# Monitoring Subscription CRM API Spec

## Document Info

- **Version:** 0.1 Draft
- **Date:** March 16, 2026
- **Status:** Working draft for implementation
- **Purpose:** Initial API contract for replacing the monitoring subscription mock backend with CRM-backed integration
- **Related Docs:** `monitoring-subscription-prd.md`, `monitoring-subscription-user-stories.md`, `monitoring-subscription-implementation-plan.md`

### Provider Decision Update

As of April 6, 2026, v1 subscriptions in this repo use the **Xero payment gateway** as the hosted payment/setup surface.

Where this document refers to later direct GoCardless integration, treat that as superseded planning. Public route contracts remain valid, but provider-specific internals must now be implemented through the Xero gateway strategy documented in `TMH_Commerce_Extension_Subscription_Payment_Strategy_v1.md`.

For normalized payloads, route responsibilities, and persistence writes across this flow, also use `TMH_Commerce_Extension_API_And_Persistence_Contract_v1.md` as canonical where this route-focused draft is underspecified.

---

## 1. Scope

This document defines the first backend API shape needed to support the implemented monitoring subscription flow in the TMH portal.

It is intentionally based on the current frontend behavior, not on a generic future-state architecture. The goal is to create a stable draft that can evolve as CRM integration and the v1 Xero payment gateway implementation are completed.

Current focus:

- CRM-backed token resolution
- CRM-backed trademark and client data retrieval
- Server-side quote calculation using real CRM records
- Checkout intent persistence for the monitoring flow
- Confirmation lookup from stored quote / checkout session

Out of scope for this first draft:

- direct provider API contracts beyond the v1 Xero gateway
- webhook processing
- staff back-office workflows
- analytics events
- renewal automation outside the monitoring flow

---

## 2. Design Principles

- Preserve the current frontend route contract so UI work does not need to be rewritten
- Keep business pricing logic server-side and deterministic
- Treat the basket as the source of truth, not a single plan per client
- Support mixed outcomes in the same basket:
  - payable now
  - requires follow-up
- Keep CRM integration hidden behind portal API routes
- Allow staged rollout:
  - CRM first
  - checkout persistence second
  - Xero payment gateway hosted payment/setup for v1
  - direct provider integrations later

---

## 3. Current Frontend Contract

The current monitoring page already calls these public app routes:

### 3.1 Resolve Monitoring Link

- **Method:** `GET`
- **Route:** `/api/subscribe/monitoring?token=<TOKEN>`
- **Purpose:** Resolve invitation token into client and trademark context

### 3.2 Recalculate Quote

- **Method:** `POST`
- **Route:** `/api/subscribe/monitoring/quote`
- **Purpose:** Recalculate quote when billing cadence, selection, or plan changes

### 3.3 Create Checkout Intent

- **Method:** `POST`
- **Route:** `/api/subscribe/monitoring/checkout`
- **Purpose:** Persist the payable basket and return a checkout session / redirect target

### 3.4 Load Confirmation

- **Method:** `GET`
- **Route:** `/api/subscribe/monitoring/confirm?token=<TOKEN>&session=<SESSION>`
- **Purpose:** Load the final quote snapshot and confirmation state

These routes should remain the public interface used by the page.

---

## 4. Recommended Backend Shape

### 4.1 Public Portal API Layer

Implemented in Next.js / Vercel Edge functions:

- `/api/subscribe/monitoring`
- `/api/subscribe/monitoring/quote`
- `/api/subscribe/monitoring/checkout`
- `/api/subscribe/monitoring/confirm`

Responsibilities:

- validate request shape
- validate token/session presence
- call CRM integration layer
- run server-side pricing logic
- normalize CRM records into frontend payload shape
- hide CRM-specific schema from the frontend

### 4.2 CRM Integration Layer

Internal service wrappers or helper modules, for example:

- `lib/monitoring/crm-client.ts`
- `lib/monitoring/crm-mappers.ts`
- `lib/monitoring/crm-checkout.ts`

Responsibilities:

- fetch client/contact/account by token
- fetch eligible trademarks
- map Zoho/custom CRM fields into portal types
- persist monitoring checkout intents / quote snapshots
- fetch stored session data for confirmation

### 4.3 Pricing Layer

Current server-side pricing logic should remain centralized in:

- `lib/monitoring/pricing.ts`

CRM should provide record data, not pricing, unless business decides to centralize commercial logic externally later.

---

## 5. Domain Model Needed From CRM

The monitoring flow currently requires this data:

### 5.1 Client Context

- `clientName`
- `companyName` optional
- `helpPhoneNumber`
- `helpEmail`
- `bookingUrl`
- `preSelectedPlan` optional
- `clientLocation` optional, current values:
  - `UK`
  - `INT`

### 5.2 Trademark Context

Per trademark:

- `id`
- `name`
- `brandName`
- `type`
- `jurisdiction`
- `applicationDate` optional
- `registrationDate` optional
- `expiryDate` optional
- `registrationNumber` optional
- `status`
- `riskProfile` nullable
- `imageUrl` optional

### 5.3 Checkout Snapshot

Per session / intent:

- `sessionId`
- `token`
- `client identifiers`
- `billingFrequency`
- `selected items`
- `payable items`
- `follow-up items`
- `summary totals`
- `reference`
- `firstPaymentDate` optional until payment exists
- `createdAt`
- `paymentStatus`

---

## 6. Public Route Specs

## 6.1 `GET /api/subscribe/monitoring`

### Purpose

Resolve the invitation token and return the initial page context.

### Request

Query params:

- `token` required

### Response Shape

```json
{
  "token": "demo-monitoring-001",
  "clientName": "Amelia Carter",
  "companyName": "Luma Lane Studio Ltd",
  "clientLocation": "UK",
  "helpPhoneNumber": "0161 833 5400",
  "helpEmail": "enquiries@thetrademarkhelpline.com",
  "bookingUrl": "https://bookings.example.com/...",
  "preSelectedPlan": "monitoring_essentials",
  "trademarks": [
    {
      "id": "crm_tm_1",
      "name": "LUMA LANE",
      "brandName": "Luma Lane",
      "type": "word_mark",
      "jurisdiction": "GB",
      "applicationDate": "2024-02-12",
      "registrationDate": "2024-08-19",
      "expiryDate": "2034-08-19",
      "registrationNumber": "UK00003163853",
      "status": "registered",
      "riskProfile": "medium",
      "imageUrl": null
    }
  ]
}
```

### Rules

- Token must resolve to exactly one monitoring invitation context
- Returned trademarks must be eligible for monitoring subscription consideration
- Current UI assumes at least one trademark for the happy path
- `riskProfile` may be `null`
- `type` is currently consumed as:
  - `word_mark`
  - `figurative`
  - `combined`

### Errors

- `400 invalid_token`
- `410 expired_token`
- `404 no_trademarks`
- `500 server_error`

---

## 6.2 `POST /api/subscribe/monitoring/quote`

### Purpose

Recalculate quote totals and mixed payable/follow-up outcomes from the current basket state.

### Request

```json
{
  "token": "demo-monitoring-001",
  "billingFrequency": "monthly",
  "selections": [
    {
      "trademarkId": "crm_tm_1",
      "plan": "monitoring_essentials",
      "selected": true
    }
  ]
}
```

### Server Responsibilities

- validate token
- re-fetch CRM context for the token
- validate the selected trademark ids belong to that token context
- run pricing logic using current server rules
- classify selected rows into:
  - payable now
  - requires follow-up

### Response Shape

```json
{
  "billingFrequency": "monthly",
  "lineItems": [],
  "payableNowLineItems": [],
  "followUpLineItems": [],
  "planBreakdown": [],
  "summary": {
    "selectedCount": 3,
    "payableNowCount": 2,
    "requiresQuoteCount": 1,
    "subtotalMonthly": 48,
    "subtotalAnnual": 480,
    "discountMonthly": 12,
    "discountAnnual": 120,
    "totalMonthly": 36,
    "totalAnnual": 360,
    "vatMonthly": 7.2,
    "vatAnnual": 72,
    "payableTotalMonthly": 43.2,
    "payableTotalAnnual": 432,
    "annualSaving": 86.4
  }
}
```

### Rules

- Quote calculation must be server-authoritative
- Multi-trademark discount is summary-level only
- Annual price equals 10 x monthly price
- `totalMonthly` / `totalAnnual` are post-discount and pre-VAT
- For `clientLocation = UK`, VAT is `20%` of the post-discount subtotal
- `payableTotalMonthly = totalMonthly + vatMonthly`
- `payableTotalAnnual = totalAnnual + vatAnnual`
- `annualSaving = (payableTotalMonthly * 12) - payableTotalAnnual`
- MAD without `riskProfile` becomes:
  - `requiresQuote: true`
  - excluded from payable total

### Errors

- `400 invalid_request`
- `400 invalid_token`
- `404 no_trademarks`
- `500 server_error`

---

## 6.3 `POST /api/subscribe/monitoring/checkout`

### Purpose

Create and persist a checkout intent from the current basket.

### Request

Same input shape as quote:

```json
{
  "token": "demo-monitoring-001",
  "billingFrequency": "annual",
  "selections": [
    {
      "trademarkId": "crm_tm_1",
      "plan": "monitoring_essentials",
      "selected": true
    }
  ]
}
```

### Server Responsibilities

- validate token and basket
- re-fetch CRM data
- re-run quote calculation server-side
- reject checkout if `payableNowCount < 1`
- persist quote snapshot / checkout intent
- store both payable and follow-up items
- build a minimal checkout-intent payload containing only selected trademarks
- include the applied per-trademark price for the chosen billing frequency
- return:
  - `reference`
  - `session`
  - `redirectUrl`

### Zoho Custom API Payload

When the app calls the Zoho custom API for `monitoring_subscription.create_checkout_intent`, it sends a narrowed payload:

```json
{
  "operation": "monitoring_subscription.create_checkout_intent",
  "correlationId": "3f3c8fd1-7128-42bb-b87b-3c6e55f8e62d",
  "token": "demo-monitoring-001",
  "origin": "https://example.com",
  "billingFrequency": "monthly",
  "selectedTrademarks": [
    {
      "trademarkId": "crm_tm_1",
      "name": "LUMA LANE",
      "brandName": "Luma Lane",
      "jurisdiction": "GB",
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
      "jurisdiction": "GB",
      "registrationNumber": "UK00003163854",
      "plan": "monitoring_essentials",
      "billingFrequency": "monthly",
      "payableNow": true,
      "requiresQuote": false,
      "appliedPrice": 12,
      "currency": "GBP"
    }
  ],
  "summary": {
    "billingFrequency": "monthly",
    "selectedCount": 2,
    "fullPriceSubtotal": 48,
    "discount": 12,
    "subtotal": 36,
    "vat": 7.2,
    "payableTotal": 43.2
  ]
}
```

Rules:

- Only selected trademarks are included.
- The app does not send the full quote object in this operation.
- `appliedPrice` is already discount-adjusted for the chosen frequency.
- `summary` is already narrowed to the chosen billing frequency.
- For UK clients, `summary.vat` is `20%` of `summary.subtotal`.
- For quote-required items, `appliedPrice` is `null` and `requiresQuote = true`.

### Response Shape

```json
{
  "reference": "TMH-MON-ABC123",
  "session": "checkout_session_123",
  "redirectUrl": "https://mock-or-hosted-checkout-url"
}
```

### Initial CRM-First Behavior

For v1:

- create the checkout intent in CRM or in portal persistence
- return the hosted redirect from the Xero payment gateway
- preserve the same route contract so direct provider integrations can replace the internal adapter later

### Errors

- `400 invalid_request`
- `400 nothing_payable`
- `400 invalid_token`
- `500 server_error`

---

## 6.4 `GET /api/subscribe/monitoring/confirm`

### Purpose

Load the stored checkout snapshot for the confirmation page.

### Request

Query params:

- `token` required
- `session` required

### Response Shape

```json
{
  "clientName": "Amelia Carter",
  "companyName": "Luma Lane Studio Ltd",
  "helpPhoneNumber": "0161 833 5400",
  "helpEmail": "enquiries@thetrademarkhelpline.com",
  "bookingUrl": "https://bookings.example.com/...",
  "billingFrequency": "annual",
  "firstPaymentDate": "2026-04-01",
  "reference": "TMH-MON-ABC123",
  "paidItems": [],
  "followUpItems": [],
  "summary": {
    "selectedCount": 3,
    "payableNowCount": 2,
    "requiresQuoteCount": 1,
    "subtotalMonthly": 48,
    "subtotalAnnual": 480,
    "discountMonthly": 12,
    "discountAnnual": 120,
    "totalMonthly": 36,
    "totalAnnual": 360,
    "annualSaving": 72
  }
}
```

### Rules

- Confirmation must reflect the stored checkout snapshot, not a fresh recalculation
- If some items required follow-up, they must still be visible here
- Booking URL should remain available on confirmation when follow-up items exist

### Errors

- `400 invalid_session`
- `400 invalid_token`
- `404 not_found`

---

## 7. Proposed Internal CRM Endpoints

These are not public frontend routes. They are suggested backend integration seams.

### 7.1 Resolve Monitoring Token

- **Method:** `GET`
- **Internal Route:** `/crm/monitoring-links/:token`

Returns:

- client/contact info
- company info
- booking URL
- eligible trademarks
- optional preselected plan

### 7.2 Create or Refresh Quote Context

- **Method:** `POST`
- **Internal Route:** `/crm/monitoring-quotes`

Optional in phase 1 if pricing remains fully in portal code.

Could be used later to:

- store quote previews
- audit selections
- support staff visibility

### 7.3 Create Checkout Intent

- **Method:** `POST`
- **Internal Route:** `/crm/monitoring-checkout-intents`

Stores:

- invitation token
- client/contact/account references
- basket snapshot
- totals
- follow-up items
- billing frequency
- internal status

### 7.4 Load Checkout Intent

- **Method:** `GET`
- **Internal Route:** `/crm/monitoring-checkout-intents/:sessionId`

Returns the persisted snapshot for confirmation or later payment reconciliation.

---

## 8. Suggested CRM Field Mapping

Exact Zoho field names still need confirmation. This is the initial mapping model.

| Portal Field | Likely CRM Source | Notes |
|---|---|---|
| `token` | monitoring invitation record | token should not be inferred from contact id alone |
| `clientName` | contact full name | display-friendly |
| `companyName` | account / business name | optional |
| `helpPhoneNumber` | portal config or CRM org settings | likely static config, not per client |
| `helpEmail` | portal config or CRM org settings | likely static config |
| `bookingUrl` | CRM config / campaign / product config | may vary by queue or campaign |
| `preSelectedPlan` | invitation metadata | optional |
| `trademarks[].id` | trademark record id | stable per CRM record |
| `trademarks[].name` | word mark / descriptive label | required for UI |
| `trademarks[].brandName` | related brand / case grouping | optional but useful |
| `trademarks[].type` | mark type | must normalize into portal enums |
| `trademarks[].jurisdiction` | jurisdiction field | GB, EU, WIPO, etc |
| `trademarks[].applicationDate` | filing/application date | optional |
| `trademarks[].registrationDate` | registration date | optional |
| `trademarks[].expiryDate` | renewal / expiry date | optional but shown in UI |
| `trademarks[].registrationNumber` | registration number | optional for some states |
| `trademarks[].status` | trademark status | must normalize |
| `trademarks[].riskProfile` | monitoring risk scoring | nullable |
| `trademarks[].imageUrl` | asset URL / generated preview | optional |

---

## 9. Validation Rules

### Token Validation

- token is required on all monitoring routes
- expired tokens must return a deterministic expired state
- token must be scoped to the correct client context

### Basket Validation

- every selected trademark id must belong to the resolved token context
- plan must be one of:
  - `monitoring_defence`
  - `monitoring_essentials`
  - `annual_review`
- billing frequency must be:
  - `monthly`
  - `annual`

### Checkout Validation

- at least one selected item must be payable now
- quote-required items can remain in the basket, but must not be charged immediately

---

## 10. Error Model

Recommended standard error shape:

```json
{
  "code": "invalid_token",
  "message": "Invalid link. Please contact us for a fresh monitoring invitation."
}
```

Initial codes:

- `invalid_token`
- `expired_token`
- `no_trademarks`
- `server_error`
- `invalid_request`
- `invalid_session`
- `nothing_payable`

---

## 11. Delivery Phases

### Phase 1: CRM Data Read

- implement token resolution
- fetch real client and trademark data
- keep mock quote + mock checkout if needed

### Phase 2: Real Quote Inputs

- use CRM-backed trademark records in quote calculation
- validate basket against CRM data on every quote request

### Phase 3: Checkout Persistence

- persist quote snapshot / checkout intent
- support confirmation lookup from stored session

### Phase 4: GoCardless Integration

- replace mock redirect URL with hosted GoCardless redirect
- map returned payment session into stored checkout intent

---

## 12. Open Questions

- Where should invitation tokens live:
  - Zoho CRM custom module
  - portal database
  - another integration layer
- Which CRM records define “eligible for monitoring”
- Should `helpPhoneNumber` and `helpEmail` come from app config instead of CRM
- Does booking URL vary by campaign, team, or product type
- Should quote previews be persisted for staff visibility before checkout starts
- What is the final storage location for checkout intents before GoCardless is live
- Which exact CRM field supplies `riskProfile`
- Do we need stronger status normalization beyond `registered` and `pending`

---

## 13. Immediate Next Step

Implement `GET /api/subscribe/monitoring` against real CRM data first.

That unlocks:

- real page loading
- real trademark context
- real `riskProfile` behavior
- realistic quote testing

After that, wire `POST /api/subscribe/monitoring/quote` to the same CRM-backed token resolution and keep pricing in the portal backend.
