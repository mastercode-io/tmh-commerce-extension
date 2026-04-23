# TMH Commerce Extension — Concrete First-Pass Route / Component Audit

## Status
Working audit draft based on the current public repo structure and the narrowed TMH commerce scope.

## Basis

This first-pass audit is based on the currently visible repo structure:

### Confirmed top-level folders
- `app`
- `components`
- `docs`
- `lib`
- `public`

### Confirmed `app/` route groups
- `(auth)`
- `(dashboard)`
- `(marketing)`
- `(onboarding)`
- `(standalone)/settings`
- `(subscribe)`
- `api`

### Confirmed docs currently present
- `TMH_Commerce_Extension_Production_Scope_v1.md`
- `monitoring-subscription-crm-api-spec.md`
- `monitoring-subscription-implementation-plan.md`
- `monitoring-subscription-prd.md`
- `monitoring-subscription-user-stories.md`
- `poc-phase1-implemenation-plan.md`
- `subscription_v1_plan.md`
- `subscription_v1_todo_checklist.md`
- `tmh_implementation_spec.md`
- `tmh_portal_data_model.md`
- `tmh_portal_dev_spec.md`
- `tmh_portal_flow_diagrams.md`
- `tmh_portal_user_stories.md`

This audit translates that structure into concrete keep/archive/rename recommendations for the current production phase.

---

## 1. Route-group audit

| Current route group | Likely current role | Decision | Priority | Recommendation |
|---|---|---:|---:|---|
| `app/(marketing)` | TMH website-linked commercial entry flows | **Keep** | P1 | Retain as main acquisition continuation surface for subscriptions, preferences, and service-request entry |
| `app/(subscribe)` | Subscription funnel / checkout flow | **Keep** | P1 | Make this the primary production path; wire fully to payment + Zoho |
| `app/(dashboard)` | General logged-in area, likely mixed account/portal intent | **Rename / narrow** | P1 | Re-scope into commercial **Account** area only |
| `app/(auth)` | Authentication flows | **Keep** | P1 | Retain, but align copy/redirects to TMH Commerce Extension role |
| `app/(onboarding)` | Mixed onboarding flow, may contain portal-era logic | **Rename / narrow** | P2 | Keep only onboarding relevant to account creation / commercial setup; archive operational onboarding ideas |
| `app/(standalone)/settings` | Preferences/settings flow | **Keep** | P1 | Keep, especially for email preferences / profiling / compliance flow |
| `app/api` | Backend routes/server integration endpoints | **Keep** | P1 | Keep; centralize commercial endpoints and adapter contracts here |
| Any hidden or future workspace routes under dashboard | Likely POC portal/workspace concepts | **Archive / remove from nav** | P1 | Preserve as future Temmy reference only |

---

## 2. Recommended route target model

This is the route structure the current repo should converge toward.

### A. Marketing / entry
Suggested route family:
- `/`
- `/subscribe/monitoring`
- `/preferences`
- `/renewal`
- `/audit`
- `/application`
- `/support` or `/contact`

### B. Transactional order / checkout
Suggested route family:
- `/orders/[orderId]`
- `/orders/[orderId]/confirmation`

### C. Account
Suggested route family:
- `/account`
- `/account/orders`
- `/account/payments`
- `/account/subscriptions`
- `/account/preferences`
- `/account/profile`
- `/account/services`

### D. Auth
Suggested route family:
- `/login`
- `/verify`
- `/logout`
- `/forgot-password` or equivalent if needed

### E. API / server routes
Suggested grouping:
- `/api/zoho/*`
- `/api/subscriptions/*`
- `/api/payments/*`
- `/api/preferences/*`
- `/api/renewals/*`
- `/api/audit/*`
- `/api/account/*`

### Recommendation
Do not expose top-level routes like:
- `/portfolio`
- `/reports`
- `/results`
- `/alerts`
- `/monitoring`
- `/workspace`

in the current production phase.

Do not use generic request-centric customer-facing URLs when a clearer service or commerce noun is available.

---

## 3. Concrete route decisions

## 3.1 `app/(marketing)`
### Decision
**Keep**

### Why
This is consistent with the current scope:
- commercial continuation from TMH website
- campaign / landing page flow support
- subscription and preference entry points

### Action
- audit all pages under this group
- keep only commerce-relevant pages in active navigation
- move operational portal concepts out of this route group if present

---

## 3.2 `app/(subscribe)`
### Decision
**Keep and prioritize**

