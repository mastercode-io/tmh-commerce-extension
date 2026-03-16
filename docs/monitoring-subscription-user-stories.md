# Monitoring, Advisory & Defence Subscription — User Stories

## Document Info

- **Version:** 1.1 Draft
- **Date:** March 2026
- **Status:** Updated Requirements
- **Epic:** Monitoring Subscription Onboarding
- **Related PRD:** `monitoring-subscription-prd.md`

---

## Personas

| Persona | Context |
|---------|---------|
| **Client** | Existing TMH client who has applied for or registered a trademark. Arrives via personalised link. No portal login required. |
| **TMH Staff** | Internal team member who sends subscription links and handles MAD quotes. Not a direct user of this page. |

---

## Compact Product / UI Decisions

- Use **MAD** as the user-facing short name instead of **M&D**
- The subscription journey is a **single-page flow** with changing/collapsing sections rather than multiple internal pages
- Zoho Bookings is an external booking flow in v1 and should open in a new tab as the safe baseline
- GoCardless uses hosted checkout redirect rather than embedded payment UI
- In mixed payable + booking cases, users pay only for items that can be processed now; remaining items are clearly flagged for follow-up and shown again on confirmation
- Discounts are summarised at the quote level, not visually assigned to a specific trademark row
- Preferred annual savings copy: **Save GBP{X} per year**
- UI styling must reuse the existing portal design system: shadcn/ui primitives, pink primary accent, neutral base, current portal font stack, and existing component spacing/radius patterns

---

## Epic: Monitoring Subscription Onboarding

### US-MON-1: Access Subscription Page via Token Link

> **As a** TMH client
> **I want to** open a personalised link and see my name and trademarks
> **So that** I know this offer is relevant to me and not a generic sales page

**Acceptance Criteria:**

- [ ] Page loads at `/subscribe/monitoring?token=<TOKEN>`
- [ ] Client name displayed in greeting: "Hi {client_name}" with company name if available
- [ ] Client trademarks listed in a compact context section with total count
- [ ] If more than 3 trademarks exist, the list is collapsed with an expandable "and {n} more"
- [ ] Page loads within 2 seconds on a 3G connection target
- [ ] TMH branding and contact info are visible in the header
- [ ] Existing portal theme and component styling are applied

**Error Scenarios:**

- [ ] Missing or malformed token shows a friendly error state with contact details
- [ ] Expired token shows an expired-link error state with contact CTA
- [ ] Valid token with no trademarks shows a contact CTA
- [ ] API timeout/server error shows retry plus contact fallback

**Priority:** MVP
**Estimate:** M

---

### US-MON-2: View and Compare Monitoring Plans

> **As a** TMH client
> **I want to** compare the monitoring plans and understand the offer quickly
> **So that** I can choose a plan without leaving the page

**Acceptance Criteria:**

- [ ] Three plan cards display horizontally on desktop and stack on mobile
- [ ] Each card shows plan name, positioning badge, pricing, and CTA button
- [ ] Monitoring Essentials is visually highlighted as **RECOMMENDED**
- [ ] Feature comparison shows the full plan matrix
- [ ] Pricing copy is shown as:
  - MAD: "From GBP49-GBP149/mo depending on risk profile"
  - Essentials: "GBP24/mo for 1 trademark, +GBP12/mo each additional"
  - Annual Review: "GBP14/mo per trademark, +GBP7/mo each additional"
- [ ] Minimum term is shown for each plan
- [ ] Discounted hourly rates are shown for each plan
- [ ] Once a user selects a plan, comparison content collapses or visually recedes so the page focuses on configuration and checkout

**Priority:** MVP
**Estimate:** M

---

### US-MON-3: Select a Plan and Proceed to Trademark Assignment

> **As a** TMH client
> **I want to** choose Essentials or Annual Review and move straight into setup
> **So that** I can configure my trademarks without switching to another page

**Acceptance Criteria:**

- [ ] Clicking **Select Plan** moves the same page into trademark selection/configuration mode
- [ ] The selected plan is pre-assigned to all trademarks
- [ ] The plan comparison section collapses or is replaced by the configuration section
- [ ] A **Change plan** action returns the page to plan comparison mode
- [ ] Existing plan/trademark selections are preserved where possible when moving back and forth

**Priority:** MVP
**Estimate:** S

---

### US-MON-4: Request a Quote for Monitoring, Advisory & Defence (MAD)

> **As a** TMH client
> **I want to** get a quote for the MAD plan
> **So that** I can understand the cost based on my risk profile

**Acceptance Criteria:**

