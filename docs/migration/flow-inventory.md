# Renewal Flow Inventory

This inventory is based primarily on the `multi-deal-order` branch. It describes the renewal flow behavior that should be preserved when rebuilding inside another application.

## 1. Renewal Landing Flow

Primary source:
- `multi-deal-order:public/renewal/uktm/index.html`
- `multi-deal-order:public/renewal/uktm/assets/js/main.js`

### Entry conditions

- User arrives on `/uktm/?token=...`
- Page expects a `token` query parameter
- If `window.__renewalPayload` exists, the page can render without an API fetch
- Without a token, the page hides main content and shows an error banner

### Initial data load

- Frontend calls `GET /api/renewal/details?token=...`
- Response is expected to contain:
  - `account`
  - `contact`
  - `trademark`
  - `next_due`
  - optional `links`
- The page prefills hero content, summary fields, contact fields, trademark details, and renewals table from that payload

### Behavior to preserve

- Token-gated entry
- Loading overlay during prefill fetch
- Error banner when token is missing, invalid, expired, or prefill fails
- Prefill fallback from injected payload for local/testing use
- Dynamic hero rendering based on trademark data
- Logo/image handling for image marks and text fallback for word marks
- UTM, referrer, and landing path capture into hidden fields

### Screening logic

Two radio groups drive whether the user can continue self-serve:
- `qOwnership`
- `qClasses`

Preserved rules:
- If either answer is not `No`, the form hides direct submission and shows the screening note / book-call path
- Only when both answers are answered and both are `No` does the page reveal:
  - contact fields
  - authorization section
  - submit section

### Multi-deal-order addition: batch renewal UI

This branch adds visible multi-renewal selection behavior:
- `next_due` trademarks render with checkboxes
- User can select individual additional trademarks
- User can use a `select all` checkbox
- Selected trademarks render as cards below the form
- The primary trademark is always included and cannot be removed
- Additional selected trademarks can be removed from the card list, which also unchecks their corresponding table checkbox

Preserve this as intended UX behavior.

Important current limitation:
- The selected additional trademarks are not currently serialized into the request body sent to `POST /api/renewal/order`
- Only the primary `trademark_number` is submitted
- This means the branch behavior is visually implemented but not fully integrated end-to-end

### Submit behavior

When the form is valid:
- Frontend sends `POST /api/renewal/order`
- Payload shape is:

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

After a successful response:
- Frontend enriches the order payload with trademark data if necessary
- Frontend base64-encodes the order object
- Redirect goes to `/uktm/order.html?order=<base64-json>`

### Current constraints worth preserving or replacing consciously

- Order page currently depends on client-side encoded order payload in the URL
- There is no frontend redirect to a canonical server-fetched order route in this branch
- If the new app has proper protected order routes, replace the encoded URL transport with server-backed order retrieval

## 2. Renewal Order / Payment Flow

Primary source:
- `multi-deal-order:public/renewal/uktm/order.html`
- `multi-deal-order:public/renewal/uktm/assets/js/order.js`

### Entry conditions

- Order page expects order data from one of:
  - `window.__orderPayload`
  - `?order=<base64-json>`
- If no valid order data is present, the page hides main content and shows an error banner

### Order rendering behavior

The page displays:
- trademark summary card
- line items
- subtotal
- VAT
- total
- upsell section before payment

### Terms gate

- User cannot proceed to payment unless terms checkbox is checked
- If terms are unchecked:
  - show inline error
  - focus checkbox
  - scroll terms section into view

### Payment-link behavior

When the user clicks pay:
- Frontend extracts `deal_token` from current order data
- Frontend calls `GET /api/renewal/payment-link?token=...`
- Response is expected to include `payment_url`
- Frontend opens payment URL in a new tab
- Frontend starts client-side payment polling in the original tab

### Payment monitoring behavior

The branch implements a meaningful payment-state machine:
- polling starts immediately after payment URL opens
- polling cadence changes over time:
  - first 30 seconds: every 2 seconds
  - next 90 seconds: every 5 seconds
  - after that: every 10 seconds
- total polling timeout: 10 minutes
- pending banner appears after 2 minutes
- user can manually recheck payment status
- user can reopen payment page

Supported terminal states:
- `paid`
- `voided`
- `not_found`
- `failed`
- `timeout`

Expected behaviors:
- `paid`: store `payment_completed` in `sessionStorage`, redirect to confirmation with token in query string
- `voided` / `not_found`: show terminal panel and offer fallback/support actions
- `failed` / `timeout`: show reopen/recheck/support actions

### State persisted in browser

- `renewal_order_data`
- `payment_completed`
- `renewal_offer_url`

These are used for:
- returning to the originating offer page
- confirmation-page guard
- local continuity of order/payment data

## 3. Confirmation Access Gate

Primary source:
- `multi-deal-order:public/renewal/uktm/assets/js/confirmation.js`

Behavior:
- Read `token` from URL
- Read `payment_completed` from `sessionStorage`
- If either is missing or they do not match, redirect to `/uktm/`
- If they match, clear `payment_completed` and allow access

This is a lightweight but useful one-time confirmation access check and should be preserved unless the new app has a stronger server-side payment confirmation gate.

## 4. Dormant or Secondary Backend Flow

Primary source:
- `multi-deal-order:api/renewal/order/[dealId].js`

This branch includes an order-summary endpoint:
- `GET /api/renewal/order/:dealId`

But current frontend behavior does not depend on it during the normal renewal journey. The landing page redirects with encoded order data instead of fetching this route.

Migration implication:
- Keep the route as a useful backend capability
- Prefer using it in the new app instead of passing base64 order data through the URL

## 5. Migration Priority

Preserve exactly:
- token-gated prefill
- screening logic
- current field validations
- payment-link creation
- payment polling states and intervals
- confirmation token guard

Preserve conceptually but reimplement cleanly:
- multi-renewal selection
- order transport between landing and order screens
- browser storage usage
- route structure

Do not preserve as-is:
- current HTML/CSS layout
- `/uktm/` path naming
- current asset organization
