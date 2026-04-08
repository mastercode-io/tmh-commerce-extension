# TMH Commerce Extension — Implementation Workstreams v1

## Status
Locked planning artifact for the current TMH commerce implementation phase.

## Purpose

Translate the repo refocus, canonical domain model, status model, payment strategy, and API/persistence contract into execution-ready workstreams and ticket groups for v1 delivery.

This document remains planning-only. It does not authorize scope expansion beyond the TMH Commerce Extension.

---

## 1. Working assumptions

These workstreams assume the following are already locked:

- the repo is a TMH-specific commerce/account extension
- the app boundary uses normalized commerce objects
- app-level statuses are normalized and provider-neutral
- v1 subscription hosted payment/setup uses the Xero payment gateway
- Zoho remains the commercial system of record

---

## 2. Workstream overview

## WS1 — Scope And Surface Cleanup

### Goal

Stop the repo from presenting itself as a portal/workspace app.

### Includes

- README scope note
- metadata/title/copy cleanup
- remove or hide portal-era nav items
- reframe active route groups around commerce/account language
- archive clearly non-scope docs and references

### Done when

- no active primary nav references `Portfolio`, `Watchlist`, `Workspace`, `Reports`, or `Alerts`
- repo docs visibly describe the TMH Commerce Extension role
- old portal artifacts are marked as archived/future reference

---

## WS2 — Zoho And Integration Boundary Cleanup

### Goal

Centralize all CRM-facing logic behind one coherent server-side boundary.

### Includes

- create or formalize Zoho service/adaptor layer
- normalize read/write shapes for:
  - customer lookup
  - order create/update
  - subscription sync
  - request create/update
  - preference sync
- move integration writes out of client components
- add correlation-id and reference propagation rules

### Done when

- no UI component writes directly to CRM/provider services
- routes call server-side services with normalized contracts
- every write path logs stable identifiers and correlation data

---

## WS3 — Monitoring Subscription Production Path

### Goal

Replace the current mock-backed monitoring subscription flow with a CRM-backed and payment-gateway-backed production path.

### Includes

- token resolution against real data
- server-authoritative quote calculation using real records
- checkout intent persistence
- hosted redirect via Xero payment gateway
- confirmation read from persisted snapshot
- normalized success, failure, and pending return states

### Done when

- `/subscribe/monitoring` works from real token context
- quote and checkout are not driven by mock data
- confirmation does not depend on mock serialized session state
- the route family conforms to the canonical API contract

---

## WS4 — Preferences Flow Hardening

### Goal

Keep and harden the existing CRM-backed preferences flow.

### Includes

- normalize response shape against canonical contract
- improve sync observability
- ensure idempotent save behavior
- improve error and retry behavior
- align naming/copy to preferences/compliance language

### Done when

- preferences flow is stable and production-safe
- errors are diagnosable with correlation IDs
- behavior matches the canonical preference model

---

## WS5 — Account Visibility Surfaces

### Goal

Build the real commerce/account area that replaces the current dashboard/portfolio concept.

### Includes

- account summary/home
- orders page
- payments page
- subscriptions page
- requests page
- optional billing/profile if data is available

### Done when

- authenticated users can see normalized `Order`, `Payment`, `Subscription`, and `Request` summaries
- account pages read from normalized commerce routes rather than old portal mock data

---

## WS6 — Request Flows

### Goal

Implement commercially scoped request capture flows for audit, renewal, application, and support.

### Includes

- request forms
- request API route
- CRM-backed request creation
- confirmation states
- request history visibility in account area

### Done when

- a customer can submit each request type
- each request produces a normalized `Request` record
- request history is visible in the account area

---

## WS7 — Production Hardening And Supportability

### Goal

Make the commerce flows supportable in preview and production.

### Includes

- environment separation
- callback/webhook verification where required
- idempotent processing
- fallback states
- structured logging
- lightweight admin/debug visibility

### Done when

- subscription, preferences, and request flows are observable and retry-safe
- failures can be correlated end-to-end

---

## 3. Ticket groups by workstream

## WS1 Tickets

