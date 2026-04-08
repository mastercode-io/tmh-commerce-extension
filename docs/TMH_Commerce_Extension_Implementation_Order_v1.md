# TMH Commerce Extension — Implementation Order v1

## Purpose

Provide a practical implementation order for pushing the TMH Commerce Extension into production after the repo refocus.

For execution grouping and ticket-level stream planning, also use `TMH_Commerce_Extension_Implementation_Workstreams_v1.md`.

This is ordered to:
- reduce scope drift,
- unblock the subscription production path first,
- keep Zoho coupling under control,
- avoid spending time on future Temmy/Braudit concerns.

---

## Phase 0 — Scope freeze and repo hygiene

### 0.1 Lock the repo role
Add/update top-level project docs so the repo explicitly states:

- this is the **TMH Commerce Extension**
- it is a TMH-specific account/commerce app
- Temmy/Braudit workspace concerns are out of scope for this phase

### 0.2 Archive future-reference docs
Move portal/workspace proof-of-concept docs into an archive/future-reference section:
- `tmh_portal_data_model.md`
- `tmh_portal_dev_spec.md`
- `tmh_portal_flow_diagrams.md`
- `tmh_portal_user_stories.md`
- `poc-phase1-implemenation-plan.md`

### 0.3 Freeze navigation scope
Remove or hide any non-commerce/workspace-era items from active navigation.

### Deliverable
A clean repo that no longer presents itself as a mixed portal/workspace app.

---

## Phase 1 — Route and naming cleanup

### 1.1 Refocus route groups
Keep active:
- `(marketing)`
- `(subscribe)`
- `(auth)`
- `(standalone)/settings`
- `api`

Narrow:
- `(onboarding)`

Rename/refocus:
- `(dashboard)` → commercial **Account** area

### 1.2 Align route intent
Target route families:
- marketing / subscribe
- account
- preferences
- requests
- support
- auth

### 1.3 Rename vague labels in UI/copy
Prefer:
- Account
- Orders
- Payments
- Subscriptions
- Preferences
- Requests

Avoid for this phase:
- Workspace
- Portfolio
- Results
- Reports
- Alerts
- Monitoring

### Deliverable
A route structure and UI language that reflect the narrowed TMH commerce scope.

---

## Phase 2 — Integration boundary cleanup

### 2.1 Centralize Zoho adapter
Create or clean a dedicated integration layer such as:
- `lib/zoho/`
or
- `services/zoho/`

### 2.2 Normalize commercial functions
Centralize functions such as:
- contact lookup/create
- account lookup/create
- subscription record create/update
- payment event logging
- request creation
- preferences sync

### 2.3 Move integration writes server-side
Keep CRM/payment writes in server actions or API routes, not client-side components.

### 2.4 Add correlation IDs
Introduce stable correlation for:
- subscription attempts
- payment callbacks
- request submissions
- Zoho writes

### Deliverable
A clean TMH-specific commercial adapter layer that is easier to debug and extend.

---

## Phase 3 — Subscription production path

### 3.1 Finalize product/package configuration
Replace remaining mock assumptions with real package config.

### 3.2 Wire checkout/payment state
Support full flow:
- initiated
- pending
- succeeded
- failed
- cancelled if relevant

### 3.3 Write back to Zoho
On successful or meaningful state changes:
- create/update contact
- create/update commercial request/order/subscription records
- log payment correlation

### 3.4 Build final user-facing states
Create clean pages/screens for:
- subscription started
- payment pending
- payment success
- payment failed
- already subscribed / duplicate flow if relevant

### Deliverable
The main monetization path is production-ready.

---

## Phase 4 — Account area

### 4.1 Account home
Build a minimal account dashboard with:
- current subscriptions
- recent orders
- recent payments
- quick actions

### 4.2 Orders page
Show:
- order/request history
- statuses
- created dates
- relevant references

### 4.3 Payments page
Show:
- payment history
- amounts
- dates
- references
- receipt/invoice links if available

### 4.4 Subscriptions page
Show:
- active subscriptions
- status
- plan/package
- renewal/billing cadence
- actions if supported

### Deliverable
Customers can log in and see their commercial history and active subscription state.

---

## Phase 5 — Preferences flow hardening

### 5.1 Keep existing flow
Do not redesign unless necessary.

### 5.2 Harden reliability
Ensure:
- idempotent sync
- proper success/error states
- CRM sync observability
- clean auth/entry handling

### 5.3 Align copy and routing
Treat it as:
- preferences
- profiling/compliance
- lead-gen follow-up

### Deliverable
A reliable live preferences flow that supports TMH marketing/compliance goals.

---

## Phase 6 — Request flows

### 6.1 Implement request forms
Start with:
- request audit
- request renewal
- request trademark application
- request support/callback

### 6.2 Keep them commercially scoped
These can initially create CRM-backed requests/orders rather than full downstream automation.

### 6.3 Connect from account and marketing
Users should be able to enter these from:
- account
- landing pages
- support/request entry points

### Deliverable
The app can handle near-term commercial requests beyond subscriptions.

---

## Phase 7 — Production hardening

### 7.1 Environment separation
Ensure clean environment config for:
- local
- preview
- production

### 7.2 Error handling
Add:
- safe fallbacks
- user-facing errors
- retry-safe handlers where needed

### 7.3 Webhook validation
For payment callbacks and related integrations:
- signature verification
- duplicate event protection
- idempotent processing

### 7.4 Logging and supportability
Add useful logs for:
- Zoho writes
- payment callbacks
- request creation
- subscription state changes

### 7.5 Lightweight admin/debug visibility
Enough to troubleshoot, without turning this repo into an internal ops console.

### Deliverable
The app is stable enough to support real users and real commercial flows.

---

## Phase 8 — Nice-to-have after production baseline

Only after the above is working:

- billing summary improvements
- request history polish
- better email/account notifications
- subscription action controls
- CRM/admin support improvements
- design polish
- analytics refinement

Do not allow these to delay the core production path.

---

## Recommended execution order summary

1. Scope freeze and archive non-scope docs
2. Route/navigation/copy cleanup
3. Zoho adapter cleanup
4. Subscription production flow
5. Account pages
6. Preferences hardening
7. Request flows
8. Production hardening
9. Nice-to-haves

---

## Suggested first concrete tickets

### Ticket 1
README + docs scope patch

### Ticket 2
Archive future Temmy/portal docs

### Ticket 3
Route rename/refocus plan:
- narrow onboarding
- refocus dashboard into Account
- confirm active route families

### Ticket 4
Zoho adapter centralization

### Ticket 5
Subscription checkout/payment/CRM flow completion

### Ticket 6
Account pages:
- Orders
- Payments
- Subscriptions

### Ticket 7
Preferences flow hardening

### Ticket 8
Request flows

### Ticket 9
Production readiness checklist

### Ticket 10
Canonical API and persistence contract
- lock normalized payloads
- define route read/write responsibilities
- define correlation/reference fields
- align monitoring and preferences routes to the same contract model

---

## Final rule

If a task does not clearly improve:
- subscriptions,
- orders,
- payments,
- preferences,
- requests,
- or Zoho-backed commercial/account reliability,

it is probably not in the current implementation scope.