### Why
Subscription is the main production goal.

### Action
Turn this into the cleanest production-quality route group:
- product/package selection
- checkout handoff
- success/failure/pending
- CRM sync confirmation
- account reflection

### Notes
This is P1 and should drive the entire repo refocus.

---

## 3.3 `app/(dashboard)`
### Decision
**Rename or narrow**

### Why
“Dashboard” is vague and likely inherited from portal/workspace thinking.

### Recommendation
Refocus this into:
- `/account`
- or a route group conceptually meaning **Account**

User-facing naming under this area should prefer:
- Account
- Orders
- Payments
- Subscriptions
- Preferences
- Services

### Action
Audit all pages/components under this group:
- keep commercial/account visibility screens
- archive operational workspace screens
- remove non-scope navigation items

---

## 3.4 `app/(auth)`
### Decision
**Keep**

### Why
Authentication is still needed for:
- subscriptions
- account pages
- preferences
- requests

### Action
- ensure post-login routes go to commerce/account areas, not future workspace assumptions
- align copy to TMH Commerce Extension

---

## 3.5 `app/(onboarding)`
### Decision
**Narrow significantly**

### Why
This group may contain both:
- useful customer-account onboarding
- old portal-era service/workspace onboarding assumptions

### Keep only
- account creation
- identity verification
- minimal customer-commercial setup

### Archive
- Brand Portfolio / Trademark / portal-workspace onboarding ideas

---

## 3.6 `app/(standalone)/settings`
### Decision
**Keep**

### Why
The public repo README explicitly references a CRM-calling notification settings page and debug mode for that flow.

### Action
Treat this as part of the active commercial scope:
- email preferences
- profiling/compliance preferences
- CRM-backed settings sync

This is a strong fit for the narrowed scope.

---

## 3.7 `app/api`
### Decision
**Keep and strengthen**

### Why
This should become the integration spine for:
- Zoho writes
- payment callbacks
- subscription state updates
- request creation
- preference sync

### Action
Group endpoints by commercial concern instead of by generic portal semantics.

Suggested logical buckets:
- `api/zoho`
- `api/subscriptions`
- `api/payments`
- `api/preferences`
- `api/requests`

---

## 4. Component audit — recommended buckets

The public repo exposes a shared `components/` folder, but not the internal file list from the HTML view. So this section is a recommended concrete first-pass bucket audit.

## 4.1 Keep / create active buckets
- `components/ui/`
- `components/layout/`
- `components/account/`
- `components/subscriptions/`
- `components/orders/`
- `components/payments/`
- `components/preferences/`
- `components/requests/`
- `components/auth/`

### Why
These match the actual narrowed product role.

---

## 4.2 De-emphasize / archive if present
- `components/portfolio/`
- `components/reports/`
- `components/results/`
- `components/alerts/`
- `components/monitoring/`
- `components/workspace/`
- `components/brand-portfolio/`

### Why
These belong to future Temmy/Braudit work, not the current TMH commerce phase.

### Action
Do not delete immediately. Move to archive or clearly mark as future reference if they already exist.

---

## 4.3 Rename vague buckets if present
If you find folders like:
- `components/portal/`
- `components/dashboard/`

consider splitting them into:
- `components/account/`
- `components/layout/`
- `components/subscriptions/`
- `components/orders/`
- `components/preferences/`

This will reduce conceptual drift.

---

## 5. Docs audit — concrete first pass

## 5.1 Keep active
These should remain active because they fit the current commercial scope.

| Doc | Decision | Why |
|---|---|---|
| `TMH_Commerce_Extension_Production_Scope_v1.md` | Keep | Current governing scope note |
| `subscription_v1_plan.md` | Keep | Directly aligned to current priority |
| `subscription_v1_todo_checklist.md` | Keep | Execution-oriented |
| `monitoring-subscription-crm-api-spec.md` | Keep, but review terminology | Likely still relevant because subscription CRM flow is current work |
| `monitoring-subscription-implementation-plan.md` | Keep, but review terminology | Likely useful for current commercial subscription flow |
| `monitoring-subscription-prd.md` | Keep, but narrow | Keep only commercial/account/subscription scope |
| `monitoring-subscription-user-stories.md` | Keep, but narrow | Useful if still commerce-focused |
| `tmh_implementation_spec.md` | Keep | Likely TMH-specific implementation guidance |

## 5.2 Archive as future Temmy reference
These should be moved under an archive/future-temmy section.