- [ ] The MAD card contains a **Get a Quote** CTA
- [ ] If all trademarks have `risk_profile`, the user moves directly into configuration with MAD prices applied
- [ ] If no trademarks have `risk_profile`, the page shows a booking prompt explaining that a short call is needed
- [ ] If some trademarks have risk and some do not, the user enters configuration and sees `Quote required` for non-quotable items
- [ ] Booking prompt includes:
  - explanation copy
  - Zoho Bookings link
  - fallback phone number
- [ ] Primary booking action opens Zoho Bookings in a new tab
- [ ] Embedding the booking experience is not required for MVP
- [ ] If some items are payable now and others require a call, the page clearly separates:
  - payable now
  - requires follow-up / booking

**MAD Pricing Matrix:**

| Risk Profile | Pre-registration (pending) | Post-registration |
|-------------|---------------------------|-------------------|
| Low | GBP49/mo | GBP49/mo |
| Medium | GBP99/mo | GBP79/mo |
| High | GBP149/mo | GBP99/mo |

**Priority:** MVP
**Estimate:** M

---

### US-MON-5: Select Trademarks for Monitoring

> **As a** TMH client
> **I want to** choose which trademarks to monitor
> **So that** I only pay for the items I want to protect right now

**Acceptance Criteria:**

- [ ] All client trademarks are shown in a table on desktop and cards on mobile
- [ ] Each trademark row/card shows:
  - checkbox, selected by default
  - trademark type with icon or thumbnail
  - image when available
  - trademark name and jurisdiction badge
  - plan dropdown for Essentials / Annual Review / MAD
  - current price or `Quote required`
- [ ] Select all / Deselect all control exists
- [ ] If all trademarks are deselected, inline validation appears
- [ ] Continue to Payment is disabled when nothing payable is selected
- [ ] Plan dropdown defaults to the previously chosen plan
- [ ] Changing a plan recalculates that item and the summary immediately

**Priority:** MVP
**Estimate:** L

---

### US-MON-6: Change Plan per Trademark

> **As a** TMH client with multiple trademarks
> **I want to** assign different plans to different trademarks
> **So that** I can optimise cost versus coverage by brand

**Acceptance Criteria:**

- [ ] Each trademark has a plan dropdown selector
- [ ] Dropdown options are Monitoring Essentials, Annual Review, and MAD
- [ ] Changing the dropdown immediately updates that row/card price
- [ ] Summary totals update in real time
- [ ] If a user switches a trademark to MAD without `risk_profile`, the price shows `Quote required` with a booking link
- [ ] Additional-trademark pricing for Essentials and Annual is recalculated correctly in backend/business logic
- [ ] UI does not visually mark a specific row as the discounted trademark
- [ ] Discount is summarised in the quote summary area only

**Priority:** MVP
**Estimate:** M

---

### US-MON-7: Toggle Between Monthly and Annual Billing

> **As a** TMH client
> **I want to** switch between monthly and annual billing
> **So that** I can see the savings before starting payment

**Acceptance Criteria:**

- [ ] Billing frequency toggle is shown prominently above the configuration list
- [ ] Toggle is a segmented control or switch, not a dropdown
- [ ] Annual pricing equals 10 x monthly pricing
- [ ] All line items and totals update when the toggle changes
- [ ] Summary shows:
  - monthly mode: `GBP{total}/month`
  - annual mode: `GBP{total}/year - save GBP{saving} per year`
- [ ] Default savings framing uses `Save GBP{saving} per year`
- [ ] Optional supporting helper text may mention the equivalent of 2 months free
- [ ] Savings amount is calculated consistently from monthly pricing
- [ ] Toggle state persists if the user changes plan view and returns
- [ ] Default mode is Monthly

**Priority:** MVP
**Estimate:** S

---

### US-MON-8: Review Quote Summary and Proceed to Payment

> **As a** TMH client
> **I want to** review a clear summary and continue to Direct Debit setup
> **So that** I know what I am paying for today and what still needs follow-up

**Acceptance Criteria:**

- [ ] Summary shows:
  - number of selected trademarks
  - total for the active billing period
  - annual savings when relevant
  - plan breakdown for mixed selections
  - separate grouping for items included in payment now
  - separate grouping for items requiring booking/follow-up
  - aggregated discount line where applicable
- [ ] Primary CTA is **Continue to Payment**
- [ ] CTA is disabled if there are no payable items or blocking validation errors
- [ ] Clicking the CTA:
  1. sends selected trademarks, plans, and billing frequency to backend
  2. shows loading state
  3. receives GoCardless checkout redirect URL
  4. redirects to GoCardless hosted payment page
- [ ] Backend errors show a retryable error state
- [ ] If any selected trademarks require a quote, CTA copy changes to **Request Quote & Pay for Selected**
- [ ] Summary copy explicitly tells the user what is included in today’s payment and what is not

**Priority:** MVP
**Estimate:** M

---

### US-MON-9: Complete Payment via GoCardless

