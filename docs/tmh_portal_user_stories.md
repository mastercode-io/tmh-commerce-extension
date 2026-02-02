# Temmy Portal - User Stories

## Document Info
- **Version:** 1.0 Draft
- **Date:** January 2026
- **Status:** Initial Requirements

---

## Personas

| Persona | Description | Key Needs |
|---------|-------------|-----------|
| **Sarah** (Individual Owner) | Small business owner, first-time user | Simple setup, clear dashboard, peace of mind |
| **Alex** (Power User) | Multi-jurisdiction entrepreneur | Global consolidation, strategic oversight |
| **Maria** (Professional) | Accountant/advisor managing multiple clients | Client separation, team delegation, scalability |
| **David** (Assistant) | EA with delegated responsibility | Limited access, clear tasks, audit trail |

---

## Epic 1: User Onboarding & Account Setup

### US-1.1: Account Registration
> **As a** new user  
> **I want to** create an account with just my name, email, and password  
> **So that** I can start using the portal quickly

**Acceptance Criteria:**
- [ ] Registration form contains only: name, email, password, confirm password
- [ ] Email verification sent immediately
- [ ] User redirected to welcome flow after email verification
- [ ] Password strength indicator shown
- [ ] Duplicate email prevented with clear error message

**Priority:** MVP  
**Estimate:** S

---

### US-1.2: Automatic Asset Discovery
> **As a** new user  
> **I want to** enter my official identifiers (IPO Client ID, Companies House Person ID)  
> **So that** the system automatically populates my portfolio with my UK trademarks and company appointments

**Acceptance Criteria:**
- [ ] Input field for IPO Client ID with format validation
- [ ] Input field for Companies House Person ID with format validation
- [ ] Support for adding multiple identifiers of each type
- [ ] Clear explanation text for each identifier type
- [ ] Loading indicator during discovery process
- [ ] Results displayed immediately upon completion
- [ ] Summary shown: "Found X trademarks and Y company appointments"
- [ ] Graceful handling if ID returns no results (not an error)
- [ ] Option to skip and add manually later

**Priority:** MVP  
**Estimate:** L

**Dependencies:**
- IPO API integration
- Companies House API integration

---

### US-1.3: Manual Asset Addition
> **As a** user  
> **I want to** manually add a trademark by its registration number and jurisdiction  
> **So that** I can include assets not linked to my identifiers

**Acceptance Criteria:**
- [ ] "Add Asset" button accessible from dashboard
- [ ] Modal/form with fields: Registration Number, Jurisdiction
- [ ] Jurisdiction dropdown includes: UK, US, EU, AU, DE (extensible)
- [ ] Registration number format validation per jurisdiction
- [ ] System attempts to fetch asset details from relevant registry
- [ ] If found: display details for confirmation
- [ ] If not found: allow manual entry with warning
- [ ] Choice to add to Portfolio or Watchlist (see US-1.4)

**Priority:** MVP  
**Estimate:** M

---

### US-1.4: Portfolio vs Watchlist Assignment
> **As a** user  
> **I want to** choose whether a manually-added asset goes into my Portfolio or Watchlist  
> **So that** I can distinguish between assets I own and assets I'm monitoring

**Acceptance Criteria:**
- [ ] Radio button or toggle: "Add to Portfolio" / "Add to Watchlist"
- [ ] Default selection: Portfolio
- [ ] Tooltip explaining the difference
- [ ] Asset can be moved between Portfolio and Watchlist later

**Priority:** MVP  
**Estimate:** S

---

## Epic 2: Portfolio Dashboard

### US-2.1: Portfolio Overview
> **As a** user  
> **I want to** see my assets grouped by status (Active, Action Required, In Progress, Inactive)  
> **So that** I can quickly understand what needs attention

**Acceptance Criteria:**
- [ ] Dashboard displays four sections in order:
  1. **Action Required** - renewals due, filings needed (highlighted)
  2. **In Progress** - live applications, pending renewals
  3. **Active & Healthy** - registered, no action needed
  4. **Inactive** - expired, withdrawn, refused
- [ ] "Action Required" section only visible when items exist
- [ ] Each section shows count badge
- [ ] Each asset row shows: Name/Number, Type, Status, Key Date, Action Button
- [ ] Sections collapsible
- [ ] Empty state for new users with CTA to add assets

**Priority:** MVP  
**Estimate:** M

