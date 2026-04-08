# TMH Portal - Development Specification

## Archive Notice

This document is archived reference material from the earlier TMH Portal / Temmy Portal proof-of-concept phase.

It is not an active implementation target for the current repository.

The active implementation target is the TMH Commerce Extension defined by the canonical planning stack in `docs/TMH_Commerce_Extension_*`.

## Project Context

**Purpose:** Clickable MVP/POC for Temmy Portal client-facing trademark management  
**Persona:** Sarah (individual trademark owner)  
**Scope:** Epics 1-3 (Onboarding, Dashboard, Renewals)  
**Data:** Mock/static data only — no backend integration yet

**Figma Reference:** https://www.figma.com/design/o7F79hlgZ7dJ7wPmLJZj3U/TMH-App

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** shadcn/ui (Nova style, pink theme, neutral base)
- **Icons:** Lucide React
- **Font:** Inter (via next/font)
- **Styling:** Tailwind CSS
- **State:** React useState/useContext (no external state management for POC)

---

## Route Structure

```
app/
├── (marketing)/
│   ├── page.tsx                    # Landing page (/)
│   └── layout.tsx                  # Marketing layout (no auth nav)
│
├── (auth)/
│   ├── login/page.tsx              # Login form
│   ├── register/page.tsx           # Registration form
│   ├── verify-email/page.tsx       # Email verification pending
│   └── layout.tsx                  # Auth layout (centered card)
│
├── (onboarding)/
│   ├── welcome/page.tsx            # Welcome + add identifiers
│   ├── discovery/page.tsx          # Discovery results
│   └── layout.tsx                  # Onboarding layout (progress indicator)
│
├── (dashboard)/
│   ├── page.tsx                    # Main dashboard (redirect to /portfolio)
│   ├── portfolio/page.tsx          # Portfolio view
│   ├── watchlist/page.tsx          # Watchlist view
│   ├── asset/[id]/page.tsx         # Asset detail (modal or page)
│   ├── renew/[id]/page.tsx         # Renewal wizard
│   └── layout.tsx                  # Dashboard layout (top nav, user menu)
│
├── layout.tsx                      # Root layout
└── globals.css                     # Tailwind + shadcn styles
```

---

## Shared Components

### Layout Components

```
components/
├── layouts/
│   ├── marketing-header.tsx        # Logo + CTA buttons
│   ├── dashboard-header.tsx        # Logo + nav tabs + user menu
│   ├── auth-card.tsx               # Centered card wrapper
│   └── onboarding-progress.tsx     # Step indicator
│
├── ui/                             # shadcn/ui components (auto-generated)
│
├── trademark/
│   ├── trademark-card.tsx          # Compact trademark display
│   ├── trademark-table.tsx         # Table with status, dates, actions
│   ├── trademark-status-badge.tsx  # Status pill (registered, pending, etc.)
│   └── trademark-detail-panel.tsx  # Side panel or modal with full details
│
├── company/
│   ├── company-card.tsx
│   └── company-table.tsx
│
├── renewal/
│   ├── renewal-wizard.tsx          # Multi-step container
│   ├── step-applicant.tsx          # Step 1: Applicant details
│   ├── step-trademark.tsx          # Step 2: Trademark selection
│   ├── step-summary.tsx            # Step 3: Review & fees
│   └── step-payment.tsx            # Step 4: Payment (mock)
│
└── common/
    ├── page-header.tsx             # Title + description + actions
    ├── empty-state.tsx             # No data placeholder
    ├── loading-skeleton.tsx        # Loading states
    └── action-button.tsx           # Primary action with icon
```

---

## Mock Data Types

```typescript
// lib/types.ts

export type TrademarkStatus = 
  | 'registered'
  | 'pending'
  | 'examination'
  | 'published'
  | 'renewal_due'
  | 'expired'
  | 'refused';

export interface Trademark {
  id: string;
  registrationNumber: string;
  name: string;
  status: TrademarkStatus;
  jurisdiction: string;           // 'GB', 'US', 'EU', etc.
  filingDate: string;             // ISO date
  registrationDate?: string;
  renewalDate?: string;
  classes: number[];              // Nice classes
  ownerName: string;
  representative?: string;
  imageUrl?: string;              // Logo if available
}

export interface Company {
  id: string;
  companyNumber: string;
  name: string;
  status: string;                 // 'Active', 'Dissolved', etc.
  jurisdiction: string;
  incorporationDate: string;
  registeredAddress?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Organisation {
  id: string;
  name: string;
  type: 'individual' | 'company';
  primaryEmail: string;
  ipoClientIds: string[];
  chCompanyNumbers: string[];
}
```

---

## Mock Data

