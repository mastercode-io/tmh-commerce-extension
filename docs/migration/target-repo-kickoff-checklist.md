# Target Repo Kickoff Checklist

This checklist is the implementation handoff for starting work in `tmh-commerce-extension`.

Use it once the target repo is available locally.

## 1. Preconditions

- migration decision gates are locked
- user-facing route map is accepted
- target repo path is available locally
- environment owners for Zoho/payment integration are known

Reference docs:
- `implementation-plan-tracker.md`
- `user-facing-route-map.md`
- `phase-1-shared-infrastructure-spec.md`
- `fixture-inventory-plan.md`

## 2. First File/Folder Skeleton To Create

Create these paths first:

- `lib/commerce/status.ts`
- `lib/commerce/errors.ts`
- `lib/commerce/flow-context.ts`
- `lib/commerce/payment-polling.ts`
- `features/renewals/lib/types.ts`
- `features/audit/lib/types.ts`
- `features/renewals/lib/server/`
- `features/renewals/lib/client/`
- `features/renewals/lib/validators/`
- `features/renewals/lib/mappers/`
- `features/audit/lib/server/`
- `features/audit/lib/client/`
- `features/audit/lib/validators/`
- `features/audit/lib/mappers/`
- `app/(marketing)/renewal/page.tsx`
- `app/(marketing)/orders/[orderId]/page.tsx`
- `app/(marketing)/orders/[orderId]/confirmation/page.tsx`
- `app/(marketing)/audit/page.tsx`
- `app/(marketing)/audit/summary/[orderId]/page.tsx`
- `app/(marketing)/audit/confirmation/[orderId]/page.tsx`
- `app/api/renewals/details/route.ts`
- `app/api/renewals/orders/route.ts`
- `app/api/renewals/orders/[orderId]/route.ts`
- `app/api/renewals/orders/[orderId]/payment-link/route.ts`
- `app/api/renewals/orders/[orderId]/payment-status/route.ts`
- `app/api/renewals/orders/[orderId]/confirmation/route.ts`
- `app/api/audit/lead/route.ts`
- `app/api/audit/orders/sections/route.ts`
- `app/api/audit/orders/[orderId]/route.ts`
- `app/api/audit/orders/[orderId]/payment/route.ts`
- `app/api/audit/orders/[orderId]/confirmation/route.ts`
- `app/api/temmy/search/route.ts`

## 3. Implementation Order Inside The Target Repo

### Step 1
Implement shared primitives and helpers:
- `lib/commerce/status.ts`
- `lib/commerce/errors.ts`
- `lib/commerce/flow-context.ts`
- `lib/commerce/payment-polling.ts`

### Step 2
Add flow-specific type files:
- `features/renewals/lib/types.ts`
- `features/audit/lib/types.ts`

### Step 3
Add renewal server routes and server-side mappers first.

### Step 4
Add renewal UI routes.

### Step 5
Add audit server routes.

### Step 6
Add audit UI routes.

### Step 7
Add account/history integration later.

## 4. Initial Acceptance Checks

Before writing feature UI, confirm:
- `/renewal?token=...` is the accepted entry route
- `/orders/[orderId]` is the accepted commercial order route
- `/audit` is the accepted audit entry route
- `/account/services` is the accepted future account history label for service flows
- `not_found -> cancelled` is implemented in the payment status mapper
- renewal confirmation is designed around server verification

## 5. What Not To Build First

Do not start with:
- account/history integration
- broad generic `/requests/new` replacements
- portfolio/workspace-era routes
- client-side price calculation for audit
- old base64 URL payload transport for renewal

## 6. First PR Scope Recommendation

Smallest useful first PR in the target repo:
- shared status/type primitives
- payment status mapper
- payment polling helper
- fixture directory layout
- renewal type contracts
- empty renewal API route stubs with TODO markers

Second PR:
- renewal details + create-order + order-read route handlers

Third PR:
- renewal UI flow

## 7. Current Limitation

This workspace does not contain the target repo, so actual code implementation cannot start here.

Until the target repo is available, the correct output is implementation-ready planning and file/module specifications, which this checklist provides.