---

### US-2.2: Watchlist View
> **As a** user  
> **I want to** switch to a Watchlist view showing only monitored assets  
> **So that** I can track competitors or partners separately from my own assets

**Acceptance Criteria:**
- [ ] Tab or toggle to switch: Portfolio | Watchlist
- [ ] Current view clearly indicated
- [ ] Watchlist uses same layout/groupings as Portfolio
- [ ] Watchlist items show owner name (if available) instead of "My Asset"
- [ ] Different visual treatment (e.g., muted colors, "watching" icon)

**Priority:** MVP  
**Estimate:** S

---

### US-2.3: Asset Detail View
> **As a** user  
> **I want to** click an asset to see its full details  
> **So that** I can review all information and history

**Acceptance Criteria:**
- [ ] Click asset row opens detail panel/page
- [ ] Shows: Full registration details, status history, upcoming dates, owner info
- [ ] Action buttons contextual to status
- [ ] Link to official registry record (if available)
- [ ] Option to move to/from Watchlist
- [ ] Option to remove from portfolio

**Priority:** MVP  
**Estimate:** M

---

### US-2.4: Global Asset Consolidation
> **As a** user with trademarks in multiple jurisdictions  
> **I want to** see all my global assets in one unified list  
> **So that** I don't need separate logins per country

**Acceptance Criteria:**
- [ ] All jurisdictions displayed in single list
- [ ] Jurisdiction flag/code shown per asset
- [ ] Filter by jurisdiction available
- [ ] Sort by jurisdiction available
- [ ] Consistent status terminology across jurisdictions

**Priority:** MVP  
**Estimate:** M (dependent on jurisdiction integrations)

---

## Epic 3: Renewals & Actions

### US-3.1: Initiate Renewal
> **As a** trademark owner  
> **I want to** click "Renew Now" and complete a pre-filled renewal form  
> **So that** I can renew quickly without re-entering data

**Acceptance Criteria:**
- [ ] "Renew Now" button visible on eligible assets
- [ ] Clicking opens guided renewal flow
- [ ] Form pre-populated with known data
- [ ] User can edit/confirm details
- [ ] Clear fee breakdown shown
- [ ] Secure payment integration (Stripe/similar)
- [ ] Confirmation screen before submission
- [ ] Status updates to "Renewal in Progress" upon payment
- [ ] Confirmation email sent
- [ ] Receipt available in portal

**Priority:** MVP  
**Estimate:** L

**Dependencies:**
- Payment provider integration
- IPO renewal API (or manual process trigger)

---

### US-3.2: Re-Apply for Expired Trademark
> **As a** user with an expired trademark  
> **I want to** see a "Re-Apply" option  
> **So that** I can easily start a new application for a lapsed mark

**Acceptance Criteria:**
- [ ] "Re-Apply" button on expired/inactive trademarks
- [ ] Opens new application flow with previous details pre-filled
- [ ] Clear indication this is a NEW application, not restoration
- [ ] Links to professional help if complex

**Priority:** Phase 2  
**Estimate:** M

---

### US-3.3: Request Professional Help
> **As a** user with a live application or complex situation  
> **I want to** click "Get Help" to request professional assistance  
> **So that** I can get expert support when needed

**Acceptance Criteria:**
- [ ] "Get Help" button on applications and complex statuses
- [ ] Opens contact form pre-filled with asset context
- [ ] Option to describe issue
- [ ] Routed to TMH team / professional network
- [ ] Confirmation of request received

**Priority:** MVP  
**Estimate:** S

---

## Epic 4: Notifications & Digests

### US-4.1: Weekly Email Digest
> **As a** user  
> **I want to** receive a single weekly email summarizing activity and deadlines  
> **So that** I stay informed without checking the portal daily

**Acceptance Criteria:**
- [ ] Single consolidated email per week
- [ ] Sections:
  - **Action Required** - items needing user action
  - **Status Changes** - updates since last digest
  - **Watchlist Updates** - changes to watched assets
  - **Upcoming** - deadlines in next 30/60/90 days