```typescript
// lib/mock-data.ts

import { Trademark, Company, User } from './types';

export const mockUser: User = {
  id: '1',
  name: 'Sarah Mitchell',
  email: 'sarah@example.com',
};

export const mockTrademarks: Trademark[] = [
  {
    id: '1',
    registrationNumber: 'UK00003520024',
    name: 'BRANDMASTER',
    status: 'renewal_due',
    jurisdiction: 'GB',
    filingDate: '2020-03-15',
    registrationDate: '2020-09-22',
    renewalDate: '2030-03-15',
    classes: [9, 35, 42],
    ownerName: 'Sarah Mitchell',
    representative: 'The Trademark Helpline',
  },
  {
    id: '2',
    registrationNumber: 'UK00003845123',
    name: 'INNOVATE',
    status: 'examination',
    jurisdiction: 'GB',
    filingDate: '2024-01-10',
    classes: [35, 41],
    ownerName: 'Sarah Mitchell',
  },
  {
    id: '3',
    registrationNumber: 'UK00002987654',
    name: 'LOGOX',
    status: 'registered',
    jurisdiction: 'GB',
    filingDate: '2018-06-01',
    registrationDate: '2018-12-15',
    renewalDate: '2028-06-01',
    classes: [25],
    ownerName: 'Sarah Mitchell',
    imageUrl: '/mock/logo-x.png',
  },
  {
    id: '4',
    registrationNumber: 'EU018234567',
    name: 'EUROMARK',
    status: 'registered',
    jurisdiction: 'EU',
    filingDate: '2022-05-20',
    registrationDate: '2022-11-30',
    renewalDate: '2032-05-20',
    classes: [9, 42],
    ownerName: 'Sarah Mitchell',
  },
];

export const mockCompanies: Company[] = [
  {
    id: '1',
    companyNumber: '12345678',
    name: 'Mitchell Enterprises Ltd',
    status: 'Active',
    jurisdiction: 'GB',
    incorporationDate: '2019-01-15',
    registeredAddress: '123 Business Street, London, EC1A 1BB',
  },
  {
    id: '2',
    companyNumber: '87654321',
    name: 'Innovate Holdings Ltd',
    status: 'Active',
    jurisdiction: 'GB',
    incorporationDate: '2023-06-01',
  },
];

export const mockWatchlist: Trademark[] = [
  {
    id: '5',
    registrationNumber: 'UK00003999888',
    name: 'COMPETITOR BRAND',
    status: 'registered',
    jurisdiction: 'GB',
    filingDate: '2023-02-14',
    registrationDate: '2023-08-20',
    renewalDate: '2033-02-14',
    classes: [35],
    ownerName: 'Competitor Inc.',
  },
];
```

---

## Screen Specifications

### 1. Landing Page (`/`)

**Purpose:** Marketing page with CTA to sign up

**Layout:**
- Marketing header: Logo left, "Login" and "Get Started" buttons right
- Hero section: Headline, subheadline, primary CTA button
- Features section (optional for POC)
- Footer (minimal)

**Copy:**
- Headline: "All your trademarks in one place"
- Subheadline: "Monitor, manage, and renew your intellectual property with ease"
- CTA: "Create Your Free Portfolio"

---

### 2. Registration (`/register`)

**Purpose:** Simple sign-up form

**Layout:** Centered card (auth-card component)

**Fields:**
- Full name (text input)
- Email (email input)
- Password (password input with visibility toggle)
- Submit button: "Create Account"
- Link: "Already have an account? Log in"

**Validation:** Client-side only for POC

**On Submit:** Navigate to `/verify-email`

---

### 3. Login (`/login`)

**Purpose:** Sign-in form

**Layout:** Centered card

**Fields:**
- Email
- Password
- Submit: "Sign In"
- Link: "Don't have an account? Sign up"
- Link: "Forgot password?" (non-functional for POC)

**On Submit:** Navigate to `/portfolio` (or `/welcome` if simulating first login)

---

### 4. Email Verification (`/verify-email`)

**Purpose:** Confirmation that email was sent

**Layout:** Centered card with icon

**Content:**
- Mail icon (from Lucide)
- "Check your email"
- "We've sent a verification link to {email}"
- "Didn't receive it? Resend" (button, non-functional)

**For POC:** Add a "Skip for now →" link that goes to `/welcome`

---

### 5. Welcome / Add Identifiers (`/welcome`)

**Purpose:** Onboarding step to add IPO Client IDs

**Layout:** Onboarding layout with progress indicator (Step 1 of 2)

**Content:**
- Welcome message with user's name
- Explanation: "We can automatically find your UK trademarks and companies"
- Form section:
  - IPO Client ID input (with + button to add more)
  - Companies House Person ID input (optional, collapsible)
- Primary button: "Find My Assets"
- Secondary link: "Skip and add manually"

**On Submit:** Navigate to `/discovery`

---

### 6. Discovery Results (`/discovery`)

**Purpose:** Show discovered assets, confirm import

**Layout:** Onboarding layout (Step 2 of 2)

**Content:**
- "We found X trademarks and Y companies"
- Collapsible list of discovered trademarks (checkbox to include/exclude)
- Collapsible list of discovered companies
- Primary button: "Add to My Portfolio"
- Secondary: "Add more identifiers"

**On Submit:** Navigate to `/portfolio`

---

### 7. Dashboard / Portfolio (`/portfolio`)

**Purpose:** Main dashboard showing user's owned assets

**Layout:** Dashboard layout with top navigation

