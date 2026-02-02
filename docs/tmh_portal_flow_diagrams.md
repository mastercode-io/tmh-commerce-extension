# Temmy Portal - Flow Diagrams

## Document Info
- **Version:** 1.0 Draft
- **Date:** January 2026
- **Format:** Mermaid.js (renders in GitHub, GitLab, VS Code, Obsidian)

---

## Epic 1: User Onboarding & Account Setup

### 1.1 Registration Flow

```mermaid
flowchart TD
    A[Landing Page] --> B[Click 'Create Free Portfolio']
    B --> C[Registration Form]
    C --> D{Valid Input?}
    D -->|No| E[Show Validation Errors]
    E --> C
    D -->|Yes| F[Create Account]
    F --> G[Send Verification Email]
    G --> H[Show 'Check Your Email' Screen]
    H --> I{User Clicks Email Link}
    I -->|Valid Token| J[Mark Email Verified]
    J --> K[Redirect to Welcome Flow]
    I -->|Expired Token| L[Show 'Link Expired']
    L --> M[Resend Verification]
    M --> G
```

### 1.2 Asset Discovery Flow

```mermaid
flowchart TD
    A[Welcome Screen] --> B[Enter Identifiers]
    B --> C{Add IPO Client ID?}
    C -->|Yes| D[Input IPO Client ID]
    D --> E[Validate Format]
    E --> C
    C -->|Done| F{Add CH Person ID?}
    F -->|Yes| G[Input CH Person ID]
    G --> H[Validate Format]
    H --> F
    F -->|Done| I[Click 'Discover My Assets']
    I --> J[Show Loading State]
    J --> K[Query IPO API]
    J --> L[Query CH API]
    K --> M{Results Found?}
    L --> M
    M -->|Yes| N[Display Found Assets]
    M -->|No Results| O[Show 'No Assets Found']
    N --> P[Confirm Import]
    O --> Q[Offer Manual Add]
    P --> R[Create Assets in DB]
    R --> S[Redirect to Dashboard]
    Q --> T[Manual Add Flow]
```

### 1.3 Manual Asset Addition Flow

```mermaid
flowchart TD
    A[Dashboard] --> B[Click 'Add Asset']
    B --> C[Open Add Asset Modal]
    C --> D[Select Jurisdiction]
    D --> E[Enter Registration Number]
    E --> F{Valid Format?}
    F -->|No| G[Show Format Error]
    G --> E
    F -->|Yes| H[Query Registry API]
    H --> I{Asset Found?}
    I -->|Yes| J[Display Asset Details]
    I -->|No| K[Show 'Not Found' Warning]
    K --> L{Add Anyway?}
    L -->|Yes| M[Manual Entry Form]
    L -->|No| C
    J --> N{Portfolio or Watchlist?}
    M --> N
    N -->|Portfolio| O[Add to Portfolio]
    N -->|Watchlist| P[Add to Watchlist]
    O --> Q[Save Asset]
    P --> Q
    Q --> R[Show Success]
    R --> S[Close Modal]
    S --> T[Refresh Dashboard]
```

---

## Epic 2: Portfolio Dashboard

### 2.1 Dashboard Load Flow

```mermaid
flowchart TD
    A[User Logs In] --> B[Load Dashboard]
    B --> C[Fetch User's Organizations]
    C --> D[Fetch Assets for Org]
    D --> E[Group by Status]
    E --> F{Any Action Required?}
    F -->|Yes| G[Show Action Required Section]
    F -->|No| H[Hide Action Required Section]
    G --> I[Show In Progress Section]
    H --> I
    I --> J[Show Active Section]
    J --> K[Show Inactive Section]
    K --> L[Calculate Counts/Badges]
    L --> M[Render Dashboard]
```

### 2.2 Portfolio/Watchlist Toggle

```mermaid
flowchart TD
    A[Dashboard Loaded] --> B{Current View?}
    B -->|Portfolio| C[Show Portfolio Tab Active]
    B -->|Watchlist| D[Show Watchlist Tab Active]
    C --> E[Display Owned Assets]
    D --> F[Display Watched Assets]
    E --> G{User Clicks Watchlist?}
    F --> H{User Clicks Portfolio?}
    G -->|Yes| I[Switch to Watchlist]
    H -->|Yes| J[Switch to Portfolio]
    I --> D
    J --> C
```

### 2.3 Asset Detail View