| Doc | Decision | Why |
|---|---|---|
| `tmh_portal_data_model.md` | Archive | Future Temmy/portal reference |
| `tmh_portal_dev_spec.md` | Archive | Portal-era broader scope |
| `tmh_portal_flow_diagrams.md` | Archive | Portal/workspace future reference |
| `tmh_portal_user_stories.md` | Archive | Future Temmy workspace input |
| `poc-phase1-implemenation-plan.md` | Archive | Proof-of-concept legacy baseline |

### Important note
Archive does **not** mean discard. These docs remain valuable when Temmy workspace work resumes.

---

## 6. `lib/` audit recommendation

The public HTML view confirms a `lib/` folder but not its substructure.

### First-pass rule
Audit everything in `lib/` and classify as:
- commercial utility
- TMH-specific integration
- future portal/workspace artifact
- generic shared utility

### Desired target split
- `lib/zoho/`
- `lib/payments/`
- `lib/account/`
- `lib/requests/`
- `lib/utils/`

### Specific focus
Anything currently mixing:
- CRM logic
- subscription logic
- route logic
- UI concerns

should be split.

---

## 7. Concrete keep/archive/rename checklist

Use this immediately while reviewing files:

### Keep
Use for:
- active commerce/account flows
- auth
- preferences
- subscriptions
- orders
- payments
- requests
- Zoho integration
- payment integration

### Archive
Use for:
- future workspace concepts
- portfolio/results/reports/alerts
- broad portal data model ideas
- mock-data POC pages

### Rename
Use when the functionality stays but the name implies the wrong product role.

Typical examples:
- `dashboard` → `account`
- `portal` → `account` or `archive-temmy-reference`
- `settings` → `preferences` where user-facing meaning is that specific

### Remove from nav
Use when a page can remain in code temporarily but should not shape the current product experience.

---

## 8. Suggested immediate concrete actions

1. Add scope note to README
2. Create `docs/archive-temmy-poc/`
3. Move:
   - `tmh_portal_data_model.md`
   - `tmh_portal_dev_spec.md`
   - `tmh_portal_flow_diagrams.md`
   - `tmh_portal_user_stories.md`
   - `poc-phase1-implemenation-plan.md`
   into archive/future-reference
4. Rename or reframe `(dashboard)` as commercial **Account**
5. Audit `(onboarding)` and keep only account-setup behavior
6. Treat `(standalone)/settings` as active **Preferences**
7. Centralize Zoho calls into a clear adapter layer
8. Remove any workspace-era nav items from active UI
9. Make subscription path the dominant active route group

---

## 9. Working audit table template

Fill this file-level as you inspect the repo.

| Current path | Type | Current role | Decision | Priority | Notes / target |
|---|---|---|---|---|---|
| `app/(marketing)/...` | Route | Commercial entry | Keep | P1 | Keep only active commerce flows |
| `app/(subscribe)/...` | Route | Subscription flow | Keep | P1 | Main production path |
| `app/(dashboard)/...` | Route | Mixed account/portal | Rename/Narrow | P1 | Move to Account-only role |
| `app/(onboarding)/...` | Route | Mixed onboarding | Narrow | P2 | Keep only account/commercial setup |
| `app/(standalone)/settings/...` | Route | Preferences/settings | Keep | P1 | Active email preferences/profile flow |
| `app/api/...` | API | Server integration | Keep | P1 | Group by commercial concern |
| `docs/tmh_portal_*.md` | Docs | Future portal reference | Archive | P2 | Preserve for future Temmy work |
| `docs/subscription_v1_*.md` | Docs | Current implementation | Keep | P1 | Active delivery docs |
| `components/portal/*` | Component | Legacy portal | Archive/Rename | P2 | Future Temmy reference or split |
| `components/dashboard/*` | Component | Mixed | Rename | P1 | Move into account/layout/etc |
| `lib/*` | Utility | Mixed | Audit | P1 | Separate Zoho/payment/account utils |

---

## 10. Locked first-pass conclusion

Based on the visible repo structure, the most concrete immediate changes are:

- keep `(marketing)`, `(subscribe)`, `(auth)`, `(standalone)/settings`, and `api`
- narrow `(onboarding)`
- rename or refocus `(dashboard)` into a commercial **Account** area
- archive `tmh_portal_*` docs and POC docs as future Temmy reference
- treat subscription, orders, payments, preferences, and requests as the only active product drivers for now

This is the cleanest first-pass route/component interpretation of the repo under the narrowed TMH commerce scope.
