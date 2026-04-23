# Target Implementation Blueprint

This document turns the migration pack into a concrete implementation shape for `tmh-commerce-extension`.

It is intentionally opinionated:
- keep the target app's architecture
- keep the target app's visual system
- add dedicated flow modules for renewal and audit
- isolate CRM and payment quirks behind server-side adapters

## 1. Guiding Rule

Do not recreate the source repo's `public/*` page structure inside the target app.

Instead:
- implement feature routes in the App Router
- keep page-specific orchestration inside feature modules
- keep Zoho / CRM / Xero translation inside server utilities
- expose normalized contracts to React components

## 2. Recommended Route Structure

Suggested target routes:

- `app/(marketing)/renewal/page.tsx`
- `app/(marketing)/orders/[orderId]/page.tsx`
- `app/(marketing)/orders/[orderId]/confirmation/page.tsx`
- `app/(marketing)/audit/page.tsx`
- `app/(marketing)/audit/summary/[orderId]/page.tsx`
- `app/(marketing)/audit/confirmation/[orderId]/page.tsx`

Suggested target API routes:

- `app/api/renewals/details/route.ts`
- `app/api/renewals/orders/route.ts`
- `app/api/renewals/orders/[orderId]/route.ts`
- `app/api/renewals/orders/[orderId]/payment-link/route.ts`
- `app/api/renewals/orders/[orderId]/payment-status/route.ts`
- `app/api/audit/lead/route.ts`
- `app/api/audit/orders/sections/route.ts`
- `app/api/audit/orders/[orderId]/route.ts`
- `app/api/audit/orders/[orderId]/payment/route.ts`
- `app/api/audit/orders/[orderId]/confirmation/route.ts`
- `app/api/temmy/search/route.ts`

## 3. Recommended Feature Module Layout

Suggested app-internal module layout:

- `features/renewals/components/*`
- `features/renewals/lib/client/*`
- `features/renewals/lib/server/*`
- `features/renewals/lib/validators/*`
- `features/renewals/lib/mappers/*`
- `features/renewals/lib/types.ts`
- `features/audit/components/*`
- `features/audit/lib/client/*`
- `features/audit/lib/server/*`
- `features/audit/lib/validators/*`
- `features/audit/lib/mappers/*`
- `features/audit/lib/types.ts`

What belongs in each area:

- `components`: route-local UI, step layouts, cards, summaries, CTA panels
- `lib/client`: fetch helpers, polling helpers, client-side state machines, zod parsers if used
- `lib/server`: route handlers, upstream API calls, normalization, error mapping
- `validators`: field rules, gating rules, multi-step section validation
- `mappers`: CRM snake_case to app camelCase translation
- `types.ts`: target-side contracts used by UI and handlers

## 4. Renewal Build Shape

Recommended renewal page composition:

### `/renewal`

Server concerns:
- read `token` from search params
- call renewal details API
- block early on missing / invalid token

UI sections:
- account / contact intro
- primary trademark summary
- additional renewals selection
- screening questions
- contact details form
- consent/authority section
- submit CTA

Client state:
- resolved token
- selected trademark ids
- screening answers
- contact form values
- submit pending / error state

Submit behavior:
- post to `POST /api/renewals/orders`
- redirect using stable `orderId`
- never embed the order payload in the URL

### `/orders/[orderId]`

Server concerns:
- load order details by `orderId`
- normalize line items, totals, payment status

UI sections:
- order/trademark summary
- totals panel
- terms acceptance
- pay now CTA
- payment waiting / retry / failure panels

Client state:
- terms accepted
- payment-link request pending
- polling status
- terminal payment state

### `/orders/[orderId]/confirmation`

Server concerns:
- verify order exists
- verify payment success if server support is available

UI sections:
- success banner
- renewal/order reference
- next steps / support contact

Fallback rule:
- if full server verification is not available immediately, replicate the client/session guard temporarily

## 5. Audit Build Shape

Recommended audit wizard composition:

### `/audit`

Wizard sections to preserve:
- contact
- preferences
- trademark status
- Temmy lookup
- trademark info
- goods/services
- billing
- appointment
- payment options

Implementation rule:
- keep wizard state structured by section
- do not flatten wizard state into CRM field names in React state

Persistence rule:
- save by section
- let the server become authoritative for resumed progress

### `/audit/summary/[orderId]`

Server concerns:
- load saved sections
- load server-authoritative pricing
- load any payment availability state

UI sections:
- summary of all sections
- pricing/totals
- checkout CTA

### `/audit/confirmation/[orderId]`

Server concerns:
- load final order/request status
- show what was submitted and any post-checkout status

## 6. Shared Infrastructure To Add

The target app should add these shared primitives once, then reuse them:

- `normalizePaymentStatus(rawStatus): PaymentSummary['status']`
- `normalizeRequestStatus(rawStatus): RequestSummary['status']`
- `parseZohoError(error): AppError`
- `buildPublicFlowContext(searchParams, headers): FlowContext`
- `assertRequiredToken(token): void`
- `pollPaymentStatus(getStatus, options): Promise<PaymentTerminalState>`

These should live in shared commerce/server utilities if they will be reused beyond renewal/audit.

## 7. Validation Strategy

Recommended split:

- route handlers validate full request payloads
- client validates only enough for user feedback and CTA enablement
- server remains authoritative

Renewal validation modules:

- `validateRenewalContact`
- `validateRenewalScreening`
- `validateRenewalSelection`
- `canSelfServeRenewal`

Audit validation modules:

- `validateAuditContactSection`
- `validateAuditTmStatusSection`
- `validateAuditBillingSection`
- `validateAuditPaymentOptions`

## 8. Data Ownership Rules

Keep these ownership boundaries strict:

- UI owns display state
- feature modules own form and wizard state
- app API routes own upstream request/response normalization
- adapter layer owns CRM field translation
- server owns pricing and payment truth

Do not let:

- React components build CRM payloads directly
- page routes contain large response normalization blocks
- client code decide final pricing or order status

## 9. Migration Order Inside The Target App

Recommended execution order:

1. Add target-side types from `renewal-target-schemas.md` and `audit-target-schemas.md`
2. Add server adapter/mapping layer
3. Add API routes
4. Add renewal flow UI
5. Add renewal order/payment flow
6. Add renewal confirmation route
7. Add audit wizard flow
8. Add audit summary/payment flow
9. Add audit confirmation route
10. Connect account/history surfaces to normalized request/order summaries

## 10. What Not To Port Literally

Do not port these source details literally unless the target app explicitly needs them:

- source folder names under `public/`
- current HTML section ordering
- current CSS classes
- current DOM-driven validation style
- base64 URL order transport
- source client-side price math for audit summary

## 11. Minimum First PR Scope

If you want to de-risk this migration, the first target-app PR should only do:

- add renewal target types
- add renewal API routes
- add renewal landing page
- add renewal order page with payment-link and polling
- add parity fixtures for token success/failure and payment states

That is the smallest slice that proves the architecture without mixing in the larger audit wizard.
