# Monitoring Subscription Implementation Plan

## Objective

Build `/subscribe/monitoring?token=...` as a single-page subscription flow inside the existing TMH portal codebase. The page must reuse the current portal UI system, collapse from plan comparison into configuration/checkout mode after plan selection, and hand off externally to Zoho Bookings and GoCardless when required.

---

## Confirmed Product Direction

- Single-page flow with collapsible sections and rerendering driven by user actions and backend responses
- User-facing plan name is **MAD**
- Zoho Bookings is an external booking handoff and should open in a new tab in v1
- GoCardless uses hosted checkout redirect
- Mixed baskets are supported: payable items can proceed now, non-quotable MAD items are separated and carried into confirmation follow-up
- Portal visual language must be preserved: shared shadcn/ui primitives, pink primary accent, neutral base, current font stack, existing radius/spacing/button styles

---

## Recommended Build Shape

### Routes

- `app/(subscribe)/subscribe/monitoring/page.tsx`
- `app/(subscribe)/subscribe/monitoring/confirm/page.tsx`
- `app/(subscribe)/layout.tsx`

### Components

- `components/subscribe/monitoring-header.tsx`
- `components/subscribe/monitoring-flow.tsx`
- `components/subscribe/plan-cards.tsx`
- `components/subscribe/plan-feature-table.tsx`
- `components/subscribe/billing-toggle.tsx`
- `components/subscribe/trademark-selection-table.tsx`
- `components/subscribe/quote-summary.tsx`
- `components/subscribe/booking-prompt.tsx`
- `components/subscribe/subscription-confirmation.tsx`

### Shared Types / Helpers

- `lib/types/monitoring.ts`
- `lib/monitoring/pricing.ts`
- `lib/monitoring/flow.ts`
- `lib/monitoring/format.ts`

### API Surface

- `GET /api/subscribe/monitoring`
- `POST /api/subscribe/monitoring/quote`
- `POST /api/subscribe/monitoring/checkout`
- `GET /api/subscribe/monitoring/confirm`

---

## UI Architecture

### Main State Model

Use a single client flow container with explicit stages:

1. `loading`
2. `error`
3. `plan-selection`
4. `configuration`
5. `redirecting-to-payment`

Keep confirmation as its own route because it is driven by a GoCardless return state.

### Core Client State

- token
- fetched client payload
- booking URL
- selected billing frequency
- per-trademark selection state
- derived quote state
- current view mode (`plan-selection` vs `configuration`)
- API status (`idle`, `loading`, `error`)
- return message state for failed/cancelled checkout

### Rerender Rules

- Initial data fetch drives first render
- Selecting a plan collapses the comparison section and reveals configuration
- Changing a row plan, checkbox, or billing cadence triggers quote recomputation
- Checkout response triggers redirect state
- Return query params after failed payment restore configuration with an inline banner

---

## Implementation Phases

### Phase 1: Foundation

- Add subscribe route group and minimal layout
- Add monitoring types and pure pricing helpers
- Add mock fixtures or fallback stubs for local development
- Create basic loading, error, and token-validation states

### Phase 2: Plan Comparison

- Build header, greeting, trademark context summary, plan cards, and feature matrix
- Apply existing portal styling tokens/components instead of introducing custom visual patterns
- Add MAD-specific CTA behavior and Zoho Bookings prompt

### Phase 3: Configuration / Quote

- Build desktop table and mobile card list from a shared data model
- Add billing toggle, plan dropdowns, row selection, and change-plan action
- Implement quote summary with subtotal, discount, payable-now total, and follow-up-required items
- Ensure comparison section collapses cleanly once configuration starts

### Phase 4: Checkout Handoff

- Wire quote submission and checkout creation
- Redirect to GoCardless hosted checkout
- Handle retryable backend failures
- Preserve state for mixed payable + booking scenarios

### Phase 5: Confirmation

- Build confirmation route
- Show payment outcome, first payment date, selected items, and next steps
- Add `Still to arrange` section for items that required booking

### Phase 6: Hardening

- Responsive polish
- Accessibility pass
- Analytics hooks if needed
- Lint/build verification

---

## Pricing and Quote Rules

- Essentials and Annual Review discounts should be represented as summary-level discounts, not row-level "discounted item" labeling
- MAD prices depend on `risk_profile` and registration status
- MAD items without `risk_profile` are not payable now
- Annual pricing uses 10x monthly logic
- Summary must separate:
  - payable now
  - requires booking
  - subtotal
  - discount
  - total

Keep pricing helpers pure and centralised so the same logic can feed the UI, checkout payload creation, and tests.

---

## Backend Contract Expectations

### `GET /api/subscribe/monitoring`

Must return:

- client name and optional company name
- trademarks with statuses, jurisdictions, images, and optional risk profiles
- optional `pre_selected_plan`
- optional Zoho Bookings URL

### `POST /api/subscribe/monitoring/quote`

Should accept:

- billing frequency
- selected trademarks
- per-trademark plan choices

Should return:

- line items
- subtotal
- discount total
- total
- annual saving
- payable-now vs requires-follow-up grouping

### `POST /api/subscribe/monitoring/checkout`

Should accept only payable selections and enough context to record excluded follow-up items. Response should return a redirect URL and any state/session identifiers needed for confirmation.

### `GET /api/subscribe/monitoring/confirm`

Should return:

- paid items
- excluded follow-up items
- billing cadence
- first payment date
- client display info
- booking URL if follow-up still exists

---

## Risks to Handle Early

- Mixed payable + booking UX can become confusing if summary copy is weak
- Discount logic can look inconsistent if business rules leak into row presentation
- Mobile layout can become too dense if the desktop table is simply stacked without reducing noise
- Token-driven public routes need deterministic error states and no accidental portal-auth dependencies
- GoCardless return/cancel flows need a defined status-param convention before frontend wiring begins

---

## Build To-Do List

- [ ] Create route group and minimal subscription layout
- [ ] Add monitoring domain types
- [ ] Add pricing helper module with unit-test-friendly pure functions
- [ ] Add API client helpers for token fetch, quote, checkout, and confirmation
- [ ] Build loading/error/invalid-token states
- [ ] Build monitoring header and greeting block
- [ ] Build trademark context list with collapse/expand behavior
- [ ] Build plan cards and feature comparison table
- [ ] Build Zoho Bookings prompt and external-link behavior
- [ ] Build single-page flow container with `plan-selection` and `configuration` modes
- [ ] Build billing toggle
- [ ] Build desktop trademark table
- [ ] Build mobile trademark cards
- [ ] Build per-row plan selector and selection toggles
- [ ] Build quote summary with subtotal, discount, payable-now total, follow-up-required section, and CTA state
- [ ] Wire quote recalculation on every relevant state change
- [ ] Wire GoCardless checkout redirect
- [ ] Build return-message handling for cancelled/failed checkout
- [ ] Build confirmation route and `Still to arrange` section
- [ ] Add accessibility checks for keyboard flow, focus moves, and live updates
- [ ] Verify visual consistency against existing portal surfaces, buttons, badges, and spacing
- [ ] Run `npm run lint`
- [ ] Run `npm run build`

---

## Delivery Order

1. Build the pure pricing/types layer first.
2. Build the single-page UI with mock data second.
3. Wire backend endpoints and redirect flows third.
4. Finish confirmation and edge states fourth.
5. Do responsive/accessibility hardening last before handoff.
