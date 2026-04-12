# Migration Implementation Plan And Tracker

This document turns the `docs/migration` pack into an execution plan for rebuilding the renewal and audit flows in `tmh-commerce-extension`.

It is a planning and tracking artifact only. It does not change the implementation guidance already captured in:
- `README.md`
- `gap-register.md`
- `parity-checklist.md`
- `target-implementation-blueprint.md`
- `renewal-target-schemas.md`
- `audit-target-schemas.md`
- `target-typescript-contracts.md`
- `user-facing-route-map.md`
- `phase-1-shared-infrastructure-spec.md`
- `fixture-inventory-plan.md`
- `target-repo-kickoff-checklist.md`

## 1. Planning Verdict

The migration pack is sufficient to begin implementation planning and phased build work.

It is not sufficient to treat every feature as fully specified without any product or backend decisions. The pack is strong enough to start if the team accepts the documented target direction and locks the explicit decision gates below before the affected phase begins.

Route naming is now also locked via `user-facing-route-map.md`.

Current state:
- decision gates are locked
- the user-facing route family is accepted
- fixture scope defaults to the minimum set in `source-fixtures-and-examples.md`
- implementation can start with Phase 1

Phase 1 kickoff docs:
- shared infrastructure spec: `phase-1-shared-infrastructure-spec.md`
- fixture inventory: `fixture-inventory-plan.md`
- target repo skeleton/checklist: `target-repo-kickoff-checklist.md`

## 2. Decision Gates To Lock Before Build

These are the minimum open items that should be treated as implementation gates, not informal notes:

| Gate ID | Decision | Why It Matters | Suggested Lock Point | Status |
| --- | --- | --- | --- | --- |
| D1 | Final renewal multi-renewal upstream contract: native CRM support vs app-side adapter | Source UI is multi-select but source submit payload is still single-trademark | Before renewal API implementation | Locked: explicit selected array in target app, with app-side adapter if CRM lags |
| D2 | Mapping for renewal payment status `not_found`: `cancelled` vs `failed` | Affects payment polling terminal state and recovery UX | Before renewal payment polling implementation | Locked: `not_found` maps to `cancelled` |
| D3 | Renewal confirmation enforcement: server-verified route now vs temporary client/session fallback | Affects confirmation route security and refresh/deep-link behavior | Before renewal confirmation implementation | Locked: server-verified target, client/session fallback only as temporary bridge |
| D4 | Audit scope confirmation for appointment/scheduling section | The docs preserve appointment behavior, but it may or may not still be in product scope | Before audit wizard implementation | Locked: keep appointment in scope as an assisted-path escape route during the journey |
| D5 | Audit pricing authority and pricing inputs, especially `socialMediaAddon` | Audit summary must be server-authoritative; pricing rules need a final owner | Before audit payment implementation | Locked: pricing is server-authoritative; remove `socialMediaAddon` from current target scope and add later if business rules are defined |
| D6 | Target account/history exposure timing for new request/order records | Impacts whether history integration is in first release or follow-on work | Before account/history integration | Locked: move account/history exposure to a follow-on phase after core flows work end-to-end |

## 3. Execution Principles

- Preserve business behavior, not source HTML structure.
- Keep React/UI contracts camelCase only.
- Keep renewal and audit on dedicated route and API families.
- Keep server adapters authoritative for pricing, payment status normalization, and upstream field translation.
- Treat fixtures and parity evidence as required deliverables, not cleanup work.

## 4. Phase Plan

## Phase 0: Lock Contracts And Decisions

Goal:
- prevent implementation from drifting on contract shape, payment semantics, and wizard scope

Deliverables:
- accepted renewal target schema
- accepted audit target schema
- locked decisions D1-D6
- accepted customer-facing route map
- explicit fixture list for parity testing

Exit criteria:
- no open question remains on renewal selection payload
- no open question remains on payment terminal state mapping
- audit section list is confirmed
- pricing ownership is confirmed server-side
- user-facing route family is accepted

## Phase 1: Shared Infrastructure And Contracts

Goal:
- define the common primitives both flows will depend on

Deliverables:
- shared request/order/payment status primitives
- adapter mapping helpers
- normalized error handling approach
- payment polling helper contract
- fixture scaffolding

Exit criteria:
- both renewal and audit can import stable target-side contracts
- shared status mapping is defined in one place
- fixture naming and storage layout are agreed

## Phase 2: Renewal Server/API Layer

Goal:
- implement the renewal backend boundary before building the new UI

