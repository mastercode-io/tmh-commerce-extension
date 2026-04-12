# User-Facing Route Map

This document defines the customer-facing information architecture for TMH Commerce Extension and replaces the placeholder `/requests/*` paths previously used in the migration pack.

The goal is simple:
- use customer language in URLs
- keep internal domain models like `RequestSummary` and `OrderSummary` out of primary route naming
- separate service entry flows from payable order/checkout flows
- keep room for future commerce features without exposing workspace-era naming

## 1. Route Naming Principles

- Use service names for service-entry journeys: `renewal`, `audit`, `application`, `support`.
- Use `orders` only once a payable commercial object exists.
- Use `account` for authenticated visibility and history.
- Keep API route families explicit and domain-specific even when UI routes are more user-friendly.

## 2. Primary User-Facing Areas

### A. Public / entry flows

- `/`
- `/subscribe/monitoring`
- `/preferences`
- `/renewal`
- `/audit`
- `/application`
- `/support`

### B. Transactional order / checkout flows

- `/orders/[orderId]`
- `/orders/[orderId]/confirmation`

These routes are the user-facing commercial review and confirmation surfaces once an order exists.

### C. Account

- `/account`
- `/account/orders`
- `/account/payments`
- `/account/subscriptions`
- `/account/preferences`
- `/account/profile`
- `/account/services`

`/account/services` is the customer-friendly replacement for a generic “requests” history page. Internally, the app can still use `RequestSummary`.

## 3. Migration Flow Mapping

### Renewal

- entry: `/renewal?token=...`
- order/review: `/orders/[orderId]`
- confirmation: `/orders/[orderId]/confirmation`

### Audit

- start: `/audit`
- summary: `/audit/summary/[orderId]`
- confirmation: `/audit/confirmation/[orderId]`

### Future application flow

- start: `/application`
- if payable: `/orders/[orderId]`
- confirmation: `/orders/[orderId]/confirmation`

### Future support / callback flow

- entry: `/support`

Support may not always create a payable order, so it should not be forced into `/orders/*`.

## 4. Internal Model Boundary

These internal types remain valid and should not drive customer-facing route names:
- `RequestSummary`
- `OrderSummary`
- `PaymentSummary`

Recommended rule:
- customer-facing routes use service language
- internal lists, adapters, and account data models can still use request/order/payment terminology

## 5. API Route Alignment

Customer-facing paths do not require matching API nouns.

Recommended API families remain:
- `/api/renewals/*`
- `/api/audit/*`
- `/api/temmy/*`
- `/api/preferences/*`
- `/api/subscriptions/*`
- `/api/account/*`

The UI should stay user-friendly even when the server contracts remain explicit and domain-oriented.

## 6. Route Acceptance

This is the accepted route model for starting migration implementation work.

If future flows are added, they should fit these rules:
- service entry path first
- shared `/orders/[orderId]` only when a real payable commercial object exists
- account visibility under `/account/*`
