# Gap Register

This document lists the source-side gaps, ambiguities, and migration decisions that must remain visible during the rebuild.

It is not a blocker list in the abstract. It is the set of places where the source implementation is incomplete, brittle, or intentionally not worth preserving literally.

## 1. Renewal Multi-Renewal Contract Gap

Source state:
- `multi-deal-order` renders multi-renewal selection UI
- selected trademark cards update in the browser
- submit payload still sends only one `trademark_number`

Evidence:
- `public/renewal/uktm/assets/js/main.js`

Risk:
- copying source submit logic will silently drop multi-renewal behavior

Decision for rebuild:
- target app must submit an explicit selected-renewals array
- source single-field submit payload must not be preserved

Priority:
- critical

## 2. Renewal URL-Embedded Order Payload Gap

Source state:
- landing flow encodes order payload to base64
- order page can read full order JSON from `?order=...`
- order state is also saved to `sessionStorage`

Evidence:
- `public/renewal/uktm/assets/js/main.js`
- `public/renewal/uktm/assets/js/order.js`

Risk:
- fragile refresh/deep-link behavior
- oversized URLs
- weak trust boundary for pricing/order data

Decision for rebuild:
- redirect by stable `orderId` only
- fetch order details from the server on the destination route

Priority:
- critical

## 3. Renewal Confirmation Guard Gap

Source state:
- confirmation access depends on `sessionStorage` token written after payment flow

Evidence:
- `public/renewal/uktm/assets/js/order.js`
- `public/renewal/uktm/assets/js/confirmation.js`

Risk:
- direct-link and cross-device behavior is weak
- refresh/session edge cases can create false blocks or false positives

Decision for rebuild:
- prefer server-verified confirmation access
- temporary client-side fallback is acceptable only as a short bridge

Priority:
- high

## 4. Renewal Payment Status Semantics Gap

Source state:
- source payment flow uses statuses:
  - `paid`
  - `pending`
  - `voided`
  - `not_found`
  - `failed`
  - client timeout

Risk:
- `not_found` is semantically ambiguous
- target app already uses cleaner normalized payment states

Decision for rebuild:
- normalize source/upstream statuses in adapter layer
- document a final business mapping for `not_found`

Priority:
- high

## 5. Renewal Validation Distribution Gap

Source state:
- some validation is UI-driven and visibility-dependent
- email regex is simple
- phone validation is presence-only

Risk:
- behavior may shift during component rewrite unless rules are explicitly preserved

Decision for rebuild:
- preserve required-field semantics
- move authoritative validation server-side
- allow client validation to remain lightweight and UX-focused

Priority:
- medium

## 6. Audit Source Branch Gap

Source state:
- audit flow is not present on `multi-deal-order`
- audit source of truth is `dev`

Risk:
- a rebuild started from the current working tree alone will miss audit behavior

Decision for rebuild:
- audit migration must reference `dev` flow docs and examples explicitly
- do not assume renewal branch contains audit state

Priority:
- high

## 7. Audit Pricing Ownership Gap

Source state:
- audit summary includes client-side price math assumptions

Risk:
- rebuilding this literally would keep pricing logic in the wrong layer

Decision for rebuild:
- pricing must be server-authoritative in the target app
- client should only display server totals

Priority:
- high

## 8. Audit Wizard Persistence Gap

Source state:
- wizard persistence is split between local state progression and API section saves

Risk:
- rebuild may accidentally oversimplify into a one-shot request form

Decision for rebuild:
- preserve section-based persistence
- let server state become the canonical resume source

Priority:
- high

## 9. Generic Order Flow Scope Gap

Source state:
- newer generic order/payment surface exists on `dev`
- it is stronger as a payment-state pattern than as a complete request-entry flow

Risk:
- treating generic order flow as the canonical migration source would flatten renewal/audit-specific rules

Decision for rebuild:
- use generic order flow as infrastructure reference only
- do not let it replace renewal or audit flow semantics

Priority:
- medium

## 10. Target API Contract Decision

Current target state:
- `tmh-commerce-extension` already has generic `POST /api/requests`

Risk:
- overloading that route for wizard-specific detail payloads will blur boundaries and make adapters harder to maintain

Decision for rebuild:
- keep generic request creation for normalized history/account surfaces
- add dedicated route families for renewal and audit

Priority:
- critical

## 11. Data Naming Boundary Decision

Source state:
- source CRM-facing contracts are mostly snake_case

Risk:
- leaking CRM field names into React components will make the target app harder to maintain

Decision for rebuild:
- target UI contracts must remain camelCase
- server adapters own translation to snake_case/upstream wrappers

Priority:
- high

## 12. Final Pre-Rebuild Checklist

Before implementation starts, these decisions should be treated as locked:

- renewal uses explicit multi-renewal selection payloads
- renewal order page loads by stable identifier only
- renewal confirmation should be server-checked when possible
- audit remains a dedicated wizard with section persistence
- audit pricing is server-authoritative
- generic request create route is not the only integration surface
- target app UI contracts remain camelCase

If these are accepted, the documentation pack is sufficient to begin the actual rebuild.
