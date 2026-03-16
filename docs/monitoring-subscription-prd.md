# Monitoring, Advisory & Defence Subscription — Product Requirements Document

## Document Info

- **Version:** 1.1 Draft
- **Date:** March 2026
- **Status:** Updated Requirements
- **Parent Project:** Temmy Portal (tmh-portal)
- **Related Docs:** `tmh_portal_user_stories.md`, `tmh_portal_data_model.md`, `monitoring-subscription-user-stories.md`

---

## 1. Overview

A standalone subscription landing page where existing TMH clients select and purchase trademark monitoring plans. Clients receive personalised links (`/subscribe/monitoring?token=<ENCODED_TOKEN>`) via email or post-trademark-application flow. The page fetches client context from the CRM backend, presents three tiered monitoring plans, and guides the user through plan selection -> trademark assignment -> payment via GoCardless Direct Debit.

This page is part of the Temmy Portal codebase but operates independently of the authenticated portal experience. No login is required for subscription setup. The token-based access model mirrors the existing client-data pattern in the old portal.

### Display Naming Convention

- Use **MAD** as the short display name throughout the interface instead of **M&D**
- Use **Monitoring, Advisory & Defence (MAD)** where expanded naming improves clarity
- Internal slugs and API names may remain unchanged unless implementation requires a rename

---

## 2. Goals & Success Criteria

| Goal | Metric |
|------|--------|
| Convert monitoring leads to paid subscriptions | Conversion rate from page load -> DD setup complete |
| Minimise friction for existing clients | < 3 clicks from landing to payment for Essentials/Annual plans |
| Support MAD quote flow without dead ends | 100% of MAD clicks route to either instant quote or booking |
| Mobile-friendly | Fully functional on 320px+ devices |

---

## 3. User Context & Entry Point

### 3.1 How Users Arrive

1. **Post-application email** -> after paying for a trademark application, client receives an email with a monitoring offer link
2. **Direct marketing** -> TMH sends targeted offer links to existing clients
3. **Portal upsell** (future) -> in-portal CTA linking to this page

### 3.2 Token & Backend Contract

The URL token is an encoded key that the backend uses to fetch:

| Field | Source | Required |
|-------|--------|----------|
| `client_name` | CRM (Zoho) | Yes |
| `company_name` | CRM | No |
| `trademarks[]` | CRM - active applications + registered marks | Yes (>=1) |
| `trademarks[].id` | CRM deal/record ID | Yes |
| `trademarks[].name` | Word mark text | Yes |
| `trademarks[].type` | `word_mark` / `figurative` / `combined` | Yes |
| `trademarks[].image_url` | Base64 or URL (for figurative marks) | No |
| `trademarks[].jurisdiction` | `GB`, `EU`, `WIPO`, etc. | Yes |
| `trademarks[].registration_number` | If registered | No |
| `trademarks[].status` | `pending` / `registered` | Yes |
| `trademarks[].risk_profile` | `low` / `medium` / `high` / `null` | No |
| `pre_selected_plan` | Plan slug if context implies one | No |
| `booking_url` | Zoho Bookings hosted URL | No |

**API endpoint:** `GET /api/subscribe/monitoring?token=<TOKEN>`

Backend is a Vercel API route (or serverless function) that decodes the token, calls Zoho CRM, and returns the above payload. Backend implementation remains out of scope for this PRD, but the contract is binding for frontend behavior.

### 3.3 Error States

| Condition | Behaviour |
|-----------|-----------|
| Missing/malformed token | Error page: "Invalid link. Please contact us." with phone/email |
| Expired token | Error page: "This link has expired. Please contact us for a new one." |
| Token valid, no trademarks found | Error page: "We couldn't find any trademarks for this account." with contact CTA |
| API timeout / server error | Error page with retry button + contact fallback |

---

## 4. Page Structure & Flow

### 4.1 High-Level Flow

