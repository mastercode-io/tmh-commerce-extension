# TMH Portal UI-Only MVP Plan (Mock Data, No Integrations)

## Archive Notice

This document is archived reference material from the UI-only portal proof-of-concept phase.

It is not part of the current TMH Commerce Extension implementation path.

Retain it only as historical reference for prior route and component decisions.

## Outcome (what “done” looks like)

A clickable, polished UI POC that matches docs/tmh_portal_dev_spec.md route structure and flows (Landing → Register/Login → Verify Email →
Welcome → Discovery → Portfolio/Watchlist → Asset Detail → Renewal Wizard), using mock data only (no Prisma/Neon/NextAuth, no Temmy/Companies
House/Zoho/Stripe).

———

## Key Decisions Locked

- Scope: UI POC only (no backend foundations yet).
- Tenancy: Single-tenant assumptions for now; multi-tenancy deferred.
- Integrations: None; all external calls mocked/stubbed.
- Asset detail UI: Dedicated page route (/asset/[id]), not drawer/modal.
- Auth: No real auth; routes are not protected; auth screens just navigate.
- Renewal: Full 5-step flow (Applicant → Trademark → Summary → Payment → Confirmation).

———

## Phase 0 — Repo hygiene (minimal, POC-aligned)

1. Replace the current root demo page
    - Remove the ComponentExample demo from the app’s entrypoint and make / render the Marketing Landing page defined in the dev spec.
    - Keep components/ui/* as the design system base; avoid adding new UI libraries.
2. Normalize code style where touched
    - Use TypeScript strict-safe patterns.
    - Follow repo Prettier rules (single quotes + semicolons) for all new/edited files.

———

## Phase 1 — App Router structure (routes + layouts)

Create these route groups and pages exactly (per docs/tmh_portal_dev_spec.md):

### Marketing

- app/(marketing)/layout.tsx
    - Renders a minimal layout with MarketingHeader and a content slot.
- app/(marketing)/page.tsx (serves /)
    - Hero headline/subheadline + CTA buttons:
        - Primary CTA → /register
        - Secondary CTA → /login

### Auth

- app/(auth)/layout.tsx
    - Uses AuthCard wrapper to center content.
- app/(auth)/login/page.tsx
    - Form UI only; on submit: navigate to /welcome (or /portfolio if you want to skip onboarding).
- app/(auth)/register/page.tsx
    - Form UI only; on submit: navigate to /verify-email?email=....
- app/(auth)/verify-email/page.tsx
    - “Check your email” UI; include “Skip for now →” link to /welcome.

### Onboarding

- app/(onboarding)/layout.tsx
    - Includes OnboardingProgress (Step 1/2 or 2/2 based on route).
- app/(onboarding)/welcome/page.tsx
    - Add identifier inputs (IPO Client ID + optional Companies House Person ID).
    - Support “add more” rows (client-side state).
    - Primary button → /discovery
    - Secondary link → /portfolio
- app/(onboarding)/discovery/page.tsx
    - Shows discovered assets from mock dataset with include/exclude checkboxes.
    - Primary button → /portfolio

### Dashboard

- app/(dashboard)/layout.tsx
    - Includes DashboardHeader with tabs:
        - Portfolio → /portfolio
        - Watchlist → /watchlist
    - Include user menu (non-functional: Settings/Log out).
- app/(dashboard)/page.tsx
    - Redirects to /portfolio.
- app/(dashboard)/portfolio/page.tsx
    - Shows:
        - Header (“Welcome back, Sarah”)
        - Action Required callout if any renewals due
        - Trademarks table
        - Companies table
        - “+ Add Asset” button opens Add Asset dialog (UI-only; either no persistence or in-session useState add—pick one and implement
          consistently).
- app/(dashboard)/watchlist/page.tsx
    - Shows watchlist table (muted treatment, includes Owner column).
- app/(dashboard)/asset/[id]/page.tsx
    - Dedicated detail view for a trademark/company.
    - Contextual actions: Renew Now (if eligible) → /renew/[id].
- app/(dashboard)/renew/[id]/page.tsx
    - Hosts RenewalWizard with full step flow and final confirmation.

———

## Phase 2 — Component buildout (decision-complete file list)

### Layout components

- components/layouts/marketing-header.tsx
    - Logo left, Login/Get Started right.
- components/layouts/auth-card.tsx
    - Centered card container with title/description slots.
- components/layouts/onboarding-progress.tsx
    - Step indicator (2 steps) driven by props: { step: 1 | 2 }.
- components/layouts/dashboard-header.tsx
    - Logo + nav tabs + user dropdown.

### Common components

- components/common/page-header.tsx
    - Props: { title: string; description?: string; actions?: ReactNode }.
- components/common/empty-state.tsx
    - Generic empty-state for tables/sections.
- components/common/loading-skeleton.tsx
    - Skeleton blocks (used on discovery + dashboard sections).
- components/common/action-button.tsx
    - Primary action button with optional Lucide icon.

### Domain components (mock-data driven)

- components/trademark/trademark-status-badge.tsx
    - Maps TrademarkStatus → label + Tailwind classes (use the dev spec’s statusColors mapping).
- components/trademark/trademark-table.tsx
    - Columns: Status | Name | Reg. Number | Renewal Date | Actions
    - “View” → /asset/[id], “Renew” shown only when status is renewal_due.
- components/trademark/trademark-card.tsx
    - Compact card (optional for discovery list).
- components/trademark/trademark-detail-panel.tsx
    - Reusable detail body used by /asset/[id] page.
- components/company/company-table.tsx
    - Columns: Status | Name | Company Number | Actions (View → /asset/[id]).
- components/company/company-card.tsx (optional)

### Renewal flow

- components/renewal/renewal-wizard.tsx
    - Client component controlling step state and data.
    - Input: { assetId: string }
- components/renewal/step-applicant.tsx
- components/renewal/step-trademark.tsx
- components/renewal/step-summary.tsx
- components/renewal/step-payment.tsx
- components/renewal/step-confirmation.tsx
    - Displays reference like TMH-2026-XXXXX (mock-generated).

### UI primitives to add (using existing radix-ui dependency)

Add only what the POC needs:

- components/ui/table.tsx (simple styled <table>)
- components/ui/tabs.tsx (wrap radix-ui Tabs)
- components/ui/dialog.tsx (wrap radix-ui Dialog) for “Add Asset” modal

———

## Phase 3 — Mock data layer (types + seed)

Create:

- lib/types.ts
    - TrademarkStatus, Trademark, Company, User, Organisation
    - Add a shared union for asset detail routing:
        - type Asset = { kind: 'trademark'; data: Trademark } | { kind: 'company'; data: Company }
- lib/mock-data.ts
    - mockUser, mockTrademarks, mockCompanies, mockWatchlist
    - Provide stable IDs used by routes (/asset/[id], /renew/[id]).

Routing rule for asset detail:

- If [id] matches a trademark ID, treat it as trademark; else if company ID, treat it as company; else show a friendly “Not found” state.

———

## Status grouping rules (Portfolio UX)

Implement deterministic grouping for trademarks:

- Action Required: renewal_due
- In Progress: pending | examination | published
- Active & Healthy: registered
- Inactive: expired | refused

Use these groups for section headings + count badges on /portfolio and /watchlist (watchlist can reuse grouping but must show Owner column).

———

## Acceptance checks (how to verify)

### Automated

- Run npm run lint
- Run npm run build

### Manual click-through (must work)

- / → CTA → /register → submit → /verify-email → skip → /welcome → submit → /discovery → import → /portfolio
- /portfolio → View on a trademark row → /asset/[id] → Renew Now → /renew/[id] → complete wizard → back to /portfolio
- Switch /portfolio ↔ /watchlist tabs; watchlist shows Owner column and no Renew action

———

## Explicitly Out of Scope (but planned next)

After the UI POC is signed off, the next milestone plan should introduce:

- Prisma + Neon schema from docs/tmh_portal_data_model.md
- NextAuth v5 integration (User/Account/Session tables)
- Tenant model + enforcement (deferred per your choice)
- External adapters (Temmy/Companies House on-demand fetch + ASSET_CACHE TTL; Zoho webhook sync; Stripe payments)

———

## Assumptions

- Current repo uses Next.js 16.1.6 and the radix-ui package for primitives; the plan builds on that (no dependency swaps).
- “Auth” is purely navigational in the POC; no middleware/guards.
- Mock data is the only data source; persistence is not required (unless you explicitly choose in-session state for “Add Asset”).