```mermaid
flowchart TD
    A[Dashboard] --> B[Click Asset Row]
    B --> C[Open Asset Detail Panel]
    C --> D[Load Full Asset Data]
    D --> E[Load Event History]
    E --> F[Display Details]
    F --> G{Available Actions?}
    G -->|Renewal Due| H[Show Renew Button]
    G -->|Application| I[Show Get Help Button]
    G -->|Expired| J[Show Re-Apply Button]
    G -->|No Action| K[Show Status Only]
    H --> L{User Action?}
    I --> L
    J --> L
    K --> M[User Closes Panel]
    L -->|Take Action| N[Trigger Action Flow]
    L -->|Close| M
    M --> O[Return to Dashboard]
```

---

## Epic 3: Renewals & Actions

### 3.1 Renewal Flow

```mermaid
flowchart TD
    A[Click 'Renew Now'] --> B[Load Renewal Form]
    B --> C[Pre-fill Known Data]
    C --> D[Display Form for Review]
    D --> E{User Confirms Details?}
    E -->|Edit| F[Edit Fields]
    F --> D
    E -->|Confirm| G[Show Fee Breakdown]
    G --> H{Proceed to Payment?}
    H -->|No| I[Cancel/Return]
    H -->|Yes| J[Load Payment Form]
    J --> K[Enter Payment Details]
    K --> L[Submit Payment]
    L --> M{Payment Success?}
    M -->|No| N[Show Error]
    N --> O{Retry?}
    O -->|Yes| J
    O -->|No| I
    M -->|Yes| P[Create Transaction Record]
    P --> Q[Update Asset Status]
    Q --> R[Send Confirmation Email]
    R --> S[Show Success Screen]
    S --> T[Return to Dashboard]
    T --> U[Asset Shows 'Renewal in Progress']
```

### 3.2 Get Help Flow

```mermaid
flowchart TD
    A[Click 'Get Help'] --> B[Open Help Request Form]
    B --> C[Pre-fill Asset Context]
    C --> D[User Describes Issue]
    D --> E[Select Urgency Level]
    E --> F{Submit Request?}
    F -->|No| G[Cancel]
    F -->|Yes| H[Create Support Ticket]
    H --> I[Notify TMH Team]
    I --> J[Send Confirmation to User]
    J --> K[Show 'Request Submitted']
    K --> L[Return to Dashboard]
```

---

## Epic 4: Notifications & Digests

### 4.1 Weekly Digest Generation

```mermaid
flowchart TD
    A[Scheduled Job: Monday 9am] --> B[Get Users with Digest Enabled]
    B --> C[For Each User]
    C --> D[Get User's Organizations]
    D --> E[Get Assets Needing Action]
    E --> F[Get Status Changes Since Last Digest]
    F --> G[Get Watchlist Updates]
    G --> H{Any Content?}
    H -->|No| I[Skip User]
    H -->|Yes| J[Build Digest Email]
    J --> K[Send Email]
    K --> L[Log Notification Sent]
    L --> M{More Users?}
    I --> M
    M -->|Yes| C
    M -->|No| N[Job Complete]
```

### 4.2 Urgent Alert Flow

```mermaid
flowchart TD
    A[Asset Sync Job] --> B[Check All Assets]
    B --> C{Deadline Within Threshold?}
    C -->|No| D[No Alert Needed]
    C -->|Yes| E[Get Asset Owner/Assignees]
    E --> F{Alert Already Sent?}
    F -->|Yes| D
    F -->|No| G[Get User Preferences]
    G --> H{Urgent Alerts Enabled?}
    H -->|No| D
    H -->|Yes| I[Build Alert Email]
    I --> J[Send Immediately]
    J --> K[Log Alert Sent]
    K --> L[Continue Checking]
    D --> L
```

---

## Epic 5: Multi-Organization Management

### 5.1 Create Client Organization

```mermaid
flowchart TD
    A[Professional Dashboard] --> B[Click 'Add Client']
    B --> C[Open Client Form]
    C --> D[Enter Client Name]
    D --> E[Enter Client Identifiers]
    E --> F{Run Discovery?}
    F -->|Yes| G[Query APIs with Client IDs]
    G --> H[Display Found Assets]
    H --> I[Confirm Import]
    F -->|No| J[Create Empty Org]
    I --> K[Create Organization]
    J --> K
    K --> L[Add Assets to Org]
    L --> M[Add Current User as Owner]
    M --> N[Show Success]
    N --> O[Redirect to Client List]
```

### 5.2 Client Overview Navigation