> **As a** TMH client
> **I want to** set up Direct Debit through a secure external payment page
> **So that** my monitoring subscription is activated without our portal handling sensitive payment UI

**Acceptance Criteria:**

- [ ] User is redirected to the GoCardless hosted payment page
- [ ] GoCardless page is pre-filled with client details where possible
- [ ] On success, GoCardless redirects to `/subscribe/monitoring/confirm?token=...&session=...`
- [ ] On cancellation/failure, GoCardless redirects back to the subscription page with an appropriate status message
- [ ] Frontend does not handle payment details directly

**Priority:** MVP
**Estimate:** S

**Dependencies:**

- GoCardless API integration
- Redirect URL configuration

---

### US-MON-10: View Subscription Confirmation

> **As a** TMH client who completed payment
> **I want to** see confirmation of what was set up and what still needs action
> **So that** I have a clear record of the outcome

**Acceptance Criteria:**

- [ ] Confirmation page loads at `/subscribe/monitoring/confirm`
- [ ] Page displays:
  - success icon or illustration
  - "You're all set, {client_name}!"
  - summary card with selected plans, billing frequency, amount, and first payment date
  - what-happens-next section
- [ ] If any items were excluded from payment because they require booking, the page shows:
  - separate **Still to arrange** section
  - list of affected trademarks
  - booking CTA/link again
- [ ] Primary CTA links to the portal
- [ ] Secondary CTA provides contact details
- [ ] Page is idempotent on reload
- [ ] Invalid or expired session/token shows a safe fallback state

**Priority:** MVP
**Estimate:** S

---

## Cross-Cutting Requirements

### XC-MON-1: Responsive Design

- [ ] All screens work on 320px+ viewports
- [ ] Plan comparison uses desktop grid -> mobile stack
- [ ] Trademark list uses desktop table -> mobile cards
- [ ] Summary becomes sticky/anchored appropriately on smaller viewports
- [ ] Touch targets are at least 44px

### XC-MON-2: Loading States

- [ ] Skeleton loader on initial fetch
- [ ] Inline loading treatment on plan actions
- [ ] Checkout CTA has loading state
- [ ] Layout remains stable during loading

### XC-MON-3: Accessibility

- [ ] All interactive elements are keyboard-navigable
- [ ] Dynamic content changes manage focus sensibly
- [ ] Trademark checkboxes have labels
- [ ] Plan dropdowns and billing toggle are accessible
- [ ] Price changes and validation states are announced for assistive tech
- [ ] Colour is not the only indicator for state

### XC-MON-4: Brand Consistency

- [ ] Follows TMH Portal style guide and existing shadcn/ui usage
- [ ] Uses the portal colour palette: pink primary accent, neutral base
- [ ] Uses the current portal font stack
- [ ] Uses Lucide icons consistently
- [ ] Maintains a professional, trustworthy tone

---

## Story Map

```text
Token Access / Personalisation (US-MON-1)
             |
      Plan Comparison (US-MON-2)
             |
  +----------+-----------+
  |                      |
Essentials / Annual    MAD Quote Path
US-MON-3               US-MON-4
  |                      |
  +----------+-----------+
             |
 Trademark Configuration
 US-MON-5, US-MON-6, US-MON-7
             |
      Quote Summary / Checkout
             US-MON-8
             |
      GoCardless Redirect
             US-MON-9
             |
        Confirmation
          US-MON-10
```

---

## Priority Summary

| Story | Description | Priority | Estimate | Dependencies |
|-------|-------------|----------|----------|--------------|
| US-MON-1 | Token access & personalisation | MVP | M | Backend API |
| US-MON-2 | Plan comparison | MVP | M | - |
| US-MON-3 | Select plan -> configuration | MVP | S | US-MON-2 |
| US-MON-4 | MAD quote flow | MVP | M | US-MON-2, Zoho Bookings |
| US-MON-5 | Trademark selection UI | MVP | L | US-MON-1, US-MON-3 |
| US-MON-6 | Per-trademark plan changes | MVP | M | US-MON-5 |
| US-MON-7 | Monthly/annual toggle | MVP | S | US-MON-5 |
| US-MON-8 | Summary & checkout | MVP | M | US-MON-5, backend |
| US-MON-9 | GoCardless redirect handling | MVP | S | GoCardless integration |
| US-MON-10 | Confirmation page | MVP | S | US-MON-9 |

**Total estimated effort:** L

---

## Remaining Open Questions

1. **Pre-selected plan from CRM** -> under what circumstances should backend pass `pre_selected_plan`, and should the UI skip straight into configuration when it exists?
2. **Setup fees** -> not in scope for v1, but should the data model preserve room for future support?
3. **Token lifespan** -> how long should subscription links remain valid?