1. README and docs scope patch
2. Root metadata/title/copy cleanup
3. Dashboard/header/nav de-portalization
4. Archive marker pass for portal-era docs

## WS2 Tickets

1. Create normalized Zoho service layer skeleton
2. Define mapper boundaries for customer/order/subscription/request/preferences
3. Introduce correlation-id utilities and logging conventions
4. Refactor existing preferences route onto normalized service interface

## WS3 Tickets

1. Replace mock token resolution with CRM-backed token resolution
2. Replace mock quote inputs with CRM-backed item resolution
3. Persist checkout intent and order snapshot
4. Integrate hosted redirect through Xero payment gateway
5. Replace mock confirmation session handling with persisted confirmation reads
6. Implement normalized return states: success, pending, failed, cancelled

## WS4 Tickets

1. Normalize preferences API response contract
2. Add correlation and debug visibility for preference sync
3. Harden opt-out and new-record handling
4. Align preferences UI copy and route naming

## WS5 Tickets

1. Build account summary route and normalized read endpoint
2. Build orders page and endpoint
3. Build payments page and endpoint
4. Build subscriptions page and endpoint
5. Build requests page and endpoint

## WS6 Tickets

1. Canonical request route and payload contract
2. Request form: audit
3. Request form: renewal
4. Request form: application
5. Request form: support
6. Request confirmation and account history wiring

## WS7 Tickets

1. Environment and config checklist
2. Hosted payment callback/webhook verification
3. Idempotency rules for checkout and confirmation
4. Structured logs and traceability
5. Lightweight admin/debug readouts

---

## 4. Recommended execution sequence

1. WS1 — Scope And Surface Cleanup
2. WS2 — Zoho And Integration Boundary Cleanup
3. WS3 — Monitoring Subscription Production Path
4. WS4 — Preferences Flow Hardening
5. WS5 — Account Visibility Surfaces
6. WS6 — Request Flows
7. WS7 — Production Hardening And Supportability

### Why this order

- WS1 prevents continued scope confusion during implementation.
- WS2 creates the server-side seams needed by every real commercial flow.
- WS3 unlocks the main monetization path first.
- WS4 leverages an already real CRM-backed flow with relatively low implementation risk.
- WS5 and WS6 depend on normalized commercial records and route contracts.
- WS7 should run throughout, but its higher-friction support tooling is easiest once the core flows are real.

---

## 5. Critical path

The critical production path is:

1. repo surface cleanup
2. Zoho/service normalization
3. monitoring subscription real token read
4. quote validation on real data
5. checkout intent persistence
6. hosted payment/setup redirect
7. confirmation reconciliation
8. account reflection of the resulting order/payment/subscription

If any of these remains mock-only, the commercial extension is not yet production-ready.

---

## 6. Parallelizable work

These streams can overlap once WS2 has created stable server-side boundaries:

- WS3 subscription production path
- WS4 preferences hardening
- WS5 account read surfaces
- WS6 request flow forms and routes

### Constraint

Parallel work must still use the canonical domain model, status model, and API contract. No stream should invent competing payloads or status enums.

---

## 7. Risks and guards

### Risk 1

Route cleanup turns into a large refactor of old portal code.

### Guard

Archive or replace aggressively where the old surface is the wrong product, instead of trying to preserve too much.

### Risk 2

Provider-specific details leak into app contracts during the gateway integration.

### Guard

Keep provider-specific names inside adapter internals only.

### Risk 3

Monitoring basket logic is forced into order-level statuses.

### Guard

Keep mixed outcomes on `OrderLine.disposition`.

### Risk 4

Account pages get blocked waiting for perfect historical data.

### Guard

Ship minimal normalized summaries first, then deepen the data later.

---

## 8. Exit criteria for planning

Planning is sufficient to start implementation once the following are all true:

- repo scope is locked
- repo audit is complete
- canonical domain model exists
- status and mapping spec exists
- payment strategy is locked
- API and persistence contract exists
- implementation workstreams and ticket groups are defined

This document is the final planning artifact needed before moving into structured implementation work.