```mermaid
flowchart TD
    A[Professional Dashboard] --> B[Show Client List]
    B --> C[Display Summary per Client]
    C --> D{User Clicks Client?}
    D -->|Yes| E[Load Client Context]
    E --> F[Show Client's Portfolio]
    F --> G[Breadcrumb: Clients > ClientName]
    G --> H{User Action?}
    H -->|Manage Assets| I[Asset Actions in Client Context]
    H -->|Back to List| J[Click Breadcrumb]
    J --> B
    D -->|Filter/Sort| K[Apply Filter]
    K --> C
```

---

## Epic 6: Team & Role Management

### 6.1 Invite Team Member

```mermaid
flowchart TD
    A[Settings > Team] --> B[Click 'Invite Member']
    B --> C[Enter Email Address]
    C --> D[Enter Name]
    D --> E[Select Role]
    E --> F[Select Organizations to Assign]
    F --> G{Send Invitation?}
    G -->|No| H[Cancel]
    G -->|Yes| I[Create Invitation Record]
    I --> J[Generate Secure Token]
    J --> K[Send Invitation Email]
    K --> L[Show in Pending List]
    L --> M[Wait for Acceptance]
```

### 6.2 Accept Invitation

```mermaid
flowchart TD
    A[Receive Invitation Email] --> B[Click Invitation Link]
    B --> C{Token Valid?}
    C -->|No| D[Show 'Expired/Invalid']
    D --> E[Contact Inviter]
    C -->|Yes| F{Existing Account?}
    F -->|Yes| G[Login Prompt]
    F -->|No| H[Registration Form]
    G --> I[Link Account to Org]
    H --> J[Create Account]
    J --> I
    I --> K[Apply Role & Assignments]
    K --> L[Mark Invitation Accepted]
    L --> M[Redirect to Dashboard]
    M --> N[Show Assigned Orgs Only]
```

### 6.3 Role Permission Check

```mermaid
flowchart TD
    A[User Attempts Action] --> B{Get User's Role}
    B --> C{Action Type?}
    C -->|View| D{Role >= Viewer?}
    C -->|Take Action| E{Role >= User?}
    C -->|Manage Assets| F{Role >= Admin?}
    C -->|Manage Team| G{Role = Owner?}
    D -->|Yes| H[Allow]
    D -->|No| I[Deny: Show Upgrade Message]
    E -->|Yes| H
    E -->|No| I
    F -->|Yes| H
    F -->|No| I
    G -->|Yes| H
    G -->|No| I
```

---

## Epic 7: Delegated Access (Assistant Model)

### 7.1 Invite Assistant with Assets

```mermaid
flowchart TD
    A[Owner: Settings > Team] --> B[Click 'Invite Assistant']
    B --> C[Enter Email/Name]
    C --> D[Select Assets to Assign]
    D --> E[Review Selection]
    E --> F{Confirm?}
    F -->|No| G[Edit Selection]
    G --> D
    F -->|Yes| H[Create Invitation]
    H --> I[Store Asset Assignments]
    I --> J[Send Invitation]
    J --> K[Assistant Receives Email]
```

### 7.2 Assistant Dashboard Experience

```mermaid
flowchart TD
    A[Assistant Logs In] --> B[Load Assigned Assets Only]
    B --> C[Show Filtered Dashboard]
    C --> D{Asset Has Action?}
    D -->|Renewal Due| E[Show 'Notify Owner' Button]
    D -->|No Action| F[Show Status Only]
    E --> G{Assistant Clicks Notify?}
    G -->|Yes| H[Open Notification Form]
    H --> I[Pre-filled Message]
    I --> J{Send?}
    J -->|Yes| K[Send to Owner]
    K --> L[Log Action in Audit]
    L --> M[Show 'Owner Notified']
    J -->|No| N[Cancel]
    G -->|No| O[View Details Only]
```

### 7.3 Notify Owner Flow

```mermaid
flowchart TD
    A[Assistant: Click 'Notify Owner'] --> B[Load Notification Template]
    B --> C[Pre-fill Asset Details]
    C --> D[Show Editable Message]
    D --> E{Edit Message?}
    E -->|Yes| F[Modify Text]
    F --> D
    E -->|Send| G[Validate Message]
    G --> H[Get Owner Email]
    H --> I[Send Notification]
    I --> J[Create Audit Entry]
    J --> K[Update Asset: 'Owner notified on X']
    K --> L[Show Confirmation]
    L --> M[Return to Dashboard]
```

---

## Epic 8: Audit & Activity Logging

### 8.1 Audit Log Recording

