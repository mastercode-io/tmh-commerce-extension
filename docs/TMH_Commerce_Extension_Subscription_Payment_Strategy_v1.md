# TMH Commerce Extension — Subscription Payment Strategy v1

## Status
Locked planning artifact for the current TMH commerce implementation phase.

## Purpose

Document the agreed v1 subscription payment strategy so the repo no longer contains conflicting assumptions about direct Stripe integration versus direct GoCardless integration.

---

## 1. Locked decision

For subscriptions specifically in v1, the TMH Commerce Extension will use the **Xero payment gateway** as the hosted payment/setup surface.

This is sufficient for the current release because it already supports the required payment-provider integrations for TMH's immediate commercial flows.

Direct provider integrations will be added in later releases if and when the v1 approach becomes limiting.

---

## 2. Consequences of this decision

### What the app should do

- create a normalized checkout intent
- hand off to the Xero payment gateway via hosted redirect
- reconcile the resulting payment/subscription state back into normalized app-level commerce objects
- keep app models provider-neutral

### What the app should not do in v1

- build direct Stripe checkout-specific app contracts
- build direct GoCardless billing-request-specific app contracts
- expose provider-specific field names at the UI boundary
- block current delivery on a final direct-integration architecture

---

## 3. Provider-neutral field rule

At the app boundary, use:

- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `provider_payment_id`
- `provider_invoice_id`
- `provider_session_id`

Do not use app-level fields such as:

- `stripe_customer_id`
- `stripe_subscription_id`
- `gocardless_mandate_id`
- `gocardless_billing_request_id`

unless they are inside provider-specific adapter internals.

---

## 4. v1 system responsibilities

### Zoho

- commercial system of record
- customer/contact/account identity
- order and request records
- normalized subscription and payment references needed by the app

### Xero payment gateway

- hosted payment/setup handoff surface for v1 subscriptions
- provider-facing payment integration layer for the current release

### TMH Commerce Extension app

- basket and checkout-intent orchestration
- server-side validation and pricing
- normalization of CRM and payment state
- user-facing success/failure/pending experience

---

## 5. Route contract rule

Public app routes should remain commerce-focused and provider-neutral:

- `GET /api/subscribe/monitoring`
- `POST /api/subscribe/monitoring/quote`
- `POST /api/subscribe/monitoring/checkout`
- `GET /api/subscribe/monitoring/confirm`

These routes should not be renamed to provider-specific paths in v1.

---

## 6. Future migration rule

When TMH later replaces the Xero payment gateway with direct provider integrations:

- keep the app-level domain model unchanged
- keep app-level statuses unchanged
- swap implementation details inside the payment adapter layer
- migrate provider-specific references without changing UI contracts unless absolutely necessary

---

## 7. Locked implementation rule

> In v1, subscriptions use the Xero payment gateway as the hosted payment/setup surface. The TMH Commerce Extension must model subscriptions with provider-neutral fields and keep direct Stripe/GoCardless assumptions out of the app boundary until a later release explicitly changes the strategy.
