# Audit Flow Inventory

This inventory is based on the `dev` branch because that is where the audit flow currently lives.

Primary source:
- `dev:public/audit/*`
- `dev:api/audit/*`
- `dev:api/_services/audit.js`
- `dev:docs/PRD_Trademark_Audit_Online_Order_Form_v1.3.md`

## 1. Audit Flow Shape

The audit journey is a multi-step wizard with local persistence and staged backend writes.

Route family:
- `/audit/`
- `/audit/summary/?orderId=...`
- `/audit/confirmation/?orderId=...`

Architecture pattern:
- wizard steps capture and persist lead/order data incrementally
- local browser state stores progress
- API writes happen during the wizard, not only at the end
- summary page loads a normalized order object by `orderId`
- payment options are submitted from summary
- confirmation clears local wizard state

## 2. Wizard Steps

## Step 1: Contact

Fields:
- first name
- last name
- email
- phone

Behavior:
- validates required fields
- sends first write to `POST /api/audit/lead`
- backend returns a lead `token`
- token is stored in local state

## Step 2: Contact Preferences

Fields:
- multi-select preferred methods:
  - Phone
  - SMS
  - WhatsApp
  - Email
  - Video Call

Behavior:
- must select at least one
- writes incremental update to `POST /api/audit/lead`

## Step 3: Trademark Status

Modes:
- `existing`
- `new`

If `existing`:
- user provides trademark name or application number
- application number takes priority if both are present
- user can search Temmy
- if multiple Temmy results exist, one result must be selected before continuing

If `new`:
- user provides:
  - trademark type
  - trademark name
  - image upload intent
  - optional image file
  - jurisdictions
  - optional custom jurisdiction

Behavior:
- still writes through `POST /api/audit/lead`
- field names are transformed into CRM-oriented lead keys before submission

## Step 4: Goods / Services

Fields:
- business description
- website

Behavior:
- website is optional but must be a valid HTTP/HTTPS URL if supplied
- still submitted to `POST /api/audit/lead`

## Step 5: Billing

Billing types:
- Individual
- Organisation

Required:
- billing name fields by type
- address
- invoice email
- invoice phone

Behavior:
- still submitted to `POST /api/audit/lead`

## Step 6: Appointment / Booking Decision

Choices:
- schedule appointment
- skip appointment

Behavior:
- this is where the flow changes from lead token to order ID usage
- state updates are submitted to `POST /api/audit/update`
- on success, user is redirected to summary

Important observed implementation detail:
- the wizard comments describe “steps 1-5” using lead updates and “step 6+” using order/deal updates
- `orderId` capture and transition logic should be treated carefully during rebuild because the current step numbering/comments are inconsistent in places

## 3. Local State Model

Primary source:
- `dev:public/audit/assets/js/state-manager.js`

Persisted storage key:
- `audit_order_state`

Stored state includes:
- `token`
- `orderId`
- `currentStep`
- section objects for:
  - `contact`
  - `preferences`
  - `tmStatus`
  - `temmy`
  - `tmInfo`
  - `goods`
  - `billing`
  - `appointment`

Behavior to preserve:
- recover wizard progress
- preserve selected Temmy result
- preserve expanded Temmy details state
- clear local state on successful confirmation

## 4. Temmy Search Behavior

Primary source:
- `dev:public/audit/assets/js/wizard.js`
- `dev:api/temmy/search.js`

Flow:
- existing-trademark path can search Temmy
- request payload uses either:
  - `application_number`
  - or `text`
- results are sorted by applicant name and then expiry date
- single-result searches auto-select that result
- multiple-result searches require explicit checkbox selection
- result rows support expand/collapse for detailed metadata

Preserve:
- read-only search pattern
- explicit result selection requirement when there are multiple matches
- separation between search results and persisted chosen trademark

## 5. Audit Backend Contracts

## `POST /api/audit/lead`

Purpose:
- incremental lead creation/update for early wizard steps

Request pattern:

```json
{
  "token": "optional-after-step-1",
  "lead": {
    "...": "step-specific normalized lead fields"
  }
}
```

Response pattern:

```json
{
  "token": "lead_token",
  "lead": {}
}
```

## `POST /api/audit/update`

Purpose:
- create or update audit order/deal sections

Request pattern:

```json
{
  "orderId": "optional for early transition points",
  "section": "billing | appointment | paymentOptions | ...",
  "data": {}
}
```

Response pattern:

```json
{
  "orderId": "AUD-123",
  "success": true,
  "message": "..."
}
```

For `paymentOptions`, response may also include:

```json
{
  "checkoutUrl": "https://..."
}
```

## `GET /api/audit/order/:orderId`

Purpose:
- load full audit order for summary and confirmation

Normalized response shape:

```json
{
  "orderId": "AUD-123",
  "dealId": "D-456",
  "sections": {},
  "subtotal": 0,
  "vat": 0,
  "total": 0,
  "currency": "GBP",
  "created": "ISO_TIMESTAMP",
  "updated": "ISO_TIMESTAMP",
  "status": "pending"
}
```

## 6. Summary Page Behavior

Primary source:
- `dev:public/audit/assets/js/summary.js`

Behavior:
- loads order by `orderId`
- renders sections:
  - contact
  - trademark information
  - billing
- computes pricing client-side for current UI:
  - base audit
  - optional social media addon
  - online discount
  - VAT
  - total

Important migration note:
- current pricing is partly client-calculated
- for a production rebuild inside `tmh-commerce-extension`, pricing should be server-authoritative

Payment behavior:
- user must accept terms
- summary submits `section: paymentOptions` to `/api/audit/update`
- backend expected to return `checkoutUrl`
- user is redirected to hosted checkout

## 7. Confirmation Page Behavior

Primary source:
- `dev:public/audit/assets/js/confirmation.js`

Behavior:
- reads `orderId` from query string
- optionally fetches order details
- displays order reference/date if available
- clears local audit state
- falls back to generic confirmation content if order lookup fails

## 8. What To Preserve In Migration

Preserve exactly:
- multi-step wizard model
- incremental save pattern
- explicit lead-token then order-id progression
- Temmy search and selection rules
- field validation behavior
- summary and confirmation pages loading by `orderId`

Preserve conceptually but improve:
- localStorage persistence
- client-calculated pricing
- route names and page structure
- step-number consistency and comments

## 9. Best Fit Inside `tmh-commerce-extension`

This flow should not be reduced to a single generic `POST /api/requests` form if you want parity.

Best fit:
- dedicated audit route family
- dedicated audit server contract
- optional eventual linkage into normalized `Request` and `Order` records for account visibility

Good target shape:
- request record for audit submission tracking
- order record for payable audit output
- account history entry via normalized `RequestSummary` and `OrderSummary`
