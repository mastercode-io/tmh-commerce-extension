# Rebuild Plan For Another App

This plan assumes the target application has a different UI, route structure, and component model, but should preserve the `multi-deal-order` renewal behavior and use the same or slightly modified custom API integration.

## Core Principle

Do not migrate the current frontend files wholesale.

Instead:
- rebuild the journey natively in the target app
- preserve the business flow and API behavior
- port only the reusable logic patterns

## What To Rebuild Natively

- page layout
- components
- route structure
- styling/theme
- form rendering
- loading, error, and success UI shells

## What To Preserve Semantically

- token-gated renewal entry
- renewal details hydration contract
- screening logic that routes users away from self-serve when answers indicate risk
- prefilled contact and trademark summary behavior
- multi-renewal selection concept from `multi-deal-order`
- order summary rendering
- terms-before-payment gate
- payment-link creation
- payment polling lifecycle and terminal states
- confirmation access guard

## Recommended Architecture In The New App

## 1. Introduce a dedicated renewal domain module

Suggested boundaries:
- `renewals/api`
- `renewals/lib`
- `renewals/components`
- `renewals/routes` or equivalent

Keep these responsibilities separate:
- CRM adapters
- response normalizers
- validators
- screen orchestration/state machine
- UI components

## 2. Replace branch URL payload transport

Current branch behavior:
- redirects to order page with base64-encoded order object in query string

Recommended replacement:
- on successful submission, redirect with only a stable order or deal identifier
- fetch order details server-side or via protected app API

Why:
- less fragile
- smaller URLs
- better trust boundary
- easier recovery on refresh or deep link

## 3. Formalize multi-renewal selection contract

Current branch state:
- UI supports selecting multiple additional renewals
- backend submit payload does not yet carry those selections explicitly

Recommended target contract:
- primary trademark identifier
- selected trademark identifier array
- optional metadata for display-only names/numbers if useful

Example:

```json
{
  "token": "tok_123",
  "source": "renewal-landing",
  "type": "lead",
  "data": {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000",
    "primary_trademark_number": "UK0000123456",
    "selected_trademark_numbers": [
      "UK0000123456",
      "UK0000654321"
    ]
  }
}
```

If the upstream CRM function cannot accept this yet:
- add an app-side adapter
- or implement the multi-selection logic in a revised CRM function

## 4. Move validation into reusable modules

Extract into dedicated target-app modules:
- entry guards
- screening decision rules
- form validation
- payment state normalization

Do not leave this embedded in UI components if the target app is component-based.

## 5. Keep payment lifecycle as a state machine

The current branch already behaves like a state machine even though it is coded imperatively.

States to preserve:
- idle
- loading payment link
- waiting for payment
- paid
- failed
- voided
- not found
- timeout

Actions to preserve:
- reopen payment page
- manually recheck payment
- return to offer
- contact support

Rebuilding this as an explicit state machine or reducer would be a good improvement.

## 6. Decide where confirmation access is enforced

Current branch:
- client-side check using URL token + `sessionStorage`

Recommended target options:
- best: server-verified confirmation route tied to payment result
- acceptable fallback: current client-side token/session guard

If server verification is not available immediately:
- keep the client guard first
- add server verification later

## Implementation Sequence

## Phase 1: Freeze behavior

Deliverables:
- this migration pack
- explicit target API delta list

Outcome:
- you know exactly what behavior matters before redesigning the UI

## Phase 2: Build the backend adapter layer

Tasks:
- create renewal details adapter
- create order submission adapter
- create order summary fetch adapter
- create payment-link adapter
- create payment-status adapter
- normalize all upstream response variants into one internal contract

Outcome:
- frontend migration does not depend on CRM shape drift

## Phase 3: Rebuild landing flow

Tasks:
- rebuild prefill screen
- implement screening logic
- implement multi-renewal selection
- serialize selected renewals explicitly
- submit order request

Outcome:
- behavior parity for the entry flow

## Phase 4: Rebuild order/payment flow

Tasks:
- fetch order by identifier
- render totals and line items
- terms gate
- payment-link request
- payment polling and terminal panels

Outcome:
- behavior parity for commercial/payment flow

## Phase 5: Rebuild confirmation flow

Tasks:
- confirmation access guard
- payment success confirmation view
- post-payment cleanup

Outcome:
- end-to-end renewal journey restored

## Refactor Priorities

High priority:
- formalize multi-renewal data contract
- remove base64 order transport
- centralize response normalization
- test payment states with fixtures

Medium priority:
- improve phone validation
- add structured analytics events for screening/payment actions
- move confirmation checks server-side

Lower priority:
- reproduce marketing sections from the current landing page
- preserve old asset and file naming

## Suggested Tests In The New App

Must-have scenario tests:
- valid token loads renewal details
- missing token shows blocked state
- invalid token shows blocked state
- both screening answers `No` unlock self-serve path
- non-`No` screening answer routes to assisted path
- required contact fields block submit when visible
- selected extra renewals are serialized correctly
- order page loads from backend order identifier
- terms gate blocks payment-link request
- payment `paid` redirects to confirmation
- payment `failed` shows recovery actions
- payment `timeout` shows recovery actions
- direct confirmation access without payment token is blocked

## Recommended Deliverables After This Pack

Next practical outputs should be:
- a target-app field mapping document
- a canonical JSON schema for renewal details and renewal order submission
- reusable validator helpers
- reusable payment state helper
- parity test fixtures generated from the current mock data

## Bottom Line

The right migration strategy is:
- keep `multi-deal-order` as the behavioral reference
- rebuild the UI in the target app
- upgrade the data contract where the branch is incomplete
- preserve the payment and gating rules exactly unless you deliberately choose better server-side replacements