**Navigation Tabs:**
- Portfolio (active)
- Watchlist

**Sections:**
1. **Page Header**
   - "Welcome back, Sarah"
   - Subtitle: "Here's an overview of your intellectual property"
   - Action button: "+ Add Asset"

2. **Action Required** (conditional, only if items exist)
   - Alert/card highlighting items needing attention
   - "1 trademark requires renewal"
   - Quick action button

3. **Your Trademarks** 
   - Section header with count badge
   - Table columns: Status | Name | Reg. Number | Renewal Date | Actions
   - Status shown as colored badge
   - Actions: "View" (opens detail), "Renew" (if applicable)
   - "View All" link if more than 5

4. **Your Companies**
   - Section header with count badge
   - Table columns: Status | Name | Company Number | Actions
   - Actions: "View"

**Empty State:** If no assets, show illustration + "Add your first trademark" CTA

---

### 8. Watchlist (`/watchlist`)

**Purpose:** View monitored (non-owned) assets

**Layout:** Same as Portfolio

**Differences:**
- Different page title: "Your Watchlist"
- Subtitle: "Assets you're monitoring"
- Table shows "Owner" column instead of assuming ownership
- No "Renew" action (can't renew assets you don't own)
- Add button: "+ Watch an Asset"

---

### 9. Asset Detail (`/asset/[id]`)

**Implementation:** Sheet/Drawer (slide from right) OR dedicated page

**Content:**
- Header with trademark name and status badge
- Key details grid:
  - Registration Number
  - Filing Date
  - Registration Date
  - Renewal Date
  - Classes (pills)
  - Owner
  - Representative
- Logo image (if available)
- Actions section:
  - "Renew Now" button (if renewal_due)
  - "View on Registry" link (external)
  - "Remove from Portfolio" (danger button)
- Activity/History section (placeholder for POC)

---

### 10. Renewal Wizard (`/renew/[id]`)

**Purpose:** Multi-step renewal flow

**Layout:** Full page with step indicator

**Steps:**

#### Step 1: Applicant
- Pre-filled applicant details (name, address, email)
- Option to edit
- "Continue" button

#### Step 2: Trademark
- Confirm trademark details
- Show: Name, Number, Classes, Current Renewal Date
- Option to add classes (future, can disable for POC)
- "Continue" button

#### Step 3: Summary
- Review all details
- Fee breakdown:
  - Official fee: £200
  - Service fee: £50 + VAT
  - Total: £260
- Terms checkbox: "I agree to the terms and conditions"
- "Proceed to Payment" button

#### Step 4: Payment
- Payment form (mock):
  - Card number
  - Expiry
  - CVV
  - Name on card
- "Pay £260" button

#### Step 5: Confirmation
- Success illustration/icon
- "Renewal Submitted!"
- "We'll process your renewal and update your portfolio"
- "Reference: TMH-2024-XXXXX"
- "Back to Portfolio" button

---

## UI Component Notes

### Status Badge Colors

```typescript
const statusColors: Record<TrademarkStatus, string> = {
  registered: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  examination: 'bg-blue-100 text-blue-800',
  published: 'bg-purple-100 text-purple-800',
  renewal_due: 'bg-orange-100 text-orange-800',
  expired: 'bg-red-100 text-red-800',
  refused: 'bg-gray-100 text-gray-800',
};
```

### Primary Actions

Use pink/magenta theme color for primary buttons (matches shadcn preset).

### Navigation

Top navigation with:
- Logo (left)
- Nav tabs: Portfolio, Watchlist (center or left-aligned after logo)
- User menu (right): Avatar dropdown with Settings, Log out

---

## Development Order (Suggested)

1. **Setup:** Layout components (marketing-header, dashboard-header, auth-card)
2. **Auth screens:** Register → Login → Verify Email (quick wins)
3. **Onboarding:** Welcome → Discovery
4. **Dashboard:** Portfolio page with trademark table
5. **Asset detail:** Sheet/drawer component
6. **Watchlist:** Copy Portfolio, adjust for watchlist context
7. **Renewal wizard:** Multi-step form

---

## Notes for Claude Code / Codex

- Use `"use client"` directive for interactive components
- Leverage shadcn/ui components: Button, Input, Card, Table, Badge, Sheet, Dialog, Tabs
- Mock navigation with `useRouter` from `next/navigation`
- Store simple state in React Context if needed (e.g., mock user session)
- Use `cn()` utility from `lib/utils` for conditional classes
- Keep components in `components/` folder, pages in `app/` folder
- Follow existing prettier/eslint config in project

---

## Figma Reference Screens

From Figma file `o7F79hlgZ7dJ7wPmLJZj3U`:

1. **Dashboard** - "Welcome Name" with trademark/company tables
2. **Renewal Step 1** - Applicant details
3. **Renewal Step 2** - Trademark selection
4. **Renewal Step 3** - Summary with fees
5. **Renewal Step 4** - Payment
6. **Renewal Step 5** - Confirmation (right side, dark variant shows this)

Pink accent color visible throughout - matches shadcn pink theme preset.