```text
[Landing: Plan Selection]
        |
        +-- Essentials / Annual Review -> [Trademark Selection & Quote]
        |                                         |
        |                                         +-- [Payment: GoCardless DD Setup]
        |                                                      |
        |                                                      +-- [Confirmation Page]
        |
        +-- MAD ------------------------+-- risk_profile exists -> [Trademark Selection & Quote]
                                        |                                  |
                                        |                                  +-- [Payment -> Confirmation]
                                        |
                                        +-- no risk_profile -> [Zoho Bookings external page]
```

All three paths converge on the same in-page configuration -> payment -> confirmation sequence, except MAD items that cannot be quoted immediately and must route to Zoho Bookings.

### 4.2 Route Structure

| Route | Purpose |
|-------|---------|
| `/subscribe/monitoring?token=...` | Single-page flow: landing, plan comparison, trademark selection, quote summary, and checkout initiation |
| `/subscribe/monitoring/confirm?token=...&session=...` | Post-payment confirmation |

The main subscription experience should be implemented as a **single page with changing/collapsing sections**. Plan comparison content should collapse or visually recede once the user enters trademark configuration so the page behaves like a configuration and checkout flow rather than a long-form sales page.

---

## 5. Screen Specifications

### 5.1 Plan Selection Page

**Purpose:** Present three monitoring plans in a comparison layout, personalised with client name and trademark context.

#### Header

- TMH logo on the left
- Help/contact line on the right
- No global navigation
- Visual treatment must reuse the existing portal theme: neutral surface, pink primary accent, portal button/badge/input styles, and current font stack

#### Greeting Section

- "Hi {client_name}," or "Hi {client_name} - {company_name}"
- Intro copy: "Protect your trademarks with ongoing monitoring. Choose the plan that's right for you."
- Context line: "You have {n} trademark(s) that can be monitored:" followed by a compact inline list of trademark names
- If there are more than 3 marks, collapse the list behind "and {n} more"

#### Plan Cards

Three cards shown side-by-side on desktop and stacked on mobile.

| Element | MAD | Monitoring Essentials | Annual Review & Representation |
|---------|-----|-----------------------|-------------------------------|
| **Badge** | MOST COMPREHENSIVE | RECOMMENDED | MOST COST EFFECTIVE |
| **Price** | "From GBP49-GBP149/mo depending on risk profile" | "GBP24/mo for 1 trademark, +GBP12/mo each additional" | "GBP14/mo per trademark, +GBP7/mo each additional" |
| **CTA** | "Get a Quote" | "Select Plan" | "Select Plan" |

**Feature comparison table**:

| Feature | MAD | Essentials | Annual |
|---------|-----|-----------|--------|
| Trademark monitoring | Yes | Yes | Yes |
| Annual review across all trademarks | Yes | Yes | Yes |
| UK & international IPO notifications | Yes | Yes | Yes |
| Trademark reports | Monthly | Quarterly | Annually |
| Search engine reports | Monthly | Quarterly | Annually |
| Domain name alerts & reports | Monthly | Quarterly | Annually |
| Social media alerts & reports | Ongoing | Quarterly | Annually |
| Risk-scored threat reporting | Monthly | Quarterly | Annually |
| Temmy portal access | Yes | Yes | Yes |
| Defence hours (oppositions/invalidation) | Up to 10 hrs / 12 months | No | No |
| Proactive takedown & opposition hours | Up to 2 hrs / 12 months | No | No |
| Optional IPO address for service | Yes | Yes | Yes |
| Trademark renewal reminders | Yes | Yes | Yes |
| Auto renewal option | Yes | No | No |
| Minimum term | 6 months | 1 month notice | 1 month notice |
| Discounted hourly rate | GBP99/hr | GBP119/hr | GBP149/hr |

**Interaction:**

- Clicking **Select Plan** for Essentials or Annual assigns that plan to all trademarks and moves the page into configuration mode
- Clicking **Get a Quote** for MAD:
  - If all trademarks have `risk_profile`, move into configuration mode with MAD pricing applied
  - If no trademarks have `risk_profile`, show a booking prompt with Zoho Bookings link and fallback phone number
  - If some have risk and some do not, move into configuration mode and mark non-quotable MAD items as requiring booking
