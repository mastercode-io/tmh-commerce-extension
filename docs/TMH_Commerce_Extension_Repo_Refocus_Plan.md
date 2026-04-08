# TMH Commerce Extension — Repo Refocus Plan

## Status
Working implementation plan for the current TMH commerce phase.

## Purpose

Translate the narrowed production scope into a practical repo-level refocus plan so the current application can be pushed toward production without drifting back into Temmy Portal / Braudit workspace concerns.

This plan is intentionally narrow.

It assumes:
- the current repository is a **TMH-specific commercial extension**,
- Braudit / Temmy operational workspace work is deferred,
- existing portal-like proof-of-concept pieces may be preserved only as future reference,
- the immediate objective is to ship the commercial/account layer for TMH website users.

---

## 1. Refocus decision

### Current repository role
Treat the repository as:

**TMH Commerce Extension**  
A TMH-specific customer account and commerce application for:
- subscriptions,
- orders,
- payments,
- profile/preferences,
- service requests,
- CRM-connected commercial flows.

### Explicit non-role
Do **not** treat this repository as:
- Temmy operational workspace,
- Braudit operational platform,
- long-term provider-agnostic portal,
- multi-tenant white-label app,
- results/reports/alerts workspace.

---

## 2. Desired production shape

The app should converge toward three bounded areas:

### A. Entry / acquisition continuation
User arrives from TMH website and continues a commercial flow.

Typical journeys:
- start subscription
- update email preferences
- continue from campaign/landing page
- open request flow
- sign in to account

### B. Account / commerce
Authenticated customer account focused on commercial visibility.

Core areas:
- Orders
- Payments
- Subscriptions
- Billing summary
- Profile / Preferences

### C. Requests
Commercial request flows for near-term services.

Core request types:
- request audit
- request renewal
- request trademark application
- request support / callback

This is enough for v1.

---

## 3. Repo restructuring goals

## 3.1 Keep
Keep and productionize anything directly supporting:
- subscriptions
- orders
- payments
- account visibility
- profile/preferences
- Zoho commercial synchronization
- marketing-linked entry flows

## 3.2 Archive, don’t delete
Archive portal/workspace proof-of-concept work as:
- future Temmy workspace reference
- design/archive material
- not current implementation scope

## 3.3 Rename for clarity
Rename internal docs/routes/components so the repo no longer presents itself as a general “portal” without qualification.

Goal:
- reduce conceptual drift,
- prevent future contributors from assuming this is already the Temmy workspace app.

---

## 4. Recommended repo-level actions

## 4.1 Add a top-level scope note
Add a short section to the README or docs index:

> This repository is the TMH Commerce Extension: a TMH-specific customer account and commerce application covering subscriptions, orders, payments, preferences, and CRM-connected commercial flows. It is not the Temmy operational workspace and not the Braudit operational platform. Existing portal/workspace proof-of-concept material is retained only as reference for future Temmy work.

This should be done first.

---

## 4.2 Reclassify existing portal/workspace artifacts
Create a folder or docs section such as:

- `docs/archive-temmy-poc/`
or
- `docs/future-temmy-reference/`

Move or duplicate conceptual docs there:
- portal IA
- workspace mockups
- brand portfolio concepts
- reports/results/alerts workspace flows
- broader platform notes that are not current repo scope

### Rule
Keep them accessible, but clearly mark them as:
- future reference
- not active implementation target

---

## 4.3 Introduce a commerce-first docs structure
Recommended docs structure:

- `docs/01-scope/`
- `docs/02-product/`
- `docs/03-integrations/`
- `docs/04-implementation/`
- `docs/archive-temmy-poc/`

Suggested files:
- `docs/01-scope/tmh-commerce-extension-production-scope-v1.md`
- `docs/01-scope/repo-refocus-plan.md`
- `docs/02-product/subscription-flow.md`
- `docs/02-product/account-pages.md`
- `docs/02-product/request-flows.md`
- `docs/03-integrations/zoho-adapter.md`
- `docs/03-integrations/payment-integration.md`
- `docs/03-integrations/email-preferences-sync.md`

---

## 4.4 Rename product language in code and docs
Where practical, replace vague or misleading terms.

### Prefer
- `account`
- `orders`
- `subscriptions`
- `payments`
- `preferences`
- `requests`
- `commerce`
- `billing`

### Avoid for current repo
- generic `portal`
- `workspace`
- `reports`
- `alerts`
- `brand-portfolio`
- `monitoring`
- `results`

unless the component is explicitly archived or clearly marked as future Temmy reference.

---

## 4.5 Isolate Zoho integration into a clear adapter layer
If not already centralized, create or formalize a layer such as:

- `lib/zoho/`
or
- `src/services/zoho/`

Move Zoho-specific logic behind named functions/services such as:
- `findOrCreateContact`
- `findOrCreateAccount`
- `createCommercialRequest`
- `createSubscriptionRecord`
- `syncEmailPreferences`
- `logPaymentEvent`
- `updateSubscriptionState`

