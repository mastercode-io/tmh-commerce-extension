# TMH Portal — Implementation Specification
# Phase 0 (Scaffolding) → Phase 3 (Track A Complete)

**Version:** 1.0  
**Date:** April 2026  
**Repo:** `mastercode-io/tmh-portal`  
**Live POC:** https://tmh-portal.vercel.app  
**Stack:** Next.js 16.x · shadcn/ui · Tailwind CSS · Vercel · TypeScript

---

## Table of Contents

1. [Current State Assessment](#1-current-state-assessment)
2. [Architecture & Conventions](#2-architecture--conventions)
3. [Phase 0 — Production Scaffolding](#3-phase-0--production-scaffolding)
4. [Phase 1 — Free Quick Search + Account Creation](#4-phase-1--free-quick-search--account-creation)
5. [Phase 2 — Free Advanced Search + Class Helpers](#5-phase-2--free-advanced-search--class-helpers)
6. [Phase 3 — Brand Audit Order + Payment + Report Delivery](#6-phase-3--brand-audit-order--payment--report-delivery)
7. [API Layer — Contracts & Mock Strategy](#7-api-layer--contracts--mock-strategy)
8. [Data Types & Shared Models](#8-data-types--shared-models)
9. [Component Inventory](#9-component-inventory)
10. [Environment & Deployment](#10-environment--deployment)
11. [Acceptance Criteria Per Phase](#11-acceptance-criteria-per-phase)

---

## 1. Current State Assessment

### 1.1 What the POC Contains

The repo implements the **UI-only MVP** from `docs/tmh_portal_poc_phase1_implementation_plan.md`:

**Implemented routes (mock data, no backend):**
- `(marketing)/` — Landing page with hero, feature cards, CTAs
- `(auth)/login` — Login form (navigational only)
- `(auth)/register` — Registration form (navigational only)
- `(auth)/verify-email` — "Check your email" screen with skip link
- `(onboarding)/welcome` — IPO Client ID input with "Find My Assets"
- `(onboarding)/discovery` — Discovered assets with include/exclude
- `(dashboard)/portfolio` — Trademark + company tables, grouped by status
- `(dashboard)/watchlist` — Monitored assets table with Owner column
- `(dashboard)/asset/[id]` — Asset detail page
- `(dashboard)/renew/[id]` — 5-step renewal wizard (mock payment)

**Existing components (in `components/`):**
- `ui/` — shadcn/ui primitives (button, input, card, table, badge, sheet, dialog, tabs, etc.)
- `layouts/` — marketing-header, dashboard-header, auth-card, onboarding-progress
- `trademark/` — trademark-table, trademark-status-badge, trademark-detail-panel
- `company/` — company-table
- `renewal/` — renewal-wizard, step-applicant, step-trademark, step-summary, step-payment, step-confirmation
- `common/` — page-header, empty-state, loading-skeleton, action-button

**Existing lib (in `lib/`):**
- `types.ts` — TrademarkStatus, Trademark, Company, User, Organisation
- `mock-data.ts` — mockUser, mockTrademarks, mockCompanies, mockWatchlist
- `utils.ts` — cn() class utility

**What does NOT exist yet:**
- Real authentication (NextAuth, OTP, sessions)
- API routes / server actions
- Database (Prisma, Neon, or any persistence)
- Search product (Quick Search, Advanced Search, Brand Audit)
- Payment integration (Stripe)
- Zoho CRM integration
- Temmy API integration
- Email/notification system
- User/organisation management beyond mock

### 1.2 What We're Building

We transform the POC into a production application by adding:

| Layer | What Changes |
|-------|-------------|
| **Auth** | Real NextAuth v5 with credentials (OTP email) + session management |
| **Database** | Neon Postgres via Prisma ORM — users, orgs, searches, orders |
| **API Routes** | Next.js Route Handlers for all backend operations |
| **Search Product** | Quick Search, Advanced Search, Brand Audit — full Track A |
| **Payments** | Stripe Checkout for Brand Audit + Renewal |
| **Zoho CRM** | Webhook-based lead/deal sync via API routes |
| **Temmy API** | Trademark search + data retrieval via existing API |
| **External API Adapters** | Braudit search/audit endpoints (mocked until Suntec delivers) |

---

## 2. Architecture & Conventions

### 2.1 Project Structure (Target)

```
tmh-portal/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx                    # Landing page (keep existing)
│   │   └── layout.tsx
│   ├── (auth)/
│   │   ├── login/page.tsx              # → real OTP login
│   │   ├── register/page.tsx           # → real registration
│   │   ├── verify-email/page.tsx       # → real OTP verification
│   │   └── layout.tsx
│   ├── (onboarding)/
│   │   ├── welcome/page.tsx            # → real identifier input
│   │   ├── discovery/page.tsx          # → real Temmy API query
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── portfolio/page.tsx          # → real data from DB + cache
│   │   ├── watchlist/page.tsx          # → real data
│   │   ├── asset/[id]/page.tsx         # → real data
│   │   ├── renew/[id]/page.tsx         # → real Stripe payment
│   │   ├── layout.tsx
│   │   └── page.tsx                    # redirect to /portfolio
│   ├── (search)/                       # NEW — Track A
│   │   ├── layout.tsx                  # Search-specific layout
│   │   ├── quick/page.tsx              # Quick Search
│   │   ├── advanced/page.tsx           # Advanced Search
│   │   ├── results/[searchId]/page.tsx # Search results view
│   │   └── history/page.tsx            # Search history
│   ├── (audit)/                        # NEW — Track A
│   │   ├── layout.tsx
│   │   ├── order/page.tsx              # Brand Audit order form
│   │   ├── order/[id]/page.tsx         # Audit status tracking
│   │   ├── reports/page.tsx            # My reports list
│   │   └── reports/[id]/page.tsx       # Report viewer
│   ├── api/                            # NEW — API routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── search/
│   │   │   ├── quick/route.ts
│   │   │   ├── advanced/route.ts
│   │   │   └── class-suggest/route.ts
│   │   ├── audit/
│   │   │   ├── create/route.ts
│   │   │   └── [id]/
│   │   │       ├── status/route.ts
│   │   │       └── report/route.ts
│   │   ├── trademarks/
│   │   │   ├── by-client-id/[id]/route.ts
│   │   │   └── [appNo]/route.ts
│   │   ├── zoho/
│   │   │   ├── webhook/route.ts
│   │   │   └── sync/route.ts
│   │   ├── stripe/
│   │   │   └── webhook/route.ts
│   │   └── user/
│   │       ├── profile/route.ts
│   │       └── identifiers/route.ts
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── ui/                             # shadcn/ui primitives (existing)
│   ├── layouts/                        # Layout components (existing)
│   ├── trademark/                      # Trademark components (existing)
│   ├── company/                        # Company components (existing)
│   ├── renewal/                        # Renewal wizard (existing)
│   ├── common/                         # Shared components (existing)
│   ├── search/                         # NEW — Search product components
│   │   ├── quick-search-form.tsx
│   │   ├── advanced-search-form.tsx
│   │   ├── search-results-table.tsx
│   │   ├── risk-score-badge.tsx
│   │   ├── risk-summary-card.tsx
│   │   ├── class-selector.tsx
│   │   ├── class-helper-sic.tsx
│   │   ├── class-helper-description.tsx
│   │   ├── class-helper-website.tsx
│   │   ├── image-upload.tsx
│   │   └── marketing-cta.tsx
│   ├── audit/                          # NEW — Audit components
│   │   ├── audit-order-form.tsx
│   │   ├── audit-status-tracker.tsx
│   │   ├── report-viewer.tsx
│   │   ├── report-list.tsx
│   │   └── geo-layer-selector.tsx
│   ├── payment/                        # NEW — Payment components
│   │   ├── stripe-checkout-button.tsx
│   │   ├── payment-summary.tsx
│   │   └── payment-success.tsx
│   └── auth/                           # NEW — Auth components
│       ├── otp-input.tsx
│       ├── login-form.tsx
│       ├── register-form.tsx
│       └── session-provider.tsx
│
├── lib/
│   ├── types.ts                        # Shared types (extend existing)
│   ├── mock-data.ts                    # Mock data (keep for dev)
│   ├── utils.ts                        # cn() utility (existing)
│   ├── auth.ts                         # NEW — NextAuth config
│   ├── db.ts                           # NEW — Prisma client
│   ├── stripe.ts                       # NEW — Stripe client + helpers
│   ├── zoho.ts                         # NEW — Zoho CRM API client
│   ├── temmy.ts                        # NEW — Temmy API client
│   ├── braudit.ts                      # NEW — Braudit API client (mocked)
│   ├── email.ts                        # NEW — Email sending (Resend/etc.)
│   └── validators.ts                   # NEW — Zod schemas for forms/API
│
├── prisma/
│   ├── schema.prisma                   # NEW — Database schema
│   └── seed.ts                         # NEW — Seed data
│
├── docs/                               # Existing + new docs
├── public/
├── AGENTS.md
├── components.json                     # shadcn/ui config
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

### 2.2 Coding Conventions (from AGENTS.md)

- TypeScript strict mode. No `any`.
- Single quotes, semicolons (Prettier).
- `PascalCase` components, `kebab-case.tsx` filenames.
- Server Components by default; `"use client"` only when required.
- Import via `@/` path alias.
- Conventional Commits for git messages.
- Run `npm run lint` and `npm run build` before every PR.

### 2.3 Dependency Strategy

**Add these dependencies across Phases 0–3:**

```
# Phase 0 — Auth & Database
next-auth@5           # Auth.js v5
@prisma/client        # Prisma ORM
prisma                # Prisma CLI (devDep)
@auth/prisma-adapter  # NextAuth ↔ Prisma bridge
bcryptjs              # Password hashing (if needed alongside OTP)
zod                   # Schema validation

# Phase 1 — Search
(no new deps — uses existing shadcn/ui + API routes)

# Phase 2 — Advanced Search
react-dropzone        # Image upload for logo search

# Phase 3 — Payments & Audit
stripe                # Stripe Node SDK
@stripe/stripe-js     # Stripe client-side
resend                # Email delivery (or nodemailer)
```

---

## 3. Phase 0 — Production Scaffolding

**Goal:** Transform the navigational POC into a real application with auth, database, and API infrastructure. No new features — just wire up the foundations that all subsequent phases depend on.

**ETA:** 3–5 days with coding agents.

### 3.1 Database (Prisma + Neon)

**File: `prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── Auth (NextAuth v5 adapter tables) ───

model User {
  id              String    @id @default(cuid())
  name            String?
  email           String    @unique
  emailVerified   DateTime?
  image           String?
  passwordHash    String?
  userType        UserType  @default(CLIENT)
  status          UserStatus @default(ACTIVE)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  lastLoginAt     DateTime?
  
  accounts        Account[]
  sessions        Session[]
  identifiers     UserIdentifier[]
  searches        SearchHistory[]
  auditOrders     AuditOrder[]
  organisationMembers OrganisationMember[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ─── Core Business ───

model Organisation {
  id             String           @id @default(cuid())
  name           String
  type           OrgType          @default(INDIVIDUAL)
  primaryEmail   String?
  region         String?
  ipoClientIds   String[]         @default([])
  chCompanyNumbers String[]       @default([])
  zohoAccountId  String?
  status         OrgStatus        @default(ACTIVE)
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
  
  members        OrganisationMember[]
  auditOrders    AuditOrder[]
}

model OrganisationMember {
  id             String      @id @default(cuid())
  userId         String
  organisationId String
  role           MemberRole  @default(USER)
  status         MemberStatus @default(ACTIVE)
  createdAt      DateTime    @default(now())
  
  user           User         @relation(fields: [userId], references: [id])
  organisation   Organisation @relation(fields: [organisationId], references: [id])
  @@unique([userId, organisationId])
}

model UserIdentifier {
  id              String         @id @default(cuid())
  userId          String
  identifierType  IdentifierType
  identifierValue String
  verified        Boolean        @default(false)
  createdAt       DateTime       @default(now())
  
  user User @relation(fields: [userId], references: [id])
  @@unique([userId, identifierType, identifierValue])
}

// ─── Search & Audit (Track A) ───

model SearchHistory {
  id             String      @id @default(cuid())
  userId         String
  searchType     SearchType
  searchInput    Json        // Full search criteria
  resultsSummary Json?       // Aggregated risk scores
  zohoLeadId     String?
  createdAt      DateTime    @default(now())
  
  user User @relation(fields: [userId], references: [id])
}

model AuditOrder {
  id               String       @id @default(cuid())
  userId           String
  organisationId   String?
  searchCriteria   Json         // Full audit config
  status           AuditStatus  @default(AWAITING_PAYMENT)
  paymentAmount    Decimal?     @db.Decimal(10, 2)
  paymentCurrency  String       @default("GBP")
  stripeSessionId  String?
  stripePaymentId  String?
  zohoDealId       String?
  brauditOrderId   String?
  reportUrl        String?
  reportFormat     String?
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  completedAt      DateTime?
  publishedAt      DateTime?
  
  user         User          @relation(fields: [userId], references: [id])
  organisation Organisation? @relation(fields: [organisationId], references: [id])
}

// ─── Enums ───

enum UserType {
  STAFF
  CLIENT
  REPRESENTATIVE
  INTRODUCER
  RESELLER
  WHITE_LABEL
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
}

enum OrgType {
  INDIVIDUAL
  COMPANY
  REPRESENTATIVE
}

enum OrgStatus {
  ACTIVE
  ARCHIVED
}

enum MemberRole {
  OWNER
  ADMIN
  USER
  VIEWER
  ASSISTANT
}

enum MemberStatus {
  PENDING
  ACTIVE
  REVOKED
}

enum IdentifierType {
  IPO_CLIENT_ID
  CH_PERSON_ID
}

enum SearchType {
  QUICK
  ADVANCED
}

enum AuditStatus {
  AWAITING_PAYMENT
  PAID
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

**File: `lib/db.ts`**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 3.2 Authentication (NextAuth v5)

**File: `lib/auth.ts`**

```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    newUser: '/welcome',
    verifyRequest: '/verify-email',
  },
  providers: [
    Credentials({
      id: 'otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP Code', type: 'text' },
      },
      async authorize(credentials) {
        // Validate OTP against VerificationToken table
        const { email, otp } = credentials as { email: string; otp: string };
        
        const token = await prisma.verificationToken.findFirst({
          where: {
            identifier: email,
            token: otp,
            expires: { gt: new Date() },
          },
        });
        
        if (!token) return null;
        
        // Delete used token
        await prisma.verificationToken.delete({
          where: { identifier_token: { identifier: email, token: otp } },
        });
        
        // Find or create user
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: { email, emailVerified: new Date() },
          });
        } else {
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date(), emailVerified: new Date() },
          });
        }
        
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    Credentials({
      id: 'password',
      name: 'Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string };
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;
        
        const bcrypt = await import('bcryptjs');
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;
        
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });
        
        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
```

**File: `app/api/auth/[...nextauth]/route.ts`**

```typescript
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

**File: `app/api/auth/send-otp/route.ts`**

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { randomInt } from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  
  const otp = String(randomInt(100000, 999999));
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
  
  // Upsert token
  await prisma.verificationToken.upsert({
    where: { identifier_token: { identifier: email, token: otp } },
    create: { identifier: email, token: otp, expires },
    update: { expires },
  });
  
  // Send email (Phase 0: log to console; production: use Resend)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] OTP for ${email}: ${otp}`);
  } else {
    // await sendOtpEmail(email, otp);
  }
  
  return NextResponse.json({ sent: true });
}
```

### 3.3 Middleware (Route Protection)

**File: `middleware.ts`** (project root)

```typescript
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

const protectedPrefixes = ['/portfolio', '/watchlist', '/asset', '/renew', '/audit', '/search/history'];
const authPages = ['/login', '/register', '/verify-email'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;
  
  // Protected routes → redirect to login
  if (protectedPrefixes.some((p) => pathname.startsWith(p)) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  // Auth pages → redirect to portfolio if already logged in
  if (authPages.some((p) => pathname.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/portfolio', req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
```

### 3.4 Phase 0 Conversion Checklist

| Task | Details |
|------|---------|
| Install dependencies | `next-auth@5 @prisma/client @auth/prisma-adapter bcryptjs zod` + devDeps `prisma @types/bcryptjs` |
| Set up Prisma | `npx prisma init`, paste schema, `npx prisma db push` against Neon |
| Create `lib/db.ts` | Singleton Prisma client |
| Create `lib/auth.ts` | NextAuth config with OTP + password providers |
| Create auth API routes | `api/auth/[...nextauth]`, `api/auth/send-otp` |
| Create `middleware.ts` | Route protection |
| Convert `(auth)/login` | Replace navigational form with real OTP login flow |
| Convert `(auth)/register` | Real user creation → OTP verification |
| Convert `(auth)/verify-email` | Real OTP input → session creation |
| Add session provider | Wrap app with NextAuth SessionProvider |
| Convert dashboard layout | Use `auth()` to get real user, replace `mockUser` |
| Update header | Real user name, functional logout |
| Verify build | `npm run lint && npm run build` must pass |
| Environment variables | `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |

---

## 4. Phase 1 — Free Quick Search + Account Creation

**Goal:** Users can perform a trademark search from the marketing site, see risk-scored results, and create an account. Every search generates a Zoho lead.

**ETA:** 1–2 weeks (portal work parallelisable with Suntec API development).

### 4.1 Routes

| Route | Type | Purpose |
|-------|------|---------|
| `(search)/quick/page.tsx` | Page | Quick Search form + results (public for first search, auth-gated after) |
| `(search)/results/[searchId]/page.tsx` | Page | Persistent search results view (authenticated) |
| `(search)/history/page.tsx` | Page | User's search history list (authenticated) |
| `api/search/quick/route.ts` | API | Execute search → Temmy API → score → persist → return |
| `api/zoho/lead/route.ts` | API | Push lead data to Zoho CRM |

### 4.2 Quick Search Form

**Component: `components/search/quick-search-form.tsx`**

```typescript
interface QuickSearchFormProps {
  onResults?: (searchId: string) => void;
  embedded?: boolean; // true when used as widget on marketing page
}

// Form fields:
// - word: string (required, min 2 chars)
// - classes: number[] (optional, multi-select from 1-45)
// - jurisdiction: 'GB' (default, locked for Phase 1)

// Validation schema (Zod):
const quickSearchSchema = z.object({
  word: z.string().min(2, 'Enter at least 2 characters'),
  classes: z.array(z.number().min(1).max(45)).optional(),
  jurisdiction: z.literal('GB').default('GB'),
});
```

**Behaviour:**
1. Form validates client-side with Zod.
2. On submit → `POST /api/search/quick` with form data.
3. Show loading state (skeleton results).
4. If user not authenticated and this is their first search → show results, then gate further interaction with registration modal.
5. If authenticated → persist search, display results, log to Zoho.
6. Results page shows risk summary card at top + detailed results table.

### 4.3 Search Results Display

**Component: `components/search/search-results-table.tsx`**

Columns: Risk | Mark Name | App Number | Status | Classes | Owner | Similarity

**Component: `components/search/risk-score-badge.tsx`**

```typescript
type RiskLevel = 'high' | 'medium' | 'low';

const riskConfig: Record<RiskLevel, { bg: string; text: string; label: string }> = {
  high:   { bg: 'bg-red-100',    text: 'text-red-800',    label: 'High Risk' },
  medium: { bg: 'bg-amber-100',  text: 'text-amber-800',  label: 'Medium Risk' },
  low:    { bg: 'bg-green-100',  text: 'text-green-800',  label: 'Low Risk' },
};
```

**Component: `components/search/risk-summary-card.tsx`**

Displays aggregate risk assessment:
- Count of high/medium/low results
- Dynamic marketing message based on risk profile
- CTA buttons: "Request Brand Audit" → `/audit/order`, "Apply for Trademark" → external/future

**Component: `components/search/marketing-cta.tsx`**

Contextual call-to-action based on risk score:
- Low risk overall: "Appears relatively safe in the UK. Consider a Brand Audit for peace of mind."
- Medium risk: "Some potential conflicts found. A Brand Audit is recommended before proceeding."
- High risk: "Significant conflicts detected. Professional review strongly recommended."

### 4.4 Quick Search API Route

**File: `app/api/search/quick/route.ts`**

```typescript
// POST /api/search/quick
// Body: { word: string, classes?: number[], jurisdiction: 'GB' }
// Response: { searchId: string, results: SearchResult[], summary: RiskSummary }

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = quickSearchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  
  // 1. Call Temmy API for trademark search
  const temmyResults = await temmyClient.searchTrademarks(parsed.data);
  
  // 2. Score results (basic word similarity — local scoring for Phase 1)
  const scoredResults = scoreQuickSearchResults(temmyResults, parsed.data.word);
  
  // 3. Persist search (if authenticated)
  const session = await auth();
  let searchId: string | null = null;
  if (session?.user?.id) {
    const search = await prisma.searchHistory.create({
      data: {
        userId: session.user.id,
        searchType: 'QUICK',
        searchInput: parsed.data,
        resultsSummary: computeSummary(scoredResults),
      },
    });
    searchId = search.id;
  }
  
  // 4. Push to Zoho (fire-and-forget)
  zohoClient.pushSearchLead({
    email: session?.user?.email,
    searchTerm: parsed.data.word,
    classes: parsed.data.classes,
    resultCount: scoredResults.length,
    riskSummary: computeSummary(scoredResults),
  }).catch(console.error);
  
  return NextResponse.json({ searchId, results: scoredResults, summary: computeSummary(scoredResults) });
}
```

### 4.5 Temmy API Client

**File: `lib/temmy.ts`**

```typescript
// The Temmy API is an existing, working API for UKIPO trademark data.
// Base URL from environment: TEMMY_API_URL

interface TemmySearchParams {
  word: string;
  classes?: number[];
  jurisdiction?: string;
}

interface TemmyTrademark {
  applicationNumber: string;
  markText: string;
  status: string;
  niceClasses: number[];
  ownerName: string;
  filingDate: string;
  expiryDate: string;
  country: string;
  representativeId?: string;
  imageUri?: string;
}

export const temmyClient = {
  async searchTrademarks(params: TemmySearchParams): Promise<TemmyTrademark[]> {
    const res = await fetch(`${process.env.TEMMY_API_URL}/trademarks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.TEMMY_API_KEY}`,
      },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error(`Temmy API error: ${res.status}`);
    return res.json();
  },
  
  async getByClientId(clientId: string): Promise<TemmyTrademark[]> {
    const res = await fetch(`${process.env.TEMMY_API_URL}/trademarks/by-client-id/${clientId}`, {
      headers: { 'Authorization': `Bearer ${process.env.TEMMY_API_KEY}` },
    });
    if (!res.ok) throw new Error(`Temmy API error: ${res.status}`);
    return res.json();
  },
  
  async getByAppNo(appNo: string): Promise<TemmyTrademark | null> {
    const res = await fetch(`${process.env.TEMMY_API_URL}/trademarks/${appNo}`, {
      headers: { 'Authorization': `Bearer ${process.env.TEMMY_API_KEY}` },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Temmy API error: ${res.status}`);
    return res.json();
  },
};
```

### 4.6 Zoho CRM Client

**File: `lib/zoho.ts`**

```typescript
// Zoho CRM integration — push-only from portal.

interface ZohoLeadData {
  email?: string | null;
  searchTerm: string;
  classes?: number[];
  resultCount: number;
  riskSummary: RiskSummary;
}

interface ZohoDealData {
  contactEmail: string;
  dealType: 'AUDIT' | 'RENEWAL' | 'SERVICE';
  amount: number;
  currency: string;
  status: string;
  metadata: Record<string, unknown>;
}

export const zohoClient = {
  async pushSearchLead(data: ZohoLeadData): Promise<void> {
    await zohoApiCall('POST', '/crm/v6/Leads', {
      data: [{
        Email: data.email,
        Last_Name: data.email?.split('@')[0] || 'Unknown',
        Lead_Source: 'Portal Search',
        Description: `Search: "${data.searchTerm}" | Results: ${data.resultCount} | Risk: ${JSON.stringify(data.riskSummary)}`,
      }],
    });
    // Also notify enquiries@
    // await sendNotification('enquiries@thetrademarkhelpline.com', ...);
  },
  
  async createDeal(data: ZohoDealData): Promise<string> {
    const res = await zohoApiCall('POST', '/crm/v6/Deals', {
      data: [{
        Deal_Name: `${data.dealType} — ${data.contactEmail}`,
        Amount: data.amount,
        Stage: data.status,
        // ... map remaining fields
      }],
    });
    return res.data[0].details.id;
  },
  
  async updateDealStatus(dealId: string, status: string): Promise<void> {
    await zohoApiCall('PUT', `/crm/v6/Deals/${dealId}`, {
      data: [{ Stage: status }],
    });
  },
};

async function zohoApiCall(method: string, path: string, body?: unknown) {
  const token = await getZohoAccessToken(); // OAuth refresh flow
  const res = await fetch(`${process.env.ZOHO_API_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function getZohoAccessToken(): Promise<string> {
  // Refresh token flow using ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
  const res = await fetch('https://accounts.zoho.eu/oauth/v2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
      client_id: process.env.ZOHO_CLIENT_ID!,
      client_secret: process.env.ZOHO_CLIENT_SECRET!,
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json();
  return data.access_token;
}
```

### 4.7 Local Scoring (Phase 1 — Simple Word Similarity)

**File: `lib/scoring.ts`**

```typescript
// Phase 1: Simple word similarity scoring (runs in portal, not Braudit).
// This is replaced by Braudit's API in Phase 2+ but is sufficient for Quick Search.

import { type TemmyTrademark } from '@/lib/temmy';

export interface SearchResult {
  applicationNumber: string;
  markText: string;
  status: string;
  classes: number[];
  owner: string;
  filingDate: string;
  expiryDate: string;
  wordScore: number;       // 0-100
  riskLevel: RiskLevel;
}

export type RiskLevel = 'high' | 'medium' | 'low';

export interface RiskSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  overallRisk: RiskLevel;
}

export function scoreQuickSearchResults(
  trademarks: TemmyTrademark[],
  searchWord: string
): SearchResult[] {
  return trademarks
    .map((tm) => {
      const wordScore = computeWordSimilarity(tm.markText, searchWord);
      return {
        applicationNumber: tm.applicationNumber,
        markText: tm.markText,
        status: tm.status,
        classes: tm.niceClasses,
        owner: tm.ownerName,
        filingDate: tm.filingDate,
        expiryDate: tm.expiryDate,
        wordScore,
        riskLevel: classifyRisk(wordScore),
      };
    })
    .sort((a, b) => b.wordScore - a.wordScore); // highest risk first
}

function computeWordSimilarity(markText: string, searchWord: string): number {
  const a = markText.toLowerCase().trim();
  const b = searchWord.toLowerCase().trim();
  
  // Exact match
  if (a === b) return 100;
  
  // Contains
  if (a.includes(b) || b.includes(a)) return 85;
  
  // Levenshtein-based similarity
  const distance = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  const similarity = Math.round((1 - distance / maxLen) * 100);
  
  return Math.max(0, Math.min(100, similarity));
}

function classifyRisk(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b[i - 1] === a[j - 1]
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }
  return matrix[b.length][a.length];
}

export function computeSummary(results: SearchResult[]): RiskSummary {
  const high = results.filter((r) => r.riskLevel === 'high').length;
  const medium = results.filter((r) => r.riskLevel === 'medium').length;
  const low = results.filter((r) => r.riskLevel === 'low').length;
  const overallRisk: RiskLevel = high > 0 ? 'high' : medium > 0 ? 'medium' : 'low';
  return { total: results.length, high, medium, low, overallRisk };
}
```

### 4.8 Navigation Update

Add search to the marketing header and dashboard header:

**Marketing header:** Add "Free Trademark Search" link → `/search/quick`  
**Dashboard header tabs:** Portfolio | Watchlist | **Search** (new)

### 4.9 Landing Page Update

Add Quick Search widget to the landing page hero section:
- Embed `<QuickSearchForm embedded />` below the hero headline.
- On submit (unauthenticated) → show results inline → gate with registration modal for further action.

---

## 5. Phase 2 — Free Advanced Search + Class Helpers

**Goal:** Multi-type search (word + image + tagline + combination) with intelligent class selection helpers.

**ETA:** 1–2 weeks.

### 5.1 New Routes

| Route | Type | Purpose |
|-------|------|---------|
| `(search)/advanced/page.tsx` | Page | Advanced Search form (requires account) |
| `api/search/advanced/route.ts` | API | Execute multi-type search |
| `api/search/class-suggest/route.ts` | API | AI-powered class suggestion |

### 5.2 Advanced Search Form

**Component: `components/search/advanced-search-form.tsx`**

Four search type sections, each independently toggleable:

1. **Word Mark** — text input (same as quick search)
2. **Logo** — image upload (react-dropzone, max 2 files, jpg/png/webp, max 5MB each)
3. **Tagline** — text input for slogans
4. **Combination** — word + image together

**Component: `components/search/class-selector.tsx`**

Multi-select for Nice classes (1–45) with:
- Searchable dropdown
- Class number + header description displayed
- Three helper tabs for assisted selection

**Component: `components/search/class-helper-sic.tsx`**

- Input: SIC code (validated format)
- Action: `POST /api/search/class-suggest` with `{ method: 'sic', value: sicCode }`
- Output: Suggested classes with confidence scores, user selects

**Component: `components/search/class-helper-description.tsx`**

- Input: Free-text business description
- Action: `POST /api/search/class-suggest` with `{ method: 'description', value: text }`
- Output: AI-suggested classes

**Component: `components/search/class-helper-website.tsx`**

- Input: Domain URL
- Action: `POST /api/search/class-suggest` with `{ method: 'website', value: url }`
- Output: AI-suggested classes based on site content

### 5.3 Class Suggestion API

**File: `app/api/search/class-suggest/route.ts`**

This endpoint either calls Braudit's class suggestion API (when available) or falls back to a local mapping:

```typescript
// POST /api/search/class-suggest
// Body: { method: 'sic' | 'description' | 'website', value: string }
// Response: { suggestions: { classNumber: number, className: string, confidence: number }[] }

// Phase 2 implementation:
// - 'sic': local SIC → Nice class mapping table (deterministic)
// - 'description': call Braudit API or OpenAI for classification
// - 'website': fetch site → extract text → same as description
```

### 5.4 Image Upload Component

**Component: `components/search/image-upload.tsx`**

```typescript
interface ImageUploadProps {
  maxFiles?: number;       // default 2
  maxSizeMB?: number;      // default 5
  onUpload: (files: UploadedFile[]) => void;
}

interface UploadedFile {
  id: string;
  name: string;
  preview: string;         // object URL for preview
  base64: string;          // for API submission
  mimeType: string;
}
```

Uses `react-dropzone`. Validates file type and size client-side. Converts to base64 for API submission.

---

## 6. Phase 3 — Brand Audit Order + Payment + Report Delivery

**Goal:** Users can order a comprehensive Brand Audit, pay via Stripe, track progress, and view the completed report in the portal.

**ETA:** 2–3 weeks.

### 6.1 New Routes

| Route | Type | Purpose |
|-------|------|---------|
| `(audit)/order/page.tsx` | Page | Brand Audit order form |
| `(audit)/order/[id]/page.tsx` | Page | Audit status tracking |
| `(audit)/reports/page.tsx` | Page | List of user's reports |
| `(audit)/reports/[id]/page.tsx` | Page | Report viewer (PDF/Excel preview + download) |
| `api/audit/create/route.ts` | API | Create audit order + Zoho deal |
| `api/audit/[id]/status/route.ts` | API | Check audit status (polls Braudit) |
| `api/audit/[id]/report/route.ts` | API | Proxy report download from Braudit |
| `api/stripe/checkout/route.ts` | API | Create Stripe Checkout session |
| `api/stripe/webhook/route.ts` | API | Handle Stripe payment confirmation |

### 6.2 Brand Audit Order Form

**Component: `components/audit/audit-order-form.tsx`**

Multi-section form:

**Section 1 — Search Terms:** Up to 5 terms, each with match type dropdown (exact/similar/starts-with). Pre-populated from prior searches if available.

**Section 2 — Logo Upload:** Same image-upload component, max 2 files.

**Section 3 — Classification:** Vienna classes (auto-detected from images) + Nice classes (using class-selector from Phase 2).

**Section 4 — SIC Codes:** Multi-select dropdown.

**Section 5 — Geographic & Data Layers:**

**Component: `components/audit/geo-layer-selector.tsx`**

```typescript
interface GeoLayerSelection {
  trademarkCountries: string[];      // ['GB', 'EU', 'ALL']
  companiesHouseCountries: string[]; // ['GB', 'ALL']
  domains: { countries: string[]; searchAll: boolean };
  google: { countries: string[] };
  socialMedia: { platforms: string[]; countries: string[] };
  marketplaces: { platforms: string[]; countries: string[] };
}

// Available platforms:
const SOCIAL_PLATFORMS = ['Facebook', 'Instagram', 'LinkedIn', 'X', 'TikTok'];
const MARKETPLACE_PLATFORMS = ['Amazon', 'eBay', 'Etsy', 'Temu', 'TikTok Shop', 'Alibaba'];
```

### 6.3 Stripe Integration

**File: `lib/stripe.ts`**

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export function getAuditPrice(userType: string): number {
  switch (userType) {
    case 'STAFF': return 0;
    case 'REPRESENTATIVE': return 5900;  // £59.00 in pence
    default: return 9900;                 // £99.00 in pence
  }
}
```

**File: `app/api/stripe/checkout/route.ts`**

```typescript
export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  const { auditOrderId } = await req.json();
  
  const order = await prisma.auditOrder.findUnique({ where: { id: auditOrderId } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const price = getAuditPrice(user!.userType);
  
  if (price === 0) {
    // Staff — skip payment, mark as paid
    await prisma.auditOrder.update({
      where: { id: auditOrderId },
      data: { status: 'PAID', paymentAmount: 0 },
    });
    return NextResponse.json({ free: true, redirectUrl: `/audit/order/${auditOrderId}` });
  }
  
  const checkoutSession = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'gbp',
        product_data: { name: 'Brand Audit Report' },
        unit_amount: price,
      },
      quantity: 1,
    }],
    metadata: { auditOrderId, userId: session.user.id },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/audit/order/${auditOrderId}?payment=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/audit/order/${auditOrderId}?payment=cancelled`,
  });
  
  await prisma.auditOrder.update({
    where: { id: auditOrderId },
    data: { stripeSessionId: checkoutSession.id },
  });
  
  return NextResponse.json({ url: checkoutSession.url });
}
```

**File: `app/api/stripe/webhook/route.ts`**

```typescript
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { auditOrderId } = session.metadata!;
    
    await prisma.auditOrder.update({
      where: { id: auditOrderId },
      data: {
        status: 'PAID',
        stripePaymentId: session.payment_intent as string,
        paymentAmount: (session.amount_total || 0) / 100,
      },
    });
    
    // Update Zoho deal status
    const order = await prisma.auditOrder.findUnique({ where: { id: auditOrderId } });
    if (order?.zohoDealId) {
      await zohoClient.updateDealStatus(order.zohoDealId, 'Closed Won');
    }
    
    // Trigger audit in Braudit (fire-and-forget)
    await brauditClient.triggerAudit(auditOrderId, order!.searchCriteria);
  }
  
  return NextResponse.json({ received: true });
}
```

### 6.4 Braudit API Client (Mocked)

**File: `lib/braudit.ts`**

```typescript
// Braudit API client. Currently returns mock responses.
// Replace with real API calls when Suntec delivers endpoints.

const MOCK_MODE = !process.env.BRAUDIT_API_URL;

export const brauditClient = {
  async triggerAudit(orderId: string, criteria: unknown): Promise<{ brauditOrderId: string }> {
    if (MOCK_MODE) {
      console.log(`[MOCK] Braudit audit triggered for order ${orderId}`);
      return { brauditOrderId: `mock-braudit-${orderId}` };
    }
    
    const res = await fetch(`${process.env.BRAUDIT_API_URL}/api/audit/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.BRAUDIT_API_KEY}`,
      },
      body: JSON.stringify({ portalOrderId: orderId, criteria }),
    });
    return res.json();
  },
  
  async getAuditStatus(brauditOrderId: string): Promise<{ status: string; progress: number }> {
    if (MOCK_MODE) {
      return { status: 'in_progress', progress: 65 };
    }
    const res = await fetch(`${process.env.BRAUDIT_API_URL}/api/audit/${brauditOrderId}/status`, {
      headers: { 'Authorization': `Bearer ${process.env.BRAUDIT_API_KEY}` },
    });
    return res.json();
  },
  
  async getAuditReport(brauditOrderId: string): Promise<{ url: string; format: string } | null> {
    if (MOCK_MODE) {
      return null; // No report in mock mode
    }
    const res = await fetch(`${process.env.BRAUDIT_API_URL}/api/audit/${brauditOrderId}/report`, {
      headers: { 'Authorization': `Bearer ${process.env.BRAUDIT_API_KEY}` },
    });
    if (res.status === 404) return null;
    return res.json();
  },
};
```

### 6.5 Report Viewer

**Component: `components/audit/report-viewer.tsx`**

- Displays report metadata (date, type, summary stats)
- Download button (Excel/PDF)
- If PDF: embedded viewer using `<iframe>` or PDF.js
- If Excel: summary table with key findings (parsed server-side)
- Risk breakdown chart (shadcn/ui charts or recharts)

### 6.6 Audit Status Tracker

**Component: `components/audit/audit-status-tracker.tsx`**

Visual progress indicator showing:
1. ✅ Order Placed
2. ✅ Payment Confirmed
3. 🔄 Searches Running (with progress %)
4. ⏳ Staff Review
5. ⏳ Report Published

Polls `GET /api/audit/[id]/status` every 30 seconds when on the status page.

---

## 7. API Layer — Contracts & Mock Strategy

### 7.1 Mock Strategy

All Braudit-dependent endpoints use `MOCK_MODE` flag:
- If `BRAUDIT_API_URL` env var is not set → return mock responses
- If set → call real Braudit API

This means the portal can be fully developed and demo'd without waiting for Suntec.

### 7.2 Temmy API — Real, Available Now

The Temmy API is operational. The portal calls it directly for:
- Trademark search by word/classes
- Trademark lookup by Client ID
- Trademark lookup by application number

No mocking needed. Wire directly in Phase 1.

### 7.3 Zoho CRM — Real, Available Now

Zoho CRM API is operational. Requires OAuth refresh token flow. Portal pushes events only — never reads bulk data. Can be wired in Phase 1 alongside search.

---

## 8. Data Types & Shared Models

**File: `lib/types.ts`** — Extend existing types:

```typescript
// ─── Existing (keep as-is) ───
export type TrademarkStatus = 'registered' | 'pending' | 'examination' | 'published' | 'renewal_due' | 'expired' | 'refused';

// ─── Search (new) ───
export type RiskLevel = 'high' | 'medium' | 'low';

export interface SearchResult {
  applicationNumber: string;
  markText: string;
  status: string;
  classes: number[];
  owner: string;
  filingDate: string;
  expiryDate: string;
  wordScore: number;
  riskLevel: RiskLevel;
}

export interface RiskSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
  overallRisk: RiskLevel;
}

export interface ClassSuggestion {
  classNumber: number;
  className: string;
  confidence: number;
}

// ─── Audit (new) ───
export interface AuditOrderSummary {
  id: string;
  status: AuditStatus;
  searchTerms: string[];
  createdAt: string;
  completedAt?: string;
  paymentAmount?: number;
  reportAvailable: boolean;
}

export type AuditStatus = 'awaiting_payment' | 'paid' | 'in_progress' | 'completed' | 'cancelled';
```

---

## 9. Component Inventory

### 9.1 Existing Components (Keep / Evolve)

| Component | Path | Phase 0 Change |
|-----------|------|----------------|
| Button, Input, Card, Table, Badge, etc. | `components/ui/` | No change |
| marketing-header | `components/layouts/` | Add "Free Search" nav link |
| dashboard-header | `components/layouts/` | Add "Search" tab, real user data, working logout |
| auth-card | `components/layouts/` | No change |
| trademark-table | `components/trademark/` | Wire to real data instead of mock |
| trademark-status-badge | `components/trademark/` | No change |
| company-table | `components/company/` | Wire to real data |
| renewal-wizard (all steps) | `components/renewal/` | Wire step-payment to real Stripe |
| page-header, empty-state, etc. | `components/common/` | No change |

### 9.2 New Components (Build)

| Component | Path | Phase |
|-----------|------|-------|
| otp-input | `components/auth/` | 0 |
| login-form (real) | `components/auth/` | 0 |
| register-form (real) | `components/auth/` | 0 |
| session-provider | `components/auth/` | 0 |
| quick-search-form | `components/search/` | 1 |
| search-results-table | `components/search/` | 1 |
| risk-score-badge | `components/search/` | 1 |
| risk-summary-card | `components/search/` | 1 |
| marketing-cta | `components/search/` | 1 |
| advanced-search-form | `components/search/` | 2 |
| class-selector | `components/search/` | 2 |
| class-helper-sic | `components/search/` | 2 |
| class-helper-description | `components/search/` | 2 |
| class-helper-website | `components/search/` | 2 |
| image-upload | `components/search/` | 2 |
| audit-order-form | `components/audit/` | 3 |
| audit-status-tracker | `components/audit/` | 3 |
| report-viewer | `components/audit/` | 3 |
| report-list | `components/audit/` | 3 |
| geo-layer-selector | `components/audit/` | 3 |
| stripe-checkout-button | `components/payment/` | 3 |
| payment-summary | `components/payment/` | 3 |
| payment-success | `components/payment/` | 3 |

---

## 10. Environment & Deployment

### 10.1 Environment Variables

```env
# ─── Database ───
DATABASE_URL=postgresql://...@...neon.tech/tmh_portal?sslmode=require
DIRECT_URL=postgresql://...@...neon.tech/tmh_portal?sslmode=require

# ─── Auth ───
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://tmh-portal.vercel.app

# ─── Temmy API ───
TEMMY_API_URL=https://api.temmy.io    # (actual URL TBC)
TEMMY_API_KEY=<api-key>

# ─── Zoho CRM ───
ZOHO_API_BASE=https://www.zohoapis.eu
ZOHO_CLIENT_ID=<client-id>
ZOHO_CLIENT_SECRET=<client-secret>
ZOHO_REFRESH_TOKEN=<refresh-token>

# ─── Stripe ───
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ─── Braudit (optional — mock mode if absent) ───
BRAUDIT_API_URL=                       # Leave empty for mock mode
BRAUDIT_API_KEY=

# ─── Email (Phase 1+) ───
RESEND_API_KEY=re_...

# ─── App ───
NEXT_PUBLIC_APP_URL=https://tmh-portal.vercel.app
DEV_MODE=false
```

### 10.2 Vercel Configuration

- **Build command:** `npx prisma generate && next build`
- **Framework preset:** Next.js
- **Node.js version:** 20.x
- **Regions:** `lhr1` (London — closest to UK users)
- **Environment variables:** Set all above in Vercel dashboard (Production + Preview)

### 10.3 Neon Database

- Create project in Neon Console
- Use `main` branch for production
- Create preview branches for Vercel Preview deployments (Neon + Vercel integration)
- Run `npx prisma db push` for initial schema
- Run `npx prisma db seed` for seed data

---

## 11. Acceptance Criteria Per Phase

### Phase 0 — Production Scaffolding

- [ ] `npm run build` passes with zero errors
- [ ] User can register with email → receives OTP → verifies → lands on `/welcome`
- [ ] User can login with email + OTP → lands on `/portfolio`
- [ ] Unauthenticated access to `/portfolio` redirects to `/login`
- [ ] Authenticated access to `/login` redirects to `/portfolio`
- [ ] Dashboard header shows real user name
- [ ] Logout works (clears session, redirects to `/`)
- [ ] Database tables created in Neon
- [ ] Deployed on Vercel with all env vars

### Phase 1 — Free Quick Search

- [ ] Quick Search form accessible at `/search/quick` (public)
- [ ] Search widget embedded on landing page hero
- [ ] Submit search → calls Temmy API → returns scored results
- [ ] Results displayed in risk-scored order with badges
- [ ] Risk summary card with dynamic marketing message
- [ ] CTA buttons present: "Request Brand Audit", "Apply for Trademark"
- [ ] First search works without account
- [ ] Second search requires registration
- [ ] Every search pushes lead data to Zoho CRM
- [ ] Search history persisted for authenticated users
- [ ] `/search/history` shows past searches

### Phase 2 — Advanced Search

- [ ] Advanced Search form at `/search/advanced` (requires auth)
- [ ] Four search types (word, logo, tagline, combination) independently toggleable
- [ ] Image upload works (drag & drop, max 2 files, preview)
- [ ] Class selector with searchable dropdown (45 classes)
- [ ] SIC code helper → suggests classes
- [ ] Business description helper → suggests classes
- [ ] Website domain helper → suggests classes
- [ ] Parallel search execution with loading states
- [ ] Results displayed per search type

### Phase 3 — Brand Audit + Payment

- [ ] Audit order form at `/audit/order` with all sections
- [ ] Pre-population from prior searches
- [ ] On submit → Zoho deal created (status: Awaiting Payment)
- [ ] Stripe Checkout redirect → payment → webhook confirmation
- [ ] Staff users skip payment (free)
- [ ] Post-payment → audit triggered in Braudit (or mock)
- [ ] Status tracking page with progress indicator
- [ ] Email notification on completion
- [ ] Report viewer with download option
- [ ] `/audit/reports` lists all user's reports