```mermaid
flowchart TD
    A[Any User Action] --> B[Intercept Action]
    B --> C[Extract Context]
    C --> D[Build Audit Entry]
    D --> E[Add Metadata]
    E --> F[user_id, org_id, ip, timestamp]
    F --> G[Insert to Audit Log]
    G --> H[Continue Original Action]
    
    subgraph "Audit Entry"
    D --> D1[action type]
    D --> D2[entity type]
    D --> D3[entity id]
    D --> D4[details JSON]
    end
```

### 8.2 View Audit Log

```mermaid
flowchart TD
    A[Owner: Settings > Audit Log] --> B[Load Recent Entries]
    B --> C[Display Log Table]
    C --> D{Apply Filters?}
    D -->|User| E[Filter by User]
    D -->|Date| F[Filter by Date Range]
    D -->|Action| G[Filter by Action Type]
    D -->|Asset| H[Filter by Asset]
    E --> I[Refresh Results]
    F --> I
    G --> I
    H --> I
    I --> C
    C --> J{Export?}
    J -->|Yes| K[Generate CSV]
    K --> L[Download File]
    J -->|No| M[Continue Browsing]
```

---

## Cross-Cutting: Authentication Flow

### Login Flow

```mermaid
flowchart TD
    A[Login Page] --> B[Enter Email/Password]
    B --> C{Valid Credentials?}
    C -->|No| D[Show Error]
    D --> E{Too Many Attempts?}
    E -->|Yes| F[Lock Account Temporarily]
    E -->|No| B
    C -->|Yes| G{Email Verified?}
    G -->|No| H[Prompt to Verify]
    H --> I[Resend Verification]
    G -->|Yes| J{2FA Enabled?}
    J -->|Yes| K[Enter 2FA Code]
    K --> L{Valid Code?}
    L -->|No| D
    L -->|Yes| M[Create Session]
    J -->|No| M
    M --> N[Log Login in Audit]
    N --> O[Redirect to Dashboard]
```

### Password Reset Flow

```mermaid
flowchart TD
    A[Click 'Forgot Password'] --> B[Enter Email]
    B --> C{Email Exists?}
    C -->|No| D[Show Generic Message]
    C -->|Yes| E[Generate Reset Token]
    E --> F[Send Reset Email]
    D --> G[Show 'Check Email' Message]
    F --> G
    G --> H{User Clicks Link}
    H --> I{Token Valid?}
    I -->|No| J[Show 'Link Expired']
    J --> A
    I -->|Yes| K[Show New Password Form]
    K --> L[Enter New Password]
    L --> M{Valid Password?}
    M -->|No| N[Show Requirements]
    N --> L
    M -->|Yes| O[Update Password]
    O --> P[Invalidate Token]
    P --> Q[Log Password Change]
    Q --> R[Redirect to Login]
```

---

## State Diagrams

### Asset Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> ApplicationFiled: New Application
    ApplicationFiled --> Examination: Accepted for Exam
    ApplicationFiled --> Refused: Rejected
    ApplicationFiled --> Withdrawn: Withdrawn by Owner
    Examination --> Published: Passes Exam
    Examination --> Refused: Fails Exam
    Published --> Registered: No Opposition
    Published --> Refused: Opposition Succeeds
    Registered --> RenewalDue: Approaching Expiry
    RenewalDue --> Renewed: Payment Submitted
    RenewalDue --> RenewalOverdue: Deadline Passed
    Renewed --> Registered: Renewal Confirmed
    RenewalOverdue --> Expired: Grace Period Ends
    Expired --> [*]
    Registered --> Cancelled: Owner Request
    Cancelled --> [*]
    Refused --> [*]
    Withdrawn --> [*]
```

### Transaction States

```mermaid
stateDiagram-v2
    [*] --> Pending: Initiated
    Pending --> Processing: Payment Submitted
    Processing --> Completed: Payment Success
    Processing --> Failed: Payment Declined
    Failed --> Pending: Retry
    Failed --> [*]: Abandoned
    Completed --> Refunded: Refund Requested
    Refunded --> [*]
    Completed --> [*]
```

### Invitation States

```mermaid
stateDiagram-v2
    [*] --> Pending: Invitation Sent
    Pending --> Accepted: User Accepts
    Pending --> Expired: Time Limit Reached
    Pending --> Revoked: Owner Cancels
    Expired --> Pending: Resend
    Accepted --> [*]
    Revoked --> [*]
```

---

## Rendering Notes

These diagrams use **Mermaid.js** syntax and render natively in:
- GitHub / GitLab markdown preview
- VS Code (with Mermaid extension)
- Obsidian
- Notion (via embed)
- Most modern documentation platforms

To preview locally, you can use:
- [Mermaid Live Editor](https://mermaid.live)
- VS Code extension: "Markdown Preview Mermaid Support"
