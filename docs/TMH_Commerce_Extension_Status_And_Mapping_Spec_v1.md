# TMH Commerce Extension — Status And Mapping Spec v1

## Status
Locked planning artifact for the current TMH commerce implementation phase.

## Purpose

Define one app-level status model for orders, subscriptions, payments, requests, preferences, and checkout intents so the UI and API layers do not depend directly on Zoho labels or payment-provider-specific statuses.

---

## 1. General mapping rules

1. App statuses are the only statuses returned to UI components.
2. Provider and CRM statuses must be mapped into app statuses inside server routes or service/adaptor layers.
3. Mixed payable and follow-up basket outcomes must be represented by `OrderLine.disposition`, not a custom order status.
4. If a source system has more granular sub-states, preserve them internally or in logs, but map them to the closest normalized app status for product behavior.

---

## 2. Order status

### Allowed values

- `draft`
- `pending_checkout`
- `pending_confirmation`
- `confirmed`
- `failed`
- `cancelled`

### Meaning

- `draft`: commercial basket or intent exists, but checkout has not started
- `pending_checkout`: checkout intent exists and the customer has not yet completed the hosted payment/setup flow
- `pending_confirmation`: hosted flow returned or a provider event started, but durable confirmation is still being reconciled
- `confirmed`: order has been accepted and reflected in CRM-backed commercial state
- `failed`: checkout or confirmation failed terminally
- `cancelled`: customer cancelled or the order should no longer proceed

### Mapping guidance

- basket saved, pre-payment -> `draft`
- checkout intent created -> `pending_checkout`
- provider return happened but final state is not yet durable -> `pending_confirmation`
- confirmed in CRM and associated payment/subscription state reconciled -> `confirmed`
- provider/setup error -> `failed`
- explicit cancellation/abandonment -> `cancelled`

---

## 3. Subscription status

### Allowed values

- `pending_checkout`
- `pending_confirmation`
- `active`
- `past_due`
- `cancel_at_period_end`
- `cancelled`

### Meaning

- `pending_checkout`: no successful setup yet
- `pending_confirmation`: provider setup completed or returned, but app/CRM state is not fully reconciled
- `active`: recurring commercial state is live
- `past_due`: post-activation billing or collection problem exists
- `cancel_at_period_end`: subscription remains active but is scheduled to end
- `cancelled`: recurring agreement has ended or been terminated

### Mapping guidance

- created but not paid/setup complete -> `pending_checkout`
- setup complete but not durably reflected -> `pending_confirmation`
- live and billable -> `active`
- collection failure after activation -> `past_due`
- provider marks end-of-term cancellation -> `cancel_at_period_end`
- ended/terminated -> `cancelled`

---

## 4. Payment status

### Allowed values

- `initiated`
- `pending`
- `succeeded`
- `failed`
- `cancelled`

### Meaning

- `initiated`: checkout session, billing request, or equivalent hosted flow has been created
- `pending`: provider is still processing setup or collection
- `succeeded`: the payment or payment setup required for the current step completed successfully
- `failed`: provider reported a terminal failure
- `cancelled`: user cancelled, payment expired, or provider closed the flow without success

### Mapping guidance

- redirect/session created -> `initiated`
- mandate or bank processing underway -> `pending`
- successful first payment or confirmed setup -> `succeeded`
- failed collection/setup -> `failed`
- user-cancelled or expired -> `cancelled`

---

## 5. Request status

### Allowed values

- `submitted`
- `triaged`
- `awaiting_customer`
- `in_progress`
- `completed`
- `cancelled`

### Meaning

- `submitted`: request captured
- `triaged`: reviewed and categorized by TMH
- `awaiting_customer`: more user action/info is required
- `in_progress`: TMH is actively working the request
- `completed`: request handled successfully
- `cancelled`: request closed without completion

---

## 6. Preference sync status

### `PreferenceProfile.crm_sync_status`

- `synced`
- `pending_sync`
- `sync_failed`

### Notes

- The preference content itself is not a status enum.
- `global_opt_out` and category selections are state values.
- Sync status is only for observability and retry behavior.

---

## 7. Checkout intent payment status

### `CheckoutIntent.payment_status`

- `initiated`
- `pending`
- `succeeded`
- `failed`
- `cancelled`

### Notes

- This mirrors normalized payment state during the hosted payment/setup journey.

---

## 8. Mixed basket rule

For monitoring and similar commercial flows:

- `Order.status` should describe the commercial transaction lifecycle
- `OrderLine.disposition` should describe whether each selected line is:
  - `payable_now`
  - `requires_follow_up`

### Example

If a monitoring basket contains two payable items and one MAD item requiring a call:

- `Order.status = confirmed`
- two lines -> `payable_now`
- one line -> `requires_follow_up`

Do not create special order statuses such as:

- `partially_payable`
- `partially_confirmed`
- `follow_up_pending`

for this case.

---

## 9. Source-of-truth mapping

### Customer

- Commercial source of truth: Zoho

### Order

- Commercial source of truth: Zoho

### Subscription

- Billing lifecycle source of truth: payment provider through the v1 Xero payment gateway
- App-readable normalized commercial source of truth: Zoho-backed normalized state

### Payment

- Source of truth: payment provider through the v1 Xero payment gateway

### Request

- Source of truth: Zoho

### PreferenceProfile

- Source of truth: Zoho-backed preference state

### CheckoutIntent

- Source of truth: app persistence layer or CRM-backed checkout-intent persistence used by the app

---

## 10. Route responsibility mapping

### `GET /api/subscribe/monitoring`

- resolves token
- returns customer and offer context
- does not own order/subscription/payment confirmation state

### `POST /api/subscribe/monitoring/quote`

- validates token and basket
- recalculates pricing server-side
- classifies lines into `payable_now` and `requires_follow_up`

### `POST /api/subscribe/monitoring/checkout`

- creates or updates `Order`
- creates `CheckoutIntent`
- sets `Order.status = pending_checkout`
- sets normalized payment state to `initiated`
- returns redirect/session/reference values

### `GET /api/subscribe/monitoring/confirm`

- reads persisted checkout snapshot
- returns normalized order/payment/subscription state
- surfaces `pending_confirmation`, success, or failure/cancel states as needed

---

## 11. Locked implementation rule

> The TMH Commerce Extension must normalize Zoho and payment-provider statuses into the app-level enums defined here before returning data to the UI. UI code should never branch on raw provider labels or raw CRM stage values.
