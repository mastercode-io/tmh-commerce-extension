# TMH Commerce Extension — Canonical Domain Model v1

## Status
Locked planning artifact for the current TMH commerce implementation phase.

## Purpose

Define the minimal app-level domain model for the TMH Commerce Extension so implementation work can proceed from one normalized commercial model rather than from a mix of portal-era mock data, CRM record names, and payment-provider-specific assumptions.

This model is intentionally:

- TMH-specific
- commerce/account scoped
- provider-neutral at the app boundary
- compatible with Zoho as the commercial system of record

---

## 1. Modeling rules

1. App-level entities are not required to match Zoho module names exactly.
2. Payment-provider-specific identifiers must be stored in provider-neutral fields.
3. Mixed commercial outcomes must be modeled with separate entities or line dispositions, not overloaded status values.
4. The app should read normalized commerce objects, not raw provider or raw CRM payloads.

---

## 2. Core entities

## 2.1 Customer

Represents the commercial identity known to the TMH Commerce Extension.

### Required fields

- `customer_id`
- `crm_contact_id`
- `email`
- `full_name`

### Optional fields

- `crm_account_id`
- `company_name`
- `phone`
- `auth_user_id`
- `preferences_state_ref`

### Notes

- This entity ties together subscriptions, orders, payments, requests, and preferences.
- Authentication identity may exist separately, but commercial identity must reconcile to this object.

---

## 2.2 Subscription

Represents one recurring commercial agreement for a customer.

### Required fields

- `subscription_id`
- `customer_id`
- `order_id`
- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `plan_family`
- `billing_interval`
- `status`
- `crm_reference`

### Optional fields

- `current_period_start`
- `current_period_end`
- `cancel_at_period_end`
- `cancelled_at`
- `started_at`
- `last_paid_at`

### Notes

- For v1, Zoho may physically store subscription state on an order-like record, but the app should still model a subscription explicitly.
- `provider` is an app-level string such as `xero_gateway`.

---

## 2.3 Order

Represents the parent commercial transaction or commercial intent.

### Required fields

- `order_id`
- `customer_id`
- `kind`
- `status`
- `currency`
- `total_due_now`
- `crm_order_id`
- `reference`
- `created_at`

### Optional fields

- `billing_interval`
- `total_follow_up`
- `confirmed_at`

### Allowed kinds

- `subscription`
- `service_request`

### Notes

- For subscription checkout, one order should correspond to one subscription agreement.
- Service-request orders may not create a recurring subscription.

---

## 2.4 OrderLine

Represents an individual payable or follow-up commercial line within an order.

### Required fields

- `order_line_id`
- `order_id`
- `line_type`
- `label`
- `quantity`
- `disposition`

### Optional fields

- `source_record_id`
- `plan`
- `unit_price`
- `billing_interval`

### Allowed line types

- `subscription_package`
- `service_request`
- `follow_up_quote`

### Allowed dispositions

- `payable_now`
- `requires_follow_up`

### Notes

- This is how the app must model mixed monitoring baskets.
- Do not create artificial order-level statuses such as `partially_payable` or `partially_confirmed`.

---

## 2.5 Payment

Represents the normalized billing event or payment setup outcome seen by the app.

### Required fields

- `payment_id`
- `order_id`
- `provider`
- `status`
- `amount`
- `currency`
- `reference`

### Optional fields

- `subscription_id`
- `provider_session_id`
- `provider_payment_id`
- `provider_invoice_id`
- `paid_at`
- `failed_at`
- `failure_reason`

### Notes

- This is the app-level normalized payment object.
- Provider-specific raw payloads should not be exposed directly to UI code.

---

## 2.6 Request

Represents a non-subscription commercial service request.

### Required fields

- `request_id`
- `customer_id`
- `request_type`
- `status`
- `summary`
- `crm_request_id`
- `created_at`
- `updated_at`

### Optional fields

- `order_id`

### Allowed request types

- `audit`
- `renewal`
- `application`
- `support`

---

## 2.7 PreferenceProfile

Represents the customer's email/preferences state as used by the app.

### Required fields

- `customer_id`
- `email`
- `global_opt_out`
- `categories`
- `updated_at`
- `crm_sync_status`

### Notes

- This aligns with the existing CRM-backed notification preferences flow.

---

## 2.8 CommercialEntryToken

Represents a tokenized entry path into a commercial flow.

### Required fields

- `token`
- `customer_id`
- `entry_type`
- `expires_at`
- `status`

### Optional fields

- `context_payload`

### Notes

- This supports the current monitoring subscription link pattern and future TMH-specific email-linked commerce flows.

---

## 2.9 CheckoutIntent

Represents the persisted basket snapshot used during checkout and confirmation.

### Required fields

- `checkout_intent_id`
- `customer_id`
- `order_id`
- `token`
- `billing_interval`
- `basket_snapshot`
- `summary_snapshot`
- `payment_status`
- `created_at`

### Notes

- Confirmation should read this persisted snapshot, not recalculate a fresh basket.

---

## 3. Relationship summary

- One `Customer` may have many `Orders`
- One `Customer` may have many `Subscriptions`
- One `Order` has many `OrderLines`
- One `Order` may create zero or one `Subscription`
- One `Order` may have many `Payments`
- One `Customer` may have many `Requests`
- One `Customer` has one current `PreferenceProfile`
- One `CommercialEntryToken` resolves to one `Customer` and one commercial context
- One `CheckoutIntent` belongs to one `Order`

---

## 4. Explicit exclusions from the v1 model

The following should not become primary app-level entities in this phase:

- Brand Portfolio
- Watchlist
- Trademark as an account-workspace object
- Result
- Report
- Alert
- Workspace membership model
- White-label tenant/provider abstractions

These may exist as source records or later reference concepts, but they must not drive the current commerce app model.

---

## 5. Locked implementation rule

> The TMH Commerce Extension should be implemented against this normalized commerce model: Customer, Subscription, Order, OrderLine, Payment, Request, PreferenceProfile, CommercialEntryToken, and CheckoutIntent. Zoho module names and payment-provider details may vary underneath, but the app boundary must remain provider-neutral and commerce-focused.
