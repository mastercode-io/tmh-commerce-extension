# Source Flow Coverage

This document makes the source-of-truth boundaries explicit so the migration does not accidentally mix unrelated branches.

## Primary source selection

## Renewal flow

Primary source:
- `multi-deal-order`

Why:
- it contains the renewal behavior you explicitly want to preserve
- it includes the batch / multi-renewal selection UI
- it preserves the original tokenized renewal journey under `public/renewal/uktm`

Main files:
- `multi-deal-order:public/renewal/uktm/index.html`
- `multi-deal-order:public/renewal/uktm/assets/js/main.js`
- `multi-deal-order:public/renewal/uktm/order.html`
- `multi-deal-order:public/renewal/uktm/assets/js/order.js`
- `multi-deal-order:public/renewal/uktm/assets/js/confirmation.js`
- `multi-deal-order:api/renewal/*`

## Audit flow

Primary source:
- `dev`

Why:
- `multi-deal-order` does not contain the audit flow
- `dev` contains the full audit wizard, summary, confirmation, and API routes

Main files:
- `dev:public/audit/index.html`
- `dev:public/audit/assets/js/wizard.js`
- `dev:public/audit/assets/js/validation.js`
- `dev:public/audit/assets/js/state-manager.js`
- `dev:public/audit/assets/js/summary.js`
- `dev:public/audit/assets/js/confirmation.js`
- `dev:api/audit/*`
- `dev:api/_services/audit.js`

## Generic / newer order-payment surface

Primary source:
- `dev`

Why:
- `dev` contains the generalized order/payment routes under `public/order.html` and `/api/orders/*`
- this appears to be the “newer app” direction branched from the audit-related work, but it is not a complete standalone flow

Main files:
- `dev:public/order.html`
- `dev:public/assets/js/order.js`
- `dev:public/confirmation.html`
- `dev:public/assets/js/confirmation.js`
- `dev:api/orders/*`

Important limitation:
- this source is strongest for generic order/payment handling
- it does not represent a complete standalone request-entry flow comparable to renewal or audit

## Practical migration stance

Use:
- `multi-deal-order` for renewal behavior
- `dev` for audit behavior
- `dev` generic order/payment only as a pattern/reference for the newer commerce-oriented direction

Do not do:
- merge these branches mentally into one canonical implementation
- treat every newer `dev` file move or route rename as behaviorally important
- assume generic order flow replaces renewal or audit-specific business rules

## Behavior confidence by flow

High confidence:
- renewal token gating
- renewal payment polling lifecycle
- audit wizard step flow and validation
- audit server-side section save pattern

Medium confidence:
- generic order/payment surface in `dev`
- audit payment/checkout handoff assumptions

Lower confidence / explicit gap:
- `multi-deal-order` multi-renewal backend contract
- “newer app” source as a finished independent flow