Deliverables:
- renewal token details read
- renewal create-order route with explicit selected renewal array
- renewal order read by stable `orderId`
- renewal payment-link endpoint
- renewal payment-status endpoint
- optional confirmation read endpoint

Exit criteria:
- no renewal page depends on URL-embedded order JSON
- backend returns canonical payment statuses
- renewal order details are server-authoritative

## Phase 3: Renewal UI Flow

Goal:
- restore full renewal behavior in the target app

Deliverables:
- token-gated renewal landing route
- screening logic and assisted-path behavior
- multi-renewal selection UI
- contact prefill and validation
- order page with terms gate
- payment polling states and recovery actions
- confirmation route

Exit criteria:
- renewal parity checklist sections 1 to 3 are satisfied
- multi-renewal selections are actually serialized and returned in order details

## Phase 4: Audit Server/API Layer

Goal:
- rebuild the audit flow contract as a section-based wizard backend

Deliverables:
- audit lead upsert route
- section save route
- audit order read route
- audit payment creation route
- audit confirmation read route
- Temmy search route normalization

Exit criteria:
- audit can resume from server-side saved state
- pricing is returned from the server
- section updates are independent and stable

## Phase 5: Audit UI Flow

Goal:
- rebuild the audit wizard and downstream summary/confirmation behavior

Deliverables:
- wizard route with section-based local state
- step gating and validation
- Temmy search and selection flow
- billing and appointment sections
- summary page loading by `orderId`
- payment handoff
- confirmation page

Exit criteria:
- audit parity checklist sections 4 and 5 are satisfied
- audit no longer depends on a one-shot generic request create flow

## Phase 6: Account And History Integration

Goal:
- expose renewal and audit outcomes through normalized target app surfaces

Deliverables:
- normalized `RequestSummary` creation for both flows
- normalized `OrderSummary` creation for payable flows
- normalized `PaymentSummary` mapping
- account/history visibility plan or implementation

Exit criteria:
- renewal and audit can appear in normalized lists without leaking flow-specific payloads

## Phase 7: Parity Verification And Handoff

Goal:
- close the migration with evidence, not screenshots alone

Deliverables:
- fixture-backed handler tests
- critical UI integration tests
- manual verification notes for payment edge cases
- unresolved-risk list for anything intentionally deferred

Exit criteria:
- parity checklist is marked complete
- remaining deltas are explicitly accepted, not accidental

## 5. Detailed Work Tracker

Status legend:
- `Not started`
- `In progress`
- `Blocked`
- `Ready`
- `Done`

### 5.1 Decisions

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | Renewal | Lock explicit multi-renewal create-order contract | None | Accepted payload schema | Done | Explicit selected array required in target app; use app-side adapter if CRM support lags |
| D2 | Renewal | Lock `not_found` payment mapping | None | Accepted status mapping table | Done | `not_found` means cancelled/deleted and must map to `cancelled` consistently |
| D3 | Renewal | Lock confirmation enforcement model | None | Accepted route rule | Done | Server-verified confirmation is the target; client/session guard allowed only as temporary fallback |
| D4 | Audit | Confirm appointment section remains in scope | None | Accepted scope note | Done | Keep appointment/scheduling as an assisted-path escape route for customers needing help during the journey |
| D5 | Audit | Lock pricing inputs and server authority | None | Accepted pricing rule | Done | Pricing is server-side only; remove `socialMediaAddon` from current target contract until business rules are ready |
| D6 | Shared | Decide release scope for account/history integration | None | Release scope note | Done | Account/history visibility is a follow-on phase after core flow delivery |

### 5.2 Shared Foundation

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| S1 | Shared | Create shared status/type primitives | D1-D5 | Type definitions merged | Done | Added shared commerce primitives and flow-specific type modules |
| S2 | Shared | Define adapter error normalization | D1-D5 | Error contract doc or tests | Done | Added `parseZohoError` with retryability and correlation handling |
| S3 | Shared | Define payment polling helper contract | D2 | Polling state contract | Done | Added polling helper and status normalization with locked renewal mapping |
| S4 | Shared | Create fixture inventory and naming layout | D1-D5 | Fixture checklist | Done | Seeded renewal and audit fixture directories plus kickoff docs |

