# Parity Checklist

This document is the acceptance checklist for rebuilding the flows in `tmh-commerce-extension`.

Use it as the definition of done for migration work.

## 1. Renewal Entry Flow

The rebuilt renewal landing flow should preserve all of these behaviors:

- missing token blocks the flow immediately
- invalid token shows a blocked or support state
- valid token hydrates account, contact, and trademark data
- primary trademark is shown without requiring manual entry
- additional renewals, when present, are shown as selectable options
- primary trademark remains selected by default
- multi-renewal selection can add or remove additional trademarks
- contact fields prefill from source data when available
- required contact fields still block submit when empty
- screening questions are required before self-serve submit
- if either screening answer indicates risk, self-serve order creation is blocked
- assisted / contact-us path remains available for non-self-serve cases
- consent/authority checkbox is required
- submission payload includes all selected trademark identifiers

## 2. Renewal Order / Payment Flow

The rebuilt order flow should preserve all of these behaviors:

- order page loads using a stable order identifier, not URL-embedded JSON
- order/trademark summary matches what was selected on the landing flow
- totals are rendered from server response, not recomputed ad hoc in the client
- terms acceptance blocks payment creation until checked
- payment-link creation is idempotent or safely retryable
- payment polling continues until terminal state or timeout
- payment `pending` keeps the waiting UI active
- payment `succeeded` unlocks confirmation
- payment `failed` shows retry / recovery options
- payment `cancelled` or expired-link equivalent shows recovery options
- manual status recheck remains possible

## 3. Renewal Confirmation Flow

The rebuilt confirmation flow should preserve all of these behaviors:

- direct confirmation access without successful payment is blocked
- successful payment shows a stable reference or order id
- confirmation page shows enough submitted context to reassure the user
- confirmation route is refresh-safe
- support/contact next steps are available

## 4. Audit Wizard Flow

The rebuilt audit flow should preserve all of these behaviors:

- wizard progress is structured by section, not one flat uncontrolled form
- early contact capture can be saved before the whole wizard completes
- step validation blocks forward movement when section requirements are missing
- Temmy search remains part of the flow
- users can select or confirm trademark lookup results where applicable
- goods/services and website/business context are still captured
- billing details remain a dedicated section
- appointment / scheduling choice remains represented if still in scope
- payment options remain a dedicated late-stage section
- partial progress can be resumed safely

## 5. Audit Summary / Payment Flow

The rebuilt audit summary and payment flow should preserve all of these behaviors:

- summary page loads complete saved section state from the server
- pricing comes from the server and is treated as authoritative
- checkout creation happens from the saved order context
- payment success moves to confirmation
- payment failure/cancel states are visible and recoverable

## 6. Generic Order / Account Surface Parity

The target app should preserve these higher-level outcomes:

- renewal and audit produce normalized `RequestSummary` records
- payable flows also produce normalized `OrderSummary` records
- payment states map into normalized `PaymentSummary` statuses
- account/history views can list these records without needing page-specific payload shapes

## 7. Data Contract Parity

The target app implementation should satisfy these contract rules:

- React components use camelCase contracts only
- server adapters translate to upstream snake_case where needed
- multi-renewal uses an explicit selected array
- renewal and audit keep dedicated API families
- generic `POST /api/requests` is not overloaded to carry wizard-specific detail payloads
- payment and pricing truth stay server-side

## 8. Edge Cases To Verify

These edge cases should be explicitly tested before migration is considered complete:

- renewal token missing
- renewal token invalid
- renewal token valid but missing optional prefill fields
- renewal with zero additional renewals
- renewal with multiple additional renewals
- renewal screening blocks self-serve
- renewal payment status never leaves pending and times out
- renewal payment status returns upstream unknown/not-found result
- audit wizard resumed with partially saved sections
- audit Temmy lookup returns zero matches
- audit payment starts from a previously saved order

## 9. Recommended Test Evidence

For each migrated flow, keep at least one of these:

- fixture-backed API handler tests
- UI integration tests for critical happy paths
- manual verification notes for payment-state edge cases
- screenshots of landing, order/summary, and confirmation routes

## 10. Exit Rule

The migration is not done when the new pages look right.

The migration is done when:

- the target app preserves source business behavior
- the target app uses stable target-side contracts
- the target app supports real multi-renewal
- the target app can survive upstream status quirks and incomplete source behavior
