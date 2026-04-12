# Target App Mapping: `tmh-commerce-extension`

This document maps the source flows in this repository into the actual structure and contract model of the target app:

- GitHub repo: `mastercode-io/tmh-commerce-extension`

Target references used:
- `README.md`
- `package.json`
- `docs/TMH_Commerce_Extension_Production_Scope_v1.md`
- `docs/TMH_Commerce_Extension_Implementation_Order_v1.md`
- `docs/TMH_Commerce_Extension_Implementation_Workstreams_v1.md`
- `docs/TMH_Commerce_Extension_Blockers_Next_Handoff_TODO_v1.md`
- `docs/TMH_Commerce_Extension_Zoho_Commerce_Custom_API_Contract_v1.md`
- `app/api/requests/route.ts`
- `lib/zoho/commerce.ts`
- `lib/commerce/types.ts`

## 1. Target App Reality

The target app is already positioned as:
- a TMH-specific commerce/account extension
- Next.js App Router
- React 19
- Tailwind CSS v4
- Edge runtime for some routes
- normalized server-side Zoho adapter layer

It already has:
- normalized account surfaces
- normalized request creation route
- normalized commerce object types
- generic request types:
  - `audit`
  - `renewal`
  - `application`
  - `support`

It does not yet have:
- a dedicated renewal tokenized flow like the one in this repo
- a dedicated audit wizard with incremental saves
- a full replacement for the source repo’s renewal payment lifecycle

## 2. Mapping By Flow

## Renewal

Source:
- `multi-deal-order`

Target fit:
- partially fits existing `requestType: 'renewal'`
- but parity requires more than generic request creation

Why generic request creation alone is not enough:
- renewal has tokenized prefill
- renewal has trademark-specific data hydration
- renewal has screening logic
- renewal has order summary creation
- renewal has hosted payment-link creation
- renewal has payment polling and confirmation guard
- renewal now must preserve multi-renewal selection

Recommendation:
- implement a dedicated renewal route family in `tmh-commerce-extension`
- use normalized commerce records underneath
- optionally also create/update a normalized `RequestSummary` with `requestType: 'renewal'`

Suggested target route family:
- `/renewal`
- `/orders/[orderId]`
- `/orders/[orderId]/confirmation`
- app API routes dedicated to renewal details/order/payment

## Audit

Source:
- `dev`

Target fit:
- partially fits existing `requestType: 'audit'`
- full parity still requires a dedicated wizard flow

Why:
- audit is not just a one-shot request form
- it is a staged funnel with:
  - local state
  - Temmy lookup
  - step gating
  - billing capture
  - summary pricing
  - payment handoff

Recommendation:
- implement a dedicated audit route family in `tmh-commerce-extension`
- also write normalized `RequestSummary` and `OrderSummary` records so account history can surface them

Suggested target route family:
- `/audit`
- `/audit/summary/[orderId]`
- `/audit/confirmation/[orderId]`

## Generic / newer order-payment surface

Source:
- `dev` generic `/order.html` and `/api/orders/*`

Target fit:
- strongest match for the target app’s normalized commerce types
- especially:
  - `OrderSummary`
  - `PaymentSummary`
  - account visibility surfaces

Recommendation:
- treat this source mostly as a payment/order-state pattern reference
- not as a separate user-facing flow to migrate independently

## 3. Best Target Architecture

## Dedicated feature routes

Create dedicated feature route families for:
- renewal
- audit
- generic application request if needed later

Do not try to force them all through a single generic `/requests/new` form if parity matters.

Customer-facing route naming should follow the accepted route map in `user-facing-route-map.md`, not the internal `RequestSummary` model name.

## Shared normalized commerce layer

Underneath those route families, reuse the target app’s normalized adapter model:
- `OrderSummary`
- `PaymentSummary`
- `RequestSummary`
- `SubscriptionSummary` where relevant

This is the right layer to preserve and extend.

## Dedicated Zoho operations where needed

The target app already uses:
- generic `commerce.*` operations for summary/list/create request behavior
- dedicated monitoring subscription operations for a more complex flow

Renewal and audit should follow the same pattern:
- keep generic commerce API for generic account/request read models
- add dedicated custom API operations for complex multi-step flows

## 4. Recommended Target Contract Split

## Keep generic commerce API for:

- account summary
- request list
- order list
- payment list
- request creation metadata/history

## Add dedicated renewal API for:

- resolve renewal token
- create/update renewal order
- get renewal order summary
- create payment link
- get payment status

## Add dedicated audit API for:

- create/update audit lead
- create/update audit order sections
- get audit order
- create audit payment / checkout

## 5. Mapping To Existing Target Types

Source renewal order maps naturally into target `OrderSummary` and `PaymentSummary`.

Recommended mapping:

- source deal/order summary -> target `OrderSummary`
- source payment polling result -> target `PaymentSummary.status`
- source renewal submission -> target `RequestSummary` with `requestType: 'renewal'`
- source audit submission -> target `RequestSummary` with `requestType: 'audit'`

Important caveat:
- the source repo includes richer page-specific payloads than the target generic account types
- preserve page-specific detail payloads for active flows
- map into normalized summary types for account/history views

## 6. Status Mapping Direction

Target app statuses are cleaner than the source repo’s current strings.

Examples:
- source payment `paid` -> target payment `succeeded`
- source payment `pending` -> target payment `pending`
- source payment `failed` -> target payment `failed`
- source payment `voided` / `not_found` may map to target `cancelled` or `failed` depending on business decision

Recommendation:
- define canonical mapping in the server adapter layer
- never let raw source/Xero strings leak into React screens

## 7. Migration Recommendation By Priority

## First

Implement renewal as a dedicated flow in the target app because:
- it has the strongest behavioral requirements
- it has tokenized CRM-linked entry
- multi-renewal must stay

## Second

Implement audit as a dedicated wizard flow because:
- generic request creation alone is too shallow
- it can still feed normalized request/order history

## Third

Fold generic order/payment behaviors into the target app’s normalized order/payment/account surfaces.

## 8. Clear Rule For This Migration

Use `tmh-commerce-extension` as:
- the target UI system
- the target route architecture
- the target normalized commerce model

Use this repo as:
- the source of business behavior
- the source of field/validation rules
- the source of CRM/Xero integration expectations

Do not port the old frontend layout as a parallel product inside the target app.