- The booking experience is treated as an **external Zoho Bookings flow** in v1
- Safe baseline is to open Zoho Bookings in a new tab and preserve page state

#### Recommended Plan Highlight

The Monitoring Essentials card should be visually emphasised using the existing portal visual language, for example stronger border, badge treatment, or accent-tinted surface.

---

### 5.2 Trademark Selection & Quote Page

**Purpose:** Show the client's trademarks with pricing based on the selected plan. Allow the user to adjust plans, switch billing cadence, review totals, and proceed to payment or booking follow-up.

This stage should behave primarily as a **configuration and checkout step**, not as an extended sales page. Once a user has selected a plan, comparison content should collapse or recede so the interface focuses on trademark-level choices, totals, and next actions.

#### Layout

- **Back link:** "Change plan" returns to the comparison state and preserves existing selections where possible
- **Billing toggle:** Monthly / Annual segmented control near the top of the configuration section
- **Trademark list:** table on desktop, stacked cards on mobile
- **Summary:** sticky sidebar on desktop, anchored summary area or sticky action bar on mobile

#### Trademark Table

| Column | Content |
|--------|---------|
| Select | Checkbox, selected by default |
| Type | Word Mark / Figurative Mark / Combined with icon or thumbnail |
| Image | Mark image if available |
| Trademark | Mark name plus jurisdiction badge |
| Plan | Dropdown: Essentials / Annual Review / MAD |
| Price | Current monthly or annual line-item amount, or "Quote required" |

Rules:

- "Select all" / "Deselect all" control in the header
- If all items are deselected, show inline validation and disable checkout
- If a trademark has no `risk_profile` and MAD is selected, show `Quote required` with a **Book a call** link
- Dropdown options should exclude MAD for trademarks that can never be quoted immediately if that is the safer UX, but the current product direction allows selection with quote-required messaging

#### Pricing for MAD

| Risk Profile | Pre-registration | Post-registration |
|-------------|------------------|-------------------|
| Low | GBP49/mo | GBP49/mo |
| Medium | GBP99/mo | GBP79/mo |
| High | GBP149/mo | GBP99/mo |

#### Mixed Payable + Booking Scenarios

If some selected trademarks are immediately payable and others require booking:

- Payable items remain included in the checkout total
- Non-quotable MAD items are excluded from immediate payment
- Non-quotable MAD items must be clearly labelled as requiring a short call
- The summary must state:
  - what the user is paying for now
  - what is not included in this payment
  - what further action is required
- The confirmation page must repeat the booking link and the list of trademarks still requiring follow-up

#### Summary Section

The summary must show:

- Number of selected trademarks
- Monthly total or annual total
- `Save GBP{amount} per year` when annual billing is selected
- Primary checkout CTA
- Separate grouping for payable items and booking-required items when relevant

If any selected trademark requires a quote:

- CTA copy can change to `Request Quote & Pay for Selected`
- Checkout only includes payable items
- Quote-required items remain visible with follow-up instructions

#### Discount Presentation

- Do not visually assign the multi-trademark discount to one specific trademark row
- Show normal line-item prices per selected trademark or service
- Aggregate multi-trademark discounts in the summary area only
- Recommended summary structure:
  - Subtotal
  - Discount
  - Total
- Example: for two trademarks on Essentials, rows may show `GBP24` and `GBP24`, while the summary shows `Discount: -GBP12`, `Total: GBP36/mo`

---

### 5.3 Payment — GoCardless Direct Debit Setup

This is **not a page we build**. After clicking the payment CTA, the backend:

1. Creates a GoCardless billing request via API
2. Returns a redirect URL
3. Frontend redirects the user to the GoCardless hosted payment page

GoCardless handles DD mandate setup. On completion, GoCardless redirects back to our confirmation route.

Decision:

- Use GoCardless hosted payment flow via redirect URL as the default and preferred UX
- Do not rely on an embedded drop-in payment component in v1
- The portal should not attempt to replicate or embed sensitive payment UI beyond initiating checkout and handling return states

**Backend responsibilities (out of scope for frontend PRD but noted for contract):**