### 5.3 Renewal Backend

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Renewal API | Implement token details contract | S1-S4 | Handler test for valid/missing/invalid token | Done | Added `GET /api/renewals/details` with token-gated mock-backed details resolution |
| R2 | Renewal API | Implement create-order with explicit selected array | D1, S1-S4 | Handler test for single and multi selection | Done | Added server-authoritative create-order flow with explicit selected trademark array and assisted-path blocking |
| R3 | Renewal API | Implement order read by stable `orderId` | R2 | Handler test | Done | Added stable order read with in-memory mock persistence for the renewal slice |
| R4 | Renewal API | Implement payment-link endpoint | R3 | Handler test with terms accepted/rejected | Done | Added retry-safe payment-link creation with terms gate and local hosted-payment simulator handoff |
| R5 | Renewal API | Implement payment-status endpoint | D2, R4 | Mapping tests across terminal statuses | Done | Added canonical payment polling states with `not_found`/voided behavior collapsing to `cancelled` |
| R6 | Renewal API | Implement optional confirmation read route | D3, R5 | Handler test | Done | Added confirmation read route returning server-authoritative payment outcome |

### 5.4 Renewal Frontend

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| R7 | Renewal UI | Build landing route and token guard | R1 | UI test or manual notes | Done | Added `/renewal` entry route with token guard and mock demo token helpers |
| R8 | Renewal UI | Build screening logic and assisted path | R1 | UI test | Done | Added self-serve screening and specialist booking fallback state |
| R9 | Renewal UI | Build multi-renewal selection UX | R2, R7 | UI test for add/remove/select all | Done | Added primary-locked selection plus additional renewal toggles |
| R10 | Renewal UI | Build contact prefill and validation | R1, R7 | UI test | Done | Contact form prefills from token details and submits through the create-order contract |
| R11 | Renewal UI | Build order page from server order details | R3 | UI test | Done | Added `/orders/[orderId]` page backed only by server order details |
| R12 | Renewal UI | Build payment flow and polling states | R4-R5, R11 | UI/integration tests | Done | Added terms gate, hosted-payment handoff, mock payment page, and polling with success/failure recovery |
| R13 | Renewal UI | Build confirmation route | D3, R6 or fallback | UI test | Done | Added `/orders/[orderId]/confirmation` route that reads confirmation from the API |

### 5.5 Audit Backend

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| A1 | Audit API | Implement lead upsert route | D4-D5, S1-S4 | Handler tests | Not started | Token continuation preserved |
| A2 | Audit API | Implement section save route | A1 | Handler tests by section | Not started | Server-side section persistence |
| A3 | Audit API | Implement order read route | A2 | Handler test | Not started | Must return server-authoritative pricing |
| A4 | Audit API | Implement payment creation route | D5, A3 | Handler test | Not started | Hosted checkout handoff |
| A5 | Audit API | Implement confirmation read route | A4 | Handler test | Not started | Final summary state |
| A6 | Audit API | Implement Temmy search normalization | A2 | Handler test for zero/single/multi results | Not started | Preserve search/selection behavior |

### 5.6 Audit Frontend

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| A7 | Audit UI | Build wizard shell with section state | A1-A2 | UI notes or tests | Not started | State structured by section |
| A8 | Audit UI | Build contact and preferences steps | A7 | UI tests | Not started | At least one contact method required |
| A9 | Audit UI | Build trademark status and Temmy lookup steps | A6-A7 | UI tests | Not started | Explicit result selection when needed |
| A10 | Audit UI | Build goods/services and billing steps | A7 | UI tests | Not started | Preserve website and billing validation |
| A11 | Audit UI | Build appointment step if still in scope | D4, A7 | UI notes or tests | Not started | Remove if D4 says out of scope |
| A12 | Audit UI | Build summary page from server order read | A3 | UI test | Not started | Server totals only |
| A13 | Audit UI | Build payment and confirmation routes | A4-A5, A12 | UI/integration tests | Not started | Recoverable failure states |

### 5.7 Account/History And Verification

| ID | Area | Task | Dependency | Evidence Required | Status | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| I1 | Integration | Map renewal records into normalized summaries | R2-R6, D6 | Integration notes/tests | Not started | `RequestSummary`, `OrderSummary`, `PaymentSummary` |
| I2 | Integration | Map audit records into normalized summaries | A2-A5, D6 | Integration notes/tests | Not started | Keep wizard payloads out of summaries |
| V1 | Verification | Build fixture-backed renewal API tests | R1-R6, S4 | Passing tests | In progress | Added renewal service and validator tests; route-handler harness is still limited by the repo's plain Node test runner |
| V2 | Verification | Build fixture-backed audit API tests | A1-A6, S4 | Passing tests | Not started | Include resume and Temmy cases |
| V3 | Verification | Capture manual parity evidence | R7-R13, A7-A13 | Notes/screenshots | Not started | Especially payment edge states |
| V4 | Verification | Walk parity checklist to completion | V1-V3 | Signed-off checklist | Not started | Final migration exit gate |

