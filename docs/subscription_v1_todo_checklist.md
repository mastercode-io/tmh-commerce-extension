# Subscription Onboarding v1 Todo Checklist

## CRM

- [ ] Add subscription fields to **Order**:
  - [ ] `is_subscription_order`
  - [ ] `subscription_interval`
  - [ ] `subscription_status`
  - [ ] `stripe_customer_id`
  - [ ] `stripe_subscription_id`
  - [ ] `stripe_checkout_session_id`
  - [ ] `stripe_latest_invoice_id`
  - [ ] `xero_latest_invoice_id`
  - [ ] `subscription_reference`
  - [ ] `current_period_end`
  - [ ] `cancel_at_period_end`
  - [ ] `cancelled_at`
  - [ ] `last_paid_at`
- [ ] Add Stripe fields to **Service Package**:
  - [ ] `stripe_product_id`
  - [ ] `stripe_monthly_price_id`
  - [ ] `stripe_annual_price_id`
- [ ] Add `stripe_customer_id` to payer record
- [ ] Define `subscription_reference` format
- [ ] Enforce validation: one Order = one subscription agreement
- [ ] Enforce validation: all selected subscription packages must share the same billing frequency

## Stripe

- [ ] Create Stripe Products for all subscription Service Packages
- [ ] Create Stripe Prices for monthly variants
- [ ] Create Stripe Prices for annual variants
- [ ] Decide naming convention for Products and Prices
- [ ] Set up Stripe test mode
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Store webhook signing secret securely

## Backend / Custom API

- [ ] Build endpoint: `create subscription checkout session`
- [ ] Validate selected packages and interval compatibility
- [ ] Create or update Order and Deals in `Pending Checkout`
- [ ] Find or create Stripe Customer
- [ ] Create Stripe Checkout Session in `subscription` mode
- [ ] Pass CRM order identifier in `client_reference_id`
- [ ] Pass useful metadata for webhook reconciliation
- [ ] Return Checkout URL to frontend
- [ ] Build endpoint: `get order/subscription status`

## Webhooks

- [ ] Verify Stripe webhook signature
- [ ] Handle `checkout.session.completed`
- [ ] Handle `invoice.paid`
- [ ] Handle `invoice.payment_failed`
- [ ] Handle `customer.subscription.updated`
- [ ] Handle `customer.subscription.deleted`
- [ ] Update CRM Order status based on webhook events
- [ ] Store Stripe IDs and billing dates on Order
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
- [ ] Redirect to hosted Stripe Checkout URL
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
- [ ] No GoCardless in v1
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

**CRM owns the commercial order, Stripe owns subscription billing, and Xero receives accounting invoices and payments after successful Stripe charges.**
