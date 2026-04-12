# TMH Commerce Extension — Production Scope v1

## Status
Working scope note for the current implementation phase.

## Purpose

Define the narrowed production scope for the current GitHub repository and prevent the app from drifting back into Temmy Portal / Braudit workspace concerns before the commercial extension is pushed into production.

This note reflects the current decision to treat the repository as a **TMH-specific commercial extension** to the TMH marketing website.

---

## 1. Scope definition

For the current phase, this repository is:

**A TMH-specific customer account and commerce application** connected to the TMH website and backed by Zoho CRM and payment integrations.

It exists to handle:
- order initiation,
- subscription signup,
- subscription management,
- payment/account visibility,
- customer profile and email preferences,
- commercial service requests.

It is **not** the Temmy operational workspace and **not** the Braudit operational platform.

---

## 2. Product role

### What this app is now
A commercial/account extension for TMH website users.

### What this app is not now
- not the Temmy operational workspace,
- not the Braudit service engine,
- not the multi-provider portal,
- not the final provider-agnostic account architecture,
- not the long-term reporting/monitoring portal.

### Internal naming recommendation
Use one of these labels in project docs:
- **TMH Commerce Extension**
- **TMH Account & Orders App**

Avoid calling it just “portal” without qualification.

---

## 3. Core business objectives

The current app should support these business goals:

1. Convert TMH website traffic into subscriptions and commercial requests
2. Give customers a simple self-service area for commercial/account visibility
3. Sync commercial/customer actions into Zoho reliably
4. Support near-term commercial flows without waiting for Temmy/Braudit automation
5. Stay narrow enough to ship quickly

---

## 4. In-scope modules for v1

## 4.1 Subscription flow
Primary production path.

### Must cover
- product/package selection
- checkout/payment integration
- success/failure/pending states
- CRM writeback to Zoho
- confirmation screens
- subscription status persistence
- subscription-related customer messaging

### Notes
This is the highest-priority production scope.

---

## 4.2 Customer account basics
Authenticated customer area focused on commercial visibility.

### Must cover
- past orders
- past payments
- current subscriptions
- basic billing summary
- profile details where needed

### Optional for v1 if backend allows
- cancel/pause/resume subscription
- payment method management
- invoice/receipt download

---

## 4.3 Email preferences / profiling flow
Already useful as a lead-gen and compliance-related funnel.

### Must cover
- preference read
- preference update
- reliable Zoho sync
- idempotent writes
- confirmation UX
- error/retry-safe behavior

### Notes
This should be hardened rather than redesigned.

---

## 4.4 Service request flows
Commercial request capture for near-term services.

### Initial request types
- request audit
- request renewal
- request new trademark application
- request callback / support

### Notes
These may initially be CRM-backed request/order stubs rather than fully automated operational flows.

That is acceptable for v1.

---

## 4.5 TMH-specific Zoho integration
Treat Zoho as the commercial system of record for this repository in the current phase.

### Must cover
- contact lookup / create
- account linkage where needed
- deal/order/request creation
- subscription state sync
- payment logging / correlation
- preferences/profile sync

### Important rule
Zoho coupling is acceptable **inside this repo for the current phase**, but should be isolated in a clear adapter/service layer rather than spread across UI code.

---

## 4.6 Production hardening
### Must cover
- environment separation
- webhook verification
- error handling
- retries where appropriate
- audit logging / correlation ids where useful
- safe fallback states
- admin/debug visibility for troubleshooting

---

## 5. Explicitly out of scope for this phase

These should be treated as future Temmy/Braudit workstream concerns, not current repository scope:

- Brand Portfolio workspace
- monitoring results UI
- reports UI as operational workspace
- alerts UI
- Braudit-side execution dashboards
- analyst review tools
- provider-agnostic multi-tenant model
- white-label support
- generic provider adapter model beyond TMH needs
- deep role/permission model for portal operations
- iframe/embed architecture for a future workspace
- final Temmy Account vs Temmy Workspace split as production architecture

### Important note
Existing mock-data portal/proof-of-concept work should be retained only as **reference material for future Temmy Portal work**, not as current implementation scope.

---

## 6. Architectural boundaries for this repo

## 6.1 Frontend areas to keep
The current app should focus on three bounded user-facing areas:

### A. Marketing-linked entry flows
- subscription entry
- email preferences
- commercial landing continuations
- promotional or profiling funnels

### B. Account
- orders
- payments
- subscriptions
- billing summary
- profile/preferences

### C. Services
- audit
- renewal
- application
- support/callback

---

## 6.2 Backend posture
For this repo, prioritize a clean TMH commercial integration architecture:

- UI layer
- server actions / API routes
- TMH commercial services
- Zoho adapter
- payment adapter(s)

### Rule
Do not let future Temmy/Braudit operational objects drive the current data model or route structure.

---

## 7. Recommended data focus for this phase

Prioritize these data concepts:

- customer identity
- order/request identity
- payment state
- subscription state
- billing summary
- request status
- email/profile preference state
- CRM correlation identifiers

Do **not** make these the center of the current app:
- Brand Portfolio
- Result
- Report
- Alert
- Service Engagement
- Execution Run

They may be referenced later, but not as the production scope driver for this phase.

---

## 8. Repo documentation rule

A short top-level note should be added to the repo docs stating:

> This repository is the TMH website commercial extension for customer account, orders, subscriptions, payments, preferences, and CRM-connected commercial flows. It is not the Temmy operational workspace and not the Braudit operational platform. Existing portal/workspace mockups are retained only as reference material for future Temmy work.

---

## 9. Priority sequence

### Priority 1
Subscription flow → payment state → Zoho integration → confirmation/account visibility

### Priority 2
Orders / Payments / Subscriptions account pages

### Priority 3
Email preferences hardening

### Priority 4
Service request flows for renewal/application/audit

### Priority 5
General production hardening and admin/debug support

---

## 10. Working implementation principles

1. Ship the commercial extension first
2. Keep the current app TMH-specific for now
3. Isolate Zoho integration behind a clear adapter/service layer
4. Avoid reintroducing portal/workspace scope into this repo
5. Preserve proof-of-concept portal materials only as future reference
6. Do not let future multi-provider architecture block current TMH production delivery

---

## 11. Locked scope statement

> For the current phase, this repository will be developed only as the TMH website commercial extension: a TMH-specific customer account and commerce application covering subscriptions, orders, payments, profile/preferences, and service request flows, backed by Zoho CRM and related payment integrations. Operational portal concerns such as Brand Portfolios, Results, Reports, Alerts, and Braudit-side workflows are explicitly out of scope for this phase and will be addressed later in the Temmy/Braudit workstream.