### Goal
Keep TMH-specific CRM coupling strong but localized.

This is acceptable for this repo and useful later if the app is split further.

---

## 4.6 Separate commercial flows from generic UI components
UI should distinguish:
- reusable display components
- TMH-specific business flow components

Suggested conceptual split:
- `components/ui/`
- `components/account/`
- `components/subscriptions/`
- `components/orders/`
- `components/payments/`
- `components/preferences/`
- `components/requests/`

This will make current scope clearer and reduce portal/workspace bleed.

---

## 5. Route / module priorities

## 5.1 Highest-priority routes/modules
These should become the primary production target.

### Subscription flow
- package selection
- checkout handoff / payment state
- success / failure / pending screens
- CRM writeback

### Account home
- summary dashboard with:
  - current subscriptions
  - recent orders
  - recent payments
  - quick actions

### Orders
- order history
- request/order statuses

### Payments
- payment history
- receipt/invoice references if available

### Subscriptions
- active subscriptions
- core subscription state
- actions if backend supports them

### Preferences
- email preferences
- profiling/compliance fields as needed

### Requests
- request audit
- request renewal
- request application
- request support

---

## 5.2 Medium-priority items
- billing summary
- profile editing
- account notifications
- request confirmation/history
- simple admin/debug tooling

---

## 5.3 Explicitly de-prioritized
- full workspace navigation
- reports area
- monitoring results pages
- alerts center
- brand/trademark operational management
- role-heavy representative portal behavior
- white-label theming

These should not shape near-term routing or navigation.

---

## 6. Recommended navigation for the current repo

Keep the navigation minimal and commercial.

Suggested top-level navigation:
- Home / Dashboard
- Orders
- Payments
- Subscriptions
- Preferences
- Requests
- Support

Optional:
- Billing
- Profile

Avoid introducing:
- Portfolio
- Reports
- Results
- Alerts
- Monitoring
- Workspace

for this phase.

---

## 7. Data and state priorities

The current repo should prioritize these data concepts:

- user identity
- CRM correlation ids
- order/request ids
- payment state
- subscription state
- billing summary
- preference state
- request state

### Secondary only
- references to future operational entities,
- links into future Temmy/Braudit surfaces,
- placeholder stubs for future integrations.

---

## 8. Incremental implementation plan

## Step 1 — Scope freeze
- add README scope note
- add refocus plan doc
- mark archived Temmy/workspace items

## Step 2 — Route and naming cleanup
- rename ambiguous pages/components/docs
- align nav and copy to commerce/account language
- remove or hide non-scope pages from main navigation

## Step 3 — Zoho adapter cleanup
- centralize CRM calls
- standardize request/order/subscription write functions
- make flows idempotent where possible

## Step 4 — Subscription production path
- finish mock-to-real wiring
- payment callbacks/webhooks
- success/failure/pending state handling
- account reflection

## Step 5 — Account visibility pages
- orders
- payments
- subscriptions
- preferences

## Step 6 — Request flows
- audit
- renewal
- application
- support

## Step 7 — Production hardening
- environment setup
- logging
- error handling
- fallback states
- admin/debug visibility

---

## 9. Technical hygiene recommendations

### Add explicit boundaries in code comments/docs
When something is TMH-only, say so.

### Add correlation IDs where useful
For:
- payment events
- Zoho writes
- request submissions
- subscription updates

### Prefer server-side integration boundaries
Keep CRM/payment writes in server actions or backend handlers, not client-side flows.

### Normalize statuses early
For example:
- subscription status
- payment status
- request status
- order status

Even if Zoho/payment providers use different labels internally, present one clean app-level model.

---

## 10. Suggested immediate tickets

1. Add repo scope statement to README
2. Create archive section for future Temmy portal/reference docs
3. Audit routes/components and tag each as:
   - keep
   - archive
   - rename
   - remove from nav
4. Centralize Zoho adapter calls
5. Finalize subscription production path
6. Build/account polish:
   - Orders
   - Payments
   - Subscriptions
   - Preferences
7. Implement request flows
8. Add production hardening checklist

---

## 11. Success criteria for this refocus

The refocus is successful when:

- the repo is clearly documented as TMH Commerce Extension,
- non-scope portal/workspace concepts no longer drive navigation or implementation priority,
- Zoho coupling is centralized and understandable,
- subscription flow is production-ready,
- account pages give users commercial visibility,
- email preferences flow is reliable,
- request flows exist for near-term services,
- future Temmy workspace material is preserved without confusing the current implementation scope.

---

## 12. Locked repo-level statement

> This repository is the TMH Commerce Extension and should now be refocused exclusively on TMH-specific customer account and commerce flows: subscriptions, orders, payments, preferences, and service requests, backed by Zoho CRM and payment integrations. Existing portal/workspace proof-of-concept material should be preserved only as reference for future Temmy work and must not shape current production priorities.
