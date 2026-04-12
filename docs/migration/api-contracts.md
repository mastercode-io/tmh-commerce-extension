# Renewal API Contracts

This document captures the renewal-related API behavior from the `multi-deal-order` branch. Use it as the migration contract baseline for the new application.

Primary source:
- `multi-deal-order:api/README.md`
- `multi-deal-order:api/_lib/crm.js`
- `multi-deal-order:api/_services/renewal.js`
- `multi-deal-order:api/renewal/*`

## Contract Model

The current stack has three layers:
- frontend contract used by the pages
- edge-function contract exposed under `/api/renewal/*`
- upstream CRM/Xero contract hidden behind the service layer

For the new app, preserve this separation:
- UI should call your app API or server actions
- app API should normalize CRM responses into stable internal shapes
- upstream CRM/Xero differences should not leak into UI components

## Environment and Auth

Current environment variables:

```env
CRM_API_BASE_URL=
CRM_API_KEY=
CRM_AUTH_TYPE=apikey
CRM_API_KEY_HEADER=X-API-Key
CRM_API_KEY_PARAM=zapikey
USE_MOCK_DATA=true
```

Current CRM request behavior:
- appends `auth_type`
- appends API key as query parameter if configured
- also sends API key header if configured

## 1. `GET /api/renewal/details?token=...`

Purpose:
- hydrate renewal landing page

Frontend dependency:
- required for normal page load unless test payload is injected

Required input:
- `token` query parameter

Error behavior:
- missing token returns `token_required`
- failed upstream request returns `renewal_details_failed`

Normalized response shape:

```json
{
  "account": {},
  "contact": {},
  "trademark": {},
  "next_due": [],
  "links": {}
}
```

Expected field groups:
- `account`: owner/account details
- `contact`: named contact for prefill
- `trademark`: primary renewal target
- `next_due`: additional upcoming renewals
- `links`: booking/terms/preferences overrides

Migration recommendation:
- preserve this response shape as the stable UI contract
- keep normalization in one backend boundary

## 2. `POST /api/renewal/order`

Purpose:
- convert the renewal submission into a deal/order summary

Current required request shape:

```json
{
  "token": "tok_123",
  "source": "renewal-landing",
  "type": "lead",
  "data": {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000",
    "trademark_number": "UK0000123456"
  }
}
```

Current validation at edge layer:
- request must be valid JSON
- `token` is required

Current response normalization:

```json
{
  "deal_id": "D-000001",
  "deal_token": "mock_deal_token",
  "contact_id": "C-000001",
  "account_id": "A-000001",
  "subtotal": 760,
  "vat": 152,
  "total": 912,
  "currency": "GBP",
  "line_items": [],
  "trademark": {}
}
```

Important migration note:
- the `multi-deal-order` frontend exposes multi-select renewal UI, but this request still only sends a single `trademark_number`
- if you want true multi-renewal support in the new app, define a new explicit contract such as:

```json
{
  "token": "tok_123",
  "source": "renewal-landing",
  "type": "lead",
  "data": {
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000",
    "primary_trademark_number": "UK0000123456",
    "selected_trademark_numbers": [
      "UK0000123456",
      "UK0000654321"
    ]
  }
}
```

Do not assume the branch already supports this upstream.

## 3. `GET /api/renewal/order/:dealId`

Purpose:
- fetch order summary by deal token

Current backend capability:
- extracts final path segment as deal token
- returns normalized order summary

Current frontend usage:
- not part of the normal branch flow

Migration recommendation:
- use this route pattern, or an equivalent server-side fetch, instead of passing the order object through the URL

## 4. `GET /api/renewal/payment-link?token=...`

Purpose:
- create or retrieve payment link for the existing deal

Required input:
- deal token in `token` query parameter

Normalized response:

```json
{
  "payment_url": "https://...",
  "deal_token": "deal_tok_123"
}
```

Migration recommendation:
- preserve this minimal response
- keep payment-link generation idempotent if possible

## 5. `GET /api/renewal/payment-status?token=...`

Purpose:
- poll payment status for the deal-linked invoice

Required input:
- deal token in `token` query parameter

Current normalized response:

```json
{
  "deal_token": "deal_tok_123",
  "status": "pending",
  "updated_at": "2026-04-12T10:00:00.000Z"
}
```

Current status normalization in `multi-deal-order`:
- service returns `statusValue.toLowerCase()`
- order page then normalizes accepted UI states

Observed statuses handled by frontend:
- `paid`
- `pending`
- `voided`
- `not_found`
- `failed`

Migration recommendation:
- normalize statuses fully on the backend
- return only the app’s canonical set of payment states
- avoid forcing each frontend screen to interpret raw Xero/CRM variants

## Upstream CRM Function Mapping

Current upstream functions:
- `renewalgetleadinfo`
- `renewalcreateorder`
- `renewalgetordersummary`
- `dealcreatepayment`
- `renewalgetpaymentstatus`

These are implementation details, not UI contracts. In the new app:
- keep these hidden behind a single service module
- preserve response normalization
- isolate future CRM function renames to one place

## Mock Data as Reference Fixtures

Useful source:
- `multi-deal-order:api/_lib/mock-data.js`

Keep fixture coverage for:
- organization account
- individual account
- order summary
- payment link
- payment pending status

Migration recommendation:
- convert these into explicit JSON fixtures or test builders in the new app
- use them for parity tests while rebuilding the UI

## Suggested Target Contract Changes

Preserve:
- token-driven details fetch
- separate payment-link and payment-status endpoints
- normalized order summary object

Change deliberately:
- replace base64 URL transport with backend order retrieval
- add explicit array support for multi-renewal selection
- centralize canonical payment status mapping on the backend