## 6. Progress Log

Update this table as execution proceeds.

| Date | Item ID | Change | Owner | Evidence / Link | Next Step |
| --- | --- | --- | --- | --- | --- |
| 2026-04-12 | PLAN | Initial planning tracker created from `docs/migration` pack review | Unassigned | `docs/migration/implementation-plan-tracker.md` | Lock D1-D6 |
| 2026-04-12 | D1 | Renewal multi-renewal contract locked: target app must send explicit selected trademark array; app-side adapter is acceptable until CRM fully supports it | User decision | `docs/migration/implementation-plan-tracker.md` | Resolve D2 |
| 2026-04-12 | D2 | Renewal payment status mapping locked: `not_found` means cancelled/deleted and maps to `cancelled` | User decision | `docs/migration/implementation-plan-tracker.md` | Resolve D3 |
| 2026-04-12 | D3 | Renewal confirmation enforcement locked: server-verified confirmation is the target, with client/session fallback allowed only as a temporary bridge | User decision | `docs/migration/implementation-plan-tracker.md` | Resolve D4 |
| 2026-04-12 | D4 | Audit appointment/scheduling scope locked: keep it in scope as an escape route for customers who may need help at any point in the journey | User decision | `docs/migration/implementation-plan-tracker.md` | Resolve D5 |
| 2026-04-12 | D5 | Audit pricing authority locked: pricing is server-authoritative and `socialMediaAddon` is removed from current target scope until business rules and prerequisites are ready | User decision | `docs/migration/implementation-plan-tracker.md` | Resolve D6 |
| 2026-04-12 | D6 | Account/history integration scope locked: move renewal/audit visibility into a follow-on phase after the core flows work end-to-end | User decision | `docs/migration/implementation-plan-tracker.md` | Lock user-facing route map |
| 2026-04-12 | ROUTES | Customer-facing route family locked: `/renewal`, `/audit`, `/application`, `/support`, shared `/orders/[orderId]`, and `/account/services` instead of request-centric naming | User decision | `docs/migration/user-facing-route-map.md` | Start Phase 1 |
| 2026-04-12 | READY | Planning package is implementation-ready: decisions, route map, and default fixture scope are all defined | Unassigned | `docs/migration/implementation-plan-tracker.md` | Start S1-S4 |
| 2026-04-12 | PHASE1-DOCS | Added Phase 1 implementation docs covering shared infrastructure, fixture inventory, and target repo kickoff skeleton | Unassigned | `docs/migration/phase-1-shared-infrastructure-spec.md` | Make target repo available and start S1-S4 |
| 2026-04-12 | S1-S4 | Implemented shared commerce helpers, flow-specific type modules, seeded fixtures, and added verification tests in the target repo | Unassigned | `lib/commerce/status.ts`, `lib/commerce/errors.ts`, `lib/commerce/payment-polling.ts`, `tests/commerce-status.test.ts` | Start renewal backend work R1-R6 |
| 2026-04-12 | R1-R6 | Implemented renewal backend routes, mock-backed order persistence, payment polling states, and confirmation reads | Unassigned | `app/api/renewals/details/route.ts`, `app/api/renewals/orders/[orderId]/payment-status/route.ts`, `lib/renewals/service.ts` | Wire public renewal pages |
| 2026-04-12 | R7-R13 | Implemented the first public renewal journey on `/renewal`, `/orders/[orderId]`, and `/orders/[orderId]/confirmation` with mock hosted-payment handoff | Unassigned | `app/(subscribe)/renewal/page.tsx`, `components/renewal/renewal-flow.tsx`, `components/renewal/renewal-order-screen.tsx` | Add manual/browser verification and then move to audit backend |

## 7. Recommended First Slice

The best first implementation slice is renewal only:

- lock D1-D3
- complete S1-S4
- complete R1-R6
- complete R7-R13
- complete V1 and the renewal parts of V3/V4

Reason:
- renewal is the primary migration target in the pack
- it has the clearest end-to-end contract
- it proves the target architecture without dragging in the larger audit wizard immediately

## 8. Readiness Rule

Implementation should start when:
- D1-D5 are explicitly locked
- the user-facing route family is accepted
- fixture scope is agreed

Default fixture scope for implementation start:
- the minimum set listed in `source-fixtures-and-examples.md`

Implementation should pause if:
- multi-renewal support is not actually wanted in the target app
- audit pricing is still expected to live in the browser
- the team wants to force both flows into generic `POST /api/requests`

Those positions conflict with the migration pack and should be resolved before build work begins.