- Create or update relevant CRM subscription records
- Create GoCardless customer, mandate, and subscription/billing request
- Return redirect URL plus session/state token

---

### 5.4 Confirmation Page

**Route:** `/subscribe/monitoring/confirm?token=...&session=...`

**Purpose:** Confirm what the user has successfully set up and what still requires follow-up.

**Content:**

- Success icon or illustration
- "You're all set, {client_name}!"
- Summary card:
  - Plan(s) selected with trademark names
  - Billing frequency
  - First payment date
  - Monthly or annual amount
- "What happens next" section:
  - "Your monitoring service will begin within 24 hours"
  - "You'll receive a confirmation email shortly"
  - "Access your monitoring dashboard in the Temmy Portal"
- CTA: "Go to Temmy Portal" (primary) and "Contact us" (secondary)

If the payment included only a subset of the selected items because some MAD trademarks required a call:

- show a separate **Still to arrange** section
- list those trademarks clearly
- repeat the Zoho Bookings CTA/link
- explain that these items were not included in the payment completed today

---

## 6. Technical Architecture

### 6.1 Stack Alignment

This work must follow the existing portal implementation conventions:

| Aspect | Decision |
|--------|----------|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui + Radix UI + Tailwind CSS |
| Theme | Existing portal pink primary accent, neutral base surfaces, shared button/input/select/badge styles |
| Icons | Lucide React |
| Font | Current portal font stack from `app/layout.tsx` |
| State | Local client state plus server round-trips, no external state library required |
| Deployment | Vercel |

### 6.2 Route Group

```text
app/
├── (subscribe)/
│   ├── layout.tsx
│   └── subscribe/
│       └── monitoring/
│           ├── page.tsx
│           └── confirm/
│               └── page.tsx
```

The main route should own the full single-page flow. Internal flow changes should be driven by component state, URL query params where useful, and backend responses rather than extra routes.

### 6.3 API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/subscribe/monitoring` | GET | Fetch client data by token |
| `/api/subscribe/monitoring/quote` | POST | Calculate pricing for current selections and billing mode |
| `/api/subscribe/monitoring/checkout` | POST | Create GoCardless billing request and return redirect URL |
| `/api/subscribe/monitoring/confirm` | GET | Fetch confirmation details after payment return |

### 6.4 New Types

```typescript
// lib/types/monitoring.ts

export type MonitoringPlan = 'monitoring_defence' | 'monitoring_essentials' | 'annual_review';
export type RiskProfile = 'low' | 'medium' | 'high';
export type BillingFrequency = 'monthly' | 'annual';

export interface MonitoringTrademark {
  id: string;
  name: string;
  type: 'word_mark' | 'figurative' | 'combined';
  imageUrl?: string;
  jurisdiction: string;
  registrationNumber?: string;
  status: 'pending' | 'registered';
  riskProfile?: RiskProfile;
}

export interface MonitoringClientData {
  clientName: string;
  companyName?: string;
  trademarks: MonitoringTrademark[];
  preSelectedPlan?: MonitoringPlan;
  bookingUrl?: string;
}

export interface TrademarkSelection {
  trademarkId: string;
  plan: MonitoringPlan;
  selected: boolean;
}

export interface MonitoringQuote {
  selections: TrademarkSelection[];
  billingFrequency: BillingFrequency;
  lineItems: QuoteLineItem[];
  subtotal: number;
  discountTotal: number;
  monthlyTotal: number;
  annualTotal: number;
  annualSaving: number;
  payableNowTotal: number;
  requiresFollowUpTotal: number;
}

export interface QuoteLineItem {
  trademarkId: string;
  trademarkName: string;
  plan: MonitoringPlan;
  monthlyPrice: number;
  annualPrice: number;
  requiresQuote: boolean; // true if MAD selected but no risk profile
}
```

### 6.5 Component Structure

