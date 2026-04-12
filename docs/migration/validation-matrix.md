# Validation Matrix

This matrix is based on the `multi-deal-order` renewal frontend behavior. It captures both visible validation and implied gating rules.

Primary source:
- `multi-deal-order:public/renewal/uktm/assets/js/main.js`
- `multi-deal-order:public/renewal/uktm/assets/js/order.js`
- `multi-deal-order:public/renewal/uktm/assets/js/confirmation.js`

## 1. Entry Validation

### Landing page token requirement

Condition:
- `token` query parameter is missing

Behavior:
- show token error banner
- hide main content
- do not fetch details

### Landing page invalid or expired token

Condition:
- `GET /api/renewal/details` is non-OK

Behavior:
- show invalid/expired banner
- hide main content

### Order page payload requirement

Condition:
- no valid `window.__orderPayload`
- and no valid `?order=<base64>`

Behavior:
- show order error banner
- hide main content

### Confirmation page access guard

Conditions:
- URL token missing
- or `sessionStorage.payment_completed` missing
- or URL token and session token do not match

Behavior:
- redirect to `/uktm/`

## 2. Screening / Journey Routing Rules

### Question: ownership change

Field:
- `qOwnership`

Accepted values in current UX:
- `No`
- anything else is treated as requiring review

### Question: class change

Field:
- `qClasses`

Accepted values in current UX:
- `No`
- anything else is treated as requiring review

### Self-serve eligibility

Rule:
- user can proceed only when both `qOwnership` and `qClasses` are answered and both are `No`

If not eligible:
- contact fields hidden
- authorization hidden
- submit hidden
- screening note / alternative assistance shown

## 3. Renewal Form Field Validation

### `firstName`

Required:
- yes, when contact fields are visible

Rule:
- trimmed value must be non-empty

Error:
- `Please provide your first name`

### `lastName`

Required:
- yes, when contact fields are visible

Rule:
- trimmed value must be non-empty

Error:
- `Please provide your last name`

### `email`

Required:
- yes, when contact fields are visible

Rules:
- trimmed value must be non-empty
- must match `^[^\s@]+@[^\s@]+\.[^\s@]+$`

Errors:
- `Please provide your email address`
- `Please provide a valid email address`

### `phone`

Required:
- yes, when contact fields are visible

Rule:
- trimmed value must be non-empty

Current limitation:
- no explicit phone-format regex on this page

Error:
- `Please provide your mobile number`

### `authConfirm`

Required:
- yes, when authorization section is visible

Rule:
- checkbox must be checked

Error:
- `You must confirm you are authorised to renew this trademark`

### `consent`

Required:
- yes, when submission section is visible

Rule:
- checkbox must be checked

Error:
- `You must agree to be contacted about your renewal`

## 4. Prefill and Data Fallback Rules

The form uses prefill as a fallback if visible fields are blank at submit time.

Submit payload uses:
- typed input first
- then prefilled contact data

This means the migrated flow should preserve:
- user edits overriding prefill
- prefill supplying values if fields remain unchanged or empty

## 5. Multi-Renewal Selection Rules

Implemented UX rules in `multi-deal-order`:
- primary trademark is always included
- additional trademarks come from `next_due`
- additional items can be selected via checkbox
- `select all` toggles all additional renewal checkboxes
- removing a selected card unchecks its table row

Current gap:
- there is no validation that at least one extra trademark be selected
- there is no serialized selected-trademarks payload in the current POST request

Migration recommendation:
- define explicit rules for the new app:
  - optional extra selections, or
  - required explicit confirmation of the selected renewal set
- always serialize the full selected set to the backend

## 6. Order Page Validation

### Terms acceptance

Field:
- `terms-checkbox`

Required:
- yes, before payment link request

Behavior on failure:
- show inline terms error
- focus the checkbox
- scroll to terms section

Error message:
- `Please accept the terms and conditions to proceed.`

### Deal token requirement for payment

Condition:
- current order data lacks `deal_token`

Behavior:
- abort payment-link creation
- show inline error

Error message:
- `Order token not found. Please refresh the page and try again.`

### Popup requirement

Condition:
- browser blocks `window.open`

Behavior:
- payment flow cannot start
- inline error shown

Error message:
- `Popup blocked. Please allow popups for this site and try again.`

## 7. Payment State Validation

### Polling status normalization

Frontend recognizes:
- `paid`
- `pending`
- `voided`
- `not_found`
- `failed`

Anything else effectively falls back to pending behavior in the current flow.

### Payment timeout

Rule:
- after 10 minutes of elapsed polling, treat payment as timed out

Behavior:
- stop active polling
- show timeout state
- present reopen/recheck/support actions

## 8. Confirmation Validation

One-time access rule:
- token in URL must match session token from successful payment
- on success, session token is removed

Migration recommendation:
- preserve one-time confirmation access semantics
- if the new app has authenticated server routes, move this validation server-side

## 9. Validation Gaps To Fix During Rebuild

These are not reasons to copy the old behavior blindly:

- phone input is only checked for non-empty, not normalized format
- renewal selection UI is not persisted into the submit payload
- order page trusts base64-decoded client payload as its primary source
- confirmation access control is browser-storage based rather than server-verified

Recommended rebuild stance:
- preserve user-facing flow decisions
- tighten validation and trust boundaries where the new app makes that practical
