# Subscription Onboarding v1 Todo Checklist

## Provider Decision Update

As of April 6, 2026:

- v1 subscriptions use the **Xero payment gateway**
- app-level identifiers and statuses must remain provider-neutral
- direct Stripe and direct GoCardless integrations are deferred

Use `TMH_Commerce_Extension_Subscription_Payment_Strategy_v1.md` as the canonical payment-strategy reference where this checklist still reflects older provider-specific assumptions.

## CRM

- [ ] Add subscription fields to **Order**:
  - [ ] `is_subscription_order`
  - [ ] `subscription_interval`
  - [ ] `subscription_status`
  - [ ] `provider_customer_id`
  - [ ] `provider_subscription_id`
  - [ ] `provider_session_id`
  - [ ] `provider_latest_invoice_id`
  - [ ] `xero_latest_invoice_id`
  - [ ] `subscription_reference`
  - [ ] `current_period_end`
  - [ ] `cancel_at_period_end`
  - [ ] `cancelled_at`
  - [ ] `last_paid_at`
- [ ] Add provider-backed package fields to **Service Package**:
  - [ ] `provider_product_id`
  - [ ] `provider_monthly_price_id`
  - [ ] `provider_annual_price_id`
- [ ] Add `provider_customer_id` to payer record
- [ ] Define `subscription_reference` format
- [ ] Enforce validation: one Order = one subscription agreement
- [ ] Enforce validation: all selected subscription packages must share the same billing frequency

## Payment gateway

- [ ] Configure the Xero payment gateway for the v1 subscription flow
- [ ] Define how provider-backed package and pricing identifiers are stored
- [ ] Set up test/sandbox mode for the hosted payment/setup journey
- [ ] Set up any required webhook or callback verification
- [ ] Store gateway secrets securely

## Backend / Custom API

- [ ] Build endpoint: `create subscription checkout session`
- [ ] Validate selected packages and interval compatibility
- [ ] Create or update Order and Deals in `Pending Checkout`
- [ ] Find or create the provider-backed customer via the v1 gateway
- [ ] Create hosted checkout/setup session
- [ ] Pass CRM order identifier in `client_reference_id`
- [ ] Pass useful metadata for webhook reconciliation
- [ ] Return Checkout URL to frontend
- [ ] Build endpoint: `get order/subscription status`

## Reconciliation

- [ ] Verify gateway callback/webhook signatures where required
- [ ] Handle checkout/session completion
- [ ] Handle successful recurring payment
- [ ] Handle failed recurring payment
- [ ] Handle subscription updates
- [ ] Handle subscription cancellation/deletion
- [ ] Update CRM Order status based on webhook events
- [ ] Store provider IDs and billing dates on Order
- [ ] Make webhook processing idempotent

## Xero

- [ ] Confirm/create Xero contact matching logic
- [ ] Define package-to-atomic-SKU mapping for accounting lines
- [ ] Create normal Xero **ACCREC** invoice on each `invoice.paid`
- [ ] Create related Xero payment on each `invoice.paid`
- [ ] Put stable `subscription_reference` on every Xero invoice
- [ ] Implement Xero invoice retrieval by reference for history views
- [ ] Optionally store `xero_latest_invoice_id` on Order

## Frontend

- [ ] Call backend checkout endpoint from landing page
- [ ] Redirect to hosted Xero payment gateway URL
- [ ] Implement success page
- [ ] Implement cancel page
- [ ] Poll backend order status after redirect
- [ ] Show clear states: pending, active, failed, cancelled

## Scope guards

- [ ] Monthly and annual only
- [ ] No mixed intervals in one checkout
- [ ] No upgrades/downgrades
- [ ] No proration
- [ ] No pause/resume
- [ ] No self-service plan changes
- [ ] No direct provider integration in v1
- [ ] No CRM Invoice module
- [ ] No Xero repeating invoices

## Test scenarios

- [ ] First successful monthly checkout
- [ ] First successful annual checkout
- [ ] Checkout cancelled by user
- [ ] Initial payment failure
- [ ] Renewal payment success
- [ ] Renewal payment failure
- [ ] Subscription cancellation at period end
- [ ] Xero invoice and payment created correctly
- [ ] Xero invoice history fetch by reference works

## Final implementation rule

**CRM owns the commercial order, the v1 Xero payment gateway handles hosted payment/setup, and the app stores only normalized provider-neutral identifiers and statuses.**