```text
components/
├── subscribe/
│   ├── monitoring-header.tsx
│   ├── monitoring-flow.tsx
│   ├── plan-cards.tsx
│   ├── plan-feature-table.tsx
│   ├── billing-toggle.tsx
│   ├── trademark-selection-table.tsx
│   ├── quote-summary.tsx
│   ├── booking-prompt.tsx
│   └── subscription-confirmation.tsx
```

---

## 7. Pricing Logic

### 7.1 Essentials

- Base monthly price: GBP24
- Additional trademark monthly price: GBP12
- Annual price = 10 x monthly effective price

### 7.2 Annual Review & Representation

- Base monthly price: GBP14
- Additional trademark monthly price: GBP7
- Annual price = 10 x monthly effective price

### 7.3 Monitoring, Advisory & Defence (MAD)

- Requires risk profile for instant pricing
- Pre-registration (pending): GBP49 / GBP99 / GBP149 per month for low / medium / high
- Post-registration (registered): GBP49 / GBP79 / GBP99 per month for low / medium / high
- Annual price = 10 x monthly
- Minimum term: 6 months

### 7.4 Pricing Edge Cases

- Mixed-plan baskets are supported
- Essentials and Annual Review may apply base-plus-additional discounting in business logic, but the UI should present discounts in the summary rather than tagging a specific row as discounted
- Mixed payable and follow-up-required items must be split clearly in quote and confirmation summaries
- MAD with no risk profile is excluded from immediate payment and flagged for follow-up

---

## 8. Mobile Responsiveness

| Breakpoint | Layout |
|-----------|--------|
| 320px-767px | Plan cards stack vertically. Trademark table becomes cards. Summary becomes anchored/sticky. |
| 768px-1023px | Compact multi-column comparison. Trademark table may scroll horizontally. |
| 1024px+ | Full comparison and sticky summary sidebar. |

---

## 9. Accessibility

- WCAG 2.1 AA target
- Keyboard-navigable plan selection, controls, and summary CTA
- Screen-reader labels on dynamic controls and prices
- Colour contrast >= 4.5:1 for text
- Focus management when the page shifts from comparison to configuration
- Live announcements for pricing changes and validation states

---

## 10. Analytics Events (Future)

| Event | Trigger |
|-------|---------|
| `monitoring.page_view` | Page loads with valid token |
| `monitoring.plan_selected` | User clicks a plan CTA |
| `monitoring.billing_toggled` | Monthly/Annual switch |
| `monitoring.trademark_toggled` | Select/deselect a trademark |
| `monitoring.plan_changed` | User changes the plan on a trademark |
| `monitoring.checkout_started` | Checkout CTA clicked |
| `monitoring.payment_complete` | Confirmation page loads |
| `monitoring.booking_clicked` | Zoho Bookings link clicked |

---

## 11. Out of Scope (v1)

- Setup fees
- Reseller/commission configuration
- EU or international pricing variants beyond the defined rules
- In-portal subscription management
- Monitoring reports/dashboard
- Automatic renewal from monitoring subscription
- Promo codes / coupon entry

---

## 12. Confirmed Decisions / Compact UI Rules

1. **Booking tool / link behavior**
   - Booking URL comes from Zoho Bookings
   - v1 treats booking as an external flow
   - Safe baseline is to open in a new tab and preserve portal state
2. **GoCardless behavior**
   - Use hosted payment page redirect
   - No embedded payment component in v1
3. **Mixed MAD scenario**
   - Users may pay immediately for quotable/payable items
   - Non-quotable MAD items are flagged separately and routed to booking
   - Booking link appears both inline and on the confirmation page
4. **Discount presentation**
   - Show aggregated discount in the summary
   - Keep row pricing simple and legible
5. **Annual savings copy**
   - Preferred default: `Save GBPX per year`
   - Optional supporting microcopy: `Equivalent to 2 months free compared with monthly billing`
6. **Single-page UX**
   - The main flow is a single route with collapsing sections and rerendering based on user actions and backend responses
7. **Frontend/backend contract**
   - Frontend calls custom Zoho CRM and GoCardless proxy endpoints via portal API routes
   - Frontend only needs deterministic states for expired token, quote/check-out creation failure, and confirmation fetch failure
