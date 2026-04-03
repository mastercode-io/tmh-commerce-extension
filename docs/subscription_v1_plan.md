# Subscription Onboarding v1 Plan

## 1. Core architecture

Use this split:

- **CRM** = commercial/order system and operational state
- **Stripe** = checkout and subscription engine
- **Xero** = downstream accounting ledger

Do **not** use Xero repeating invoices in this version. Once Stripe owns recurring billing, Xero should receive normal accounting invoices and payments per cycle, not act as the recurring engine.

## 2. CRM model

Keep the existing commerce model:

- **Orders** = parent commercial record
- **Deals** = order items / delivery objects
- **Service Packages** = sellable subscription units
- **Products** = atomic accounting SKUs

For v1, keep subscription state on **Order**, not a new module.

This works if you enforce:

- **one Order = one subscription agreement**
- one payer
- one frequency
- one Stripe subscription

### Order fields

- `is_subscription_order`
- `subscription_interval` (`monthly` / `annual`)
- `subscription_status`
- `stripe_customer_id`
- `stripe_subscription_id`
- `stripe_checkout_session_id`
- `stripe_latest_invoice_id`
- `xero_latest_invoice_id`
- `subscription_reference`
- `current_period_end`
- `cancel_at_period_end`
- `cancelled_at`
- `last_paid_at`

## 3. Stripe catalog model

Sync **Service Packages**, not atomic Products, to Stripe:

- `Service Package` ↔ `Stripe Product`
- billing variants ↔ `Stripe Price`

### Store on each sellable package

- `stripe_product_id`
- `stripe_monthly_price_id`
- `stripe_annual_price_id`

### Store on payer/customer

- `stripe_customer_id`

## 4. Supported scope for v1

Support only:

- fixed plans
- monthly or annual
- multiple subscription packages in one Order only if all share the same frequency
- no upgrades/downgrades
- no proration
- no pause/resume
- no mixed monthly and annual in one checkout
- no self-service plan changes yet

## 5. Custom API flow

### Endpoint A: create subscription checkout session

**Input**

- account/contact/payer
- selected service packages
- billing interval

**Backend steps**

1. Validate that all selected packages are subscription-enabled and share one interval.
2. Create or update CRM Order and Deals in `Pending Checkout`.
3. Find or create Stripe Customer.
4. Build Stripe Checkout Session in `subscription` mode using existing Stripe Price IDs.
5. Pass CRM order key in `client_reference_id` and metadata.
6. Return hosted Checkout URL.

### Endpoint B: get subscription/order status

Used by frontend polling after redirect return:

- reads CRM status
- optionally refreshes from Stripe if needed
- returns `pending`, `active`, `failed`, or `cancelled`

Webhooks remain source of truth. Polling is only for UI convenience.

## 6. Stripe webhook plan

Implement one webhook endpoint with signature verification.

### Minimum events to handle

- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Recommended behavior

#### `checkout.session.completed`

- locate Order by `client_reference_id`
- store `stripe_customer_id`
- store `stripe_subscription_id`
- move Order to `Pending Confirmation` or directly `Active`, depending on your rule

#### `invoice.paid`

- mark Order `Active`
- update `last_paid_at`
- update `current_period_end`
- create Xero invoice for this cycle
- create Xero payment against that invoice

#### `invoice.payment_failed`

- mark Order `Past Due`
- notify internal team or customer as needed

#### `customer.subscription.updated`

- sync cancellation flag, period end, and status

#### `customer.subscription.deleted`

- mark Order `Cancelled`

## 7. Stripe checkout flow

1. Customer selects packages.
2. Frontend calls CRM backend create-checkout endpoint.
3. Backend returns Stripe hosted Checkout URL.
4. Frontend redirects customer to Stripe Checkout.
5. Customer completes first payment on the Stripe-hosted page.
6. Stripe redirects to your success or cancel page.
7. Frontend polls your backend for final Order status until webhook processing completes.

Use **hosted Stripe Checkout**, not Elements or custom card UI.

## 8. Xero integration

### Important change

Do **not** create a Xero repeating invoice.

Instead, for every successful Stripe billing cycle, create:

- one normal **ACCREC invoice** in Xero
- one related **Payment** in Xero

### Invoice creation rule

Create the Xero invoice on `invoice.paid`, not earlier.

Reason:

- avoids unpaid or stale accounting invoices if Stripe checkout is abandoned
- keeps Xero aligned to actual successful billings
- one Stripe renewal = one Xero accounting invoice

### Invoice contents

Build Xero invoice lines from your **atomic SKU mapping**, not from Stripe package rows, because account codes and tax codes live at the atomic accounting level.

### Reference strategy

On every Xero invoice, write a stable reference such as:

- `subscription_reference`
- CRM Order number
- Stripe subscription ID

Then fetch from Xero by reference whenever you need invoice or payment history instead of duplicating invoices into CRM.

## 9. What not to build now

Do not build now:

- CRM invoice module
- Xero repeating invoices
- GoCardless branch
- plan changes
- pause/resume
- proration
- customer self-service billing management

## 10. Final Order state model

- `Draft`
- `Pending Checkout`
- `Pending Confirmation`
- `Active`
- `Past Due`
- `Cancel At Period End`
- `Cancelled`

## 11. Final design in one sentence

**CRM creates the commercial order, Stripe Checkout sells and renews the subscription, webhooks update CRM, and each successful Stripe charge creates a normal invoice plus payment in Xero.**