- [ ] Each item links directly to asset in portal
- [ ] "Nothing to report" message if no updates
- [ ] Sent on configurable day (default: Monday 9am user's timezone)
- [ ] Professional, clean email template

**Priority:** MVP  
**Estimate:** M

---

### US-4.2: Urgent Notifications
> **As a** user  
> **I want to** receive immediate notification for critical deadlines  
> **So that** I don't miss time-sensitive actions

**Acceptance Criteria:**
- [ ] Immediate email for deadlines within 30 days
- [ ] Immediate email for status changes requiring action
- [ ] Clear "Action Required" subject line
- [ ] One-click link to take action
- [ ] Configurable thresholds (30/14/7 days)

**Priority:** MVP  
**Estimate:** S

---

### US-4.3: Notification Preferences
> **As a** user  
> **I want to** configure my notification preferences  
> **So that** I receive the right amount of communication

**Acceptance Criteria:**
- [ ] Settings page for notifications
- [ ] Toggle: Weekly digest on/off
- [ ] Toggle: Urgent notifications on/off
- [ ] Select: Digest day preference
- [ ] Select: Urgency threshold (7/14/30 days)
- [ ] Option to unsubscribe from all (with warning)

**Priority:** Phase 2  
**Estimate:** S

---

## Epic 5: Multi-Organization Management (Professional Tier)

### US-5.1: Create Client Organization
> **As a** professional user  
> **I want to** create separate organizations for each client  
> **So that** their assets are logically separated and secure

**Acceptance Criteria:**
- [ ] "Add Client Organization" button on professional dashboard
- [ ] Form: Organization name, primary contact, identifiers
- [ ] Automatic asset discovery using client's identifiers
- [ ] Organization appears in client list
- [ ] Clear separation of data between organizations

**Priority:** Phase 2  
**Estimate:** M

---

### US-5.2: Client Overview Dashboard
> **As a** professional user  
> **I want to** see all my client organizations with summary badges  
> **So that** I can prioritize my workload across clients

**Acceptance Criteria:**
- [ ] List view of all client organizations
- [ ] Each row shows: Client name, asset count, pending actions count, next deadline
- [ ] Sort by: Name, deadline urgency, action count
- [ ] Filter by: Has actions, no actions
- [ ] Search by client name
- [ ] Color coding for urgency

**Priority:** Phase 2  
**Estimate:** M

---

### US-5.3: Client Portfolio Drill-Down
> **As a** professional user  
> **I want to** click a client to see their full portfolio  
> **So that** I can manage their assets in detail

**Acceptance Criteria:**
- [ ] Click client row opens their portfolio view
- [ ] View identical to individual user dashboard
- [ ] Breadcrumb showing: Clients > [Client Name]
- [ ] All actions available as if logged in as client
- [ ] Easy navigation back to client list

**Priority:** Phase 2  
**Estimate:** S

---

### US-5.4: Client Watchlist Management
> **As a** professional user  
> **I want to** add assets to a client's Watchlist  
> **So that** I can monitor competitors on their behalf

**Acceptance Criteria:**
- [ ] While in client context, "Add to Watchlist" adds to THAT client's watchlist
- [ ] Clear indication of which client's watchlist is being modified
- [ ] Client can see items added by professional (with attribution)

**Priority:** Phase 2  
**Estimate:** S

---

## Epic 6: Team & Role Management

### US-6.1: Invite Team Member
> **As an** account owner  
> **I want to** invite team members by email  
> **So that** they can access the portal under my organization

**Acceptance Criteria:**
- [ ] "Invite Team Member" button in settings
- [ ] Enter: Email, Name, Role
- [ ] Invitation email sent with signup link
- [ ] Pending invitations shown in team list
- [ ] Ability to resend or cancel invitation
- [ ] Invited user creates account linked to organization

**Priority:** Phase 2  
**Estimate:** M

---

### US-6.2: Assign User to Organizations
> **As an** account owner  
> **I want to** assign team members to specific client organizations  
> **So that** they only see the clients they're responsible for

**Acceptance Criteria:**
- [ ] Team member profile shows organization assignments
- [ ] Checkbox list of organizations to assign
- [ ] User only sees assigned organizations in their dashboard
- [ ] Changes take effect immediately
- [ ] Audit log of assignment changes

**Priority:** Phase 2  
**Estimate:** M

---

### US-6.3: Role-Based Permissions
> **As an** account owner  
> **I want to** assign roles to team members  
> **So that** their capabilities match their responsibilities

**Acceptance Criteria:**
- [ ] Roles available: Owner, Admin, User, Viewer
- [ ] Permission matrix:

| Capability | Owner | Admin | User | Viewer |
|------------|-------|-------|------|--------|
| View assigned assets | ✓ | ✓ | ✓ | ✓ |
| Take actions (renew, etc.) | ✓ | ✓ | ✓ | ✗ |
| Add/remove assets | ✓ | ✓ | ✗ | ✗ |
| Manage team | ✓ | ✗ | ✗ | ✗ |
| Billing & subscription | ✓ | ✗ | ✗ | ✗ |

- [ ] Role selected during invitation
- [ ] Role can be changed by Owner

**Priority:** Phase 2  
**Estimate:** M

---

## Epic 7: Delegated Access (Assistant Model)

### US-7.1: Invite with Pre-Assigned Assets
> **As an** asset owner  
> **I want to** invite an assistant and pre-select which assets they can see  
> **So that** they have immediate, scoped access

**Acceptance Criteria:**
- [ ] "Invite Assistant" option in team management
- [ ] Asset selection during invitation flow
- [ ] Invited user sees ONLY selected assets
- [ ] No "Add Identifiers" flow for invited assistants
- [ ] Clear "You've been invited by [Owner]" messaging

**Priority:** Phase 2  
**Estimate:** M

---

### US-7.2: Role-Appropriate Actions
> **As an** assistant  
> **I want to** see actions appropriate to my role  
> **So that** I can help without overstepping

**Acceptance Criteria:**
- [ ] Assistants see "Notify Owner" instead of "Pay Now" on renewals
- [ ] Assistants cannot make payments
- [ ] Assistants can view all details of assigned assets
- [ ] Assistants can add notes/comments
- [ ] Action buttons reflect actual permissions

**Priority:** Phase 2  
**Estimate:** M

---

### US-7.3: Notify Owner Action
> **As an** assistant  
> **I want to** send a notification to the owner about a pending action  
> **So that** I can complete my task and have it logged

**Acceptance Criteria:**
- [ ] "Notify Owner" button on relevant assets
- [ ] Pre-written notification template (editable)
- [ ] One-click send
- [ ] Notification logged in audit trail
- [ ] Owner receives email with context and link
- [ ] Status shown: "Owner notified on [date]"

**Priority:** Phase 2  
**Estimate:** S

---

### US-7.4: Assistant Notifications
> **As an** assistant  
> **I want to** receive notifications only for assets I'm responsible for  
> **So that** I can be proactive in my role

**Acceptance Criteria:**
- [ ] Assistant receives digest only for assigned assets
- [ ] Notifications reference owner context
- [ ] Clear indication of expected action
- [ ] No notifications for unassigned assets

**Priority:** Phase 2  
**Estimate:** S

---

## Epic 8: Audit & Activity Logging

### US-8.1: Action Audit Trail
> **As an** account owner  
> **I want to** see a log of all actions taken on my assets  
> **So that** I have accountability and can verify tasks

**Acceptance Criteria:**
- [ ] Audit log accessible from settings/admin
- [ ] Each entry shows: Timestamp, User, Action, Asset, Details
- [ ] Actions logged: View, Edit, Renew, Notify, Add, Remove, Payment
- [ ] Filter by: User, Date range, Action type, Asset
- [ ] Export to CSV
- [ ] Log entries immutable (cannot be edited/deleted)
- [ ] Retained for minimum 7 years

**Priority:** Phase 2  
**Estimate:** M

---

## Priority Summary

| Phase | Epic | Stories | Estimated Effort |
|-------|------|---------|------------------|
| **MVP** | 1. Onboarding | 4 | M |
| **MVP** | 2. Dashboard | 4 | L |
| **MVP** | 3. Actions | 3 | L |
| **MVP** | 4. Notifications | 3 | M |
| **Phase 2** | 5. Multi-Org | 4 | L |
| **Phase 2** | 6. Team Roles | 3 | L |
| **Phase 2** | 7. Delegation | 4 | M |
| **Phase 2** | 8. Audit | 1 | M |

---

## Open Questions

1. **Payment provider** - Stripe? GoCardless? Direct Debit support needed?
2. **Non-UK jurisdictions** - Which are priority? API availability?
3. **Offline/manual processes** - What happens when no API exists for an action?
4. **Pricing tiers** - What features are free vs. Professional?
5. **Data retention** - GDPR requirements, right to deletion vs. audit retention?
6. **Mobile** - Responsive web only, or native app planned?
