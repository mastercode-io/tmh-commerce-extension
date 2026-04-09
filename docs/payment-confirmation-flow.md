# Payment Confirmation Flow

This note describes how we currently wait for payment confirmation after the user is sent to the hosted payment page.

## Short version

We do **not** wait for the payment provider to redirect back and confirm payment on the confirmation page itself.

Instead:

1. The order page requests a payment link.
2. The payment link is opened in a **new tab**.
3. The **original order page** starts polling our status endpoint with the deal token.
4. When the status becomes `paid`, the original page stores `payment_completed` in `sessionStorage` and redirects to the confirmation page.
5. The confirmation page only validates that redirect by checking the token in the URL against `sessionStorage`.

## Main files

- `public/renewals/uk/assets/js/order.js`
- `public/assets/js/order.js`
- `api/renewals/payment-status.js`
- `api/orders/payment-status.js`
- `api/_services/renewal.js`
- `public/renewals/uk/assets/js/confirmation.js`
- `public/assets/js/confirmation.js`

The UK renewal flow and the generic order flow use the same pattern. The code is effectively duplicated, with different route constants.

## Front-end flow

### 1. User clicks Pay Now

On the order page, after terms are accepted, the browser calls the payment-link API, saves the returned `payment_url`, opens it in a new tab, and then starts local payment monitoring.

Relevant code:

- `public/renewals/uk/assets/js/order.js`
  - requests payment link around lines `873-888`
  - opens new tab around lines `905-913`
  - starts monitoring around line `915`
- `public/assets/js/order.js`
  - same pattern in the generic order journey

### 2. Monitoring starts on the original page

`startPaymentMonitoring(token, paymentUrl, { resetStartTime: true })` sets the in-memory payment state and immediately calls `performStatusCheck()`.

Important state fields:

- `token`
- `paymentUrl`
- `startTime`
- `pollTimeoutId`
- `active`
- `timedOut`
- `lastStatus`

Polling config:

- timeout: `10 minutes`
- pending banner delay: `2 minutes`
- polling intervals:
  - first 30s: every `2s`
  - next 90s: every `5s`
  - after that: every `10s`

This is defined near the top of both order-page scripts.

### 3. Status checks call our Edge endpoint

`performStatusCheck()` calls:

- UK renewal flow: `/api/renewals/payment-status?token=...`
- generic order flow: `/api/orders/payment-status?token=...`

The fetch is `GET`, `credentials: 'include'`, and `cache: 'no-store'`.

### 4. Status handling

The order page normalizes the returned status and handles it like this:

- `paid`
  - stop polling
  - hide the status panel
  - store `payment_completed = <token>` in `sessionStorage`
  - redirect to confirmation page with `?token=<token>`
- `pending`
  - keep button in "Waiting for payment..." state
  - optionally show the "Waiting for your payment..." panel after 2 minutes
  - schedule the next poll
- `voided`, `not_found`, `failed`
  - stop polling
  - show a terminal status panel
  - expose actions such as reopen payment, manual recheck, and contact support
- timeout
  - after 10 minutes, mark the flow as timed out
  - show "Payment not detected"

Manual recovery actions:

- `handleReopenPayment()` reopens the same payment URL in a new tab and restarts monitoring.
- `handleManualRecheck()` performs a one-off status check even when automatic polling is inactive.

## Backend flow

### 1. Edge endpoint

Both payment-status endpoints are thin wrappers:

- read `token` from the query string
- call `fetchPaymentStatus(token)`
- return normalized JSON

Files:

- `api/renewals/payment-status.js`
- `api/orders/payment-status.js`

### 2. CRM/Xero status normalization

`fetchPaymentStatus(token)` lives in `api/_services/renewal.js`.

Behavior:

- if CRM is configured, it calls `CRM_ENDPOINTS.xeroInvoiceStatus`
- otherwise, if mock mode is enabled, it uses mock payment status data

`normalizePaymentStatus()` extracts the first invoice from the CRM response and maps external statuses into internal ones.

Current mapping:

- `paid` -> `paid`
- `authorised` / `authorized` / `submitted` / `draft` -> `pending`
- `voided` / `deleted` -> `voided`
- anything unknown -> `pending`

So the front end only works with these internal states:

- `paid`
- `pending`
- `voided`
- `not_found`
- `failed`
- `timeout`

Note: `not_found` and `failed` are handled in the UI, but they are not produced by `mapXeroStatus()` directly. They likely come from other response shapes, mock data, or upstream API behavior.

## Confirmation page behavior

The confirmation page is **not** checking payment with the backend.

It only validates that:

- a `token` exists in the URL, and
- the same token exists in `sessionStorage.payment_completed`

If validation fails:

- UK journey redirects to `/renewals/uk/`
- generic journey redirects to `/`

If validation succeeds:

- it removes `payment_completed` from `sessionStorage`
- the confirmation page is treated as valid one-time access

## Practical implication

The real "await payment confirmation" mechanism is:

- browser-side polling from the order page
- backed by `/api/*/payment-status`
- with final confirmation gated by `sessionStorage` token matching on the confirmation page

There is no separate server-side confirmation page workflow in this codepath.
