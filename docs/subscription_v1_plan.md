# Subscription Onboarding v1 Plan

## Provider Decision Update

As of April 6, 2026, the v1 subscription payment strategy for this repo has changed:

- v1 uses the **Xero payment gateway** as the hosted payment/setup surface
- app-level subscription and payment fields must remain provider-neutral
- direct Stripe or direct GoCardless integrations are deferred to later releases

Use `TMH_Commerce_Extension_Subscription_Payment_Strategy_v1.md`, `TMH_Commerce_Extension_Canonical_Domain_Model_v1.md`, and `TMH_Commerce_Extension_Status_And_Mapping_Spec_v1.md` as the canonical references where this document conflicts with older provider-specific assumptions.

## 1. Core architecture

Use this split:

- **CRM** = commercial/order system and operational state
- **Xero payment gateway** = v1 hosted payment/setup surface
- **Xero ledger** = downstream accounting ledger

Do **not** use Xero repeating invoices in this version. The v1 app hands off hosted payment/setup through the Xero payment gateway and should keep provider-specific details behind the payment adapter layer.

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
- one provider-backed subscription agreement

### Order fields

- `is_subscription_order`
- `subscription_interval` (`monthly` / `annual`)
- `subscription_status`
- `provider_customer_id`
- `provider_subscription_id`
- `provider_session_id`
- `provider_latest_invoice_id`
- `xero_latest_invoice_id`
- `subscription_reference`
- `current_period_end`
- `cancel_at_period_end`
- `cancelled_at`
- `last_paid_at`

## 3. Payment catalog model

Sync **Service Packages**, not atomic Products, to the v1 payment gateway:

- `Service Package` ↔ provider-backed sellable package
- billing variants ↔ provider-backed billing options

### Store on each sellable package

- `provider_product_id`
- `provider_monthly_price_id`
- `provider_annual_price_id`

### Store on payer/customer

- `provider_customer_id`

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
3. Find or create the provider-backed customer through the v1 gateway.
4. Build the hosted checkout/setup session using the existing provider-backed package identifiers.
5. Pass CRM order key in `client_reference_id` and metadata.
6. Return hosted Checkout URL.

### Endpoint B: get subscription/order status

Used by frontend polling after redirect return:

- reads CRM status
- optionally refreshes from the v1 payment gateway if needed
- returns `pending`, `active`, `failed`, or `cancelled`

Webhooks remain source of truth. Polling is only for UI convenience.

## 6. Payment reconciliation plan

Implement one reconciliation endpoint or webhook handler set with signature verification where the gateway requires it.

### Minimum events to handle

- checkout/session completion event
- successful charge or successful setup event
- failed charge/setup event
- subscription updated event
- subscription cancelled/deleted event

### Recommended behavior

#### Checkout/session completed

- locate Order by `client_reference_id`
- store `provider_customer_id`
- store `provider_subscription_id`
- move Order to `Pending Confirmation` or directly `Active`, depending on your rule

#### Successful recurring charge

- mark Order `Active`
- update `last_paid_at`
- update `current_period_end`
- create Xero invoice for this cycle
- create Xero payment against that invoice

#### Failed recurring charge

- mark Order `Past Due`
- notify internal team or customer as needed

#### Subscription updated

- sync cancellation flag, period end, and status

#### Subscription cancelled/deleted

- mark Order `Cancelled`

## 7. Hosted checkout/setup flow

1. Customer selects packages.
2. Frontend calls CRM backend create-checkout endpoint.
3. Backend returns the hosted payment/setup URL from the v1 gateway.
4. Frontend redirects customer to the hosted gateway flow.
5. Customer completes the first payment or payment setup on the hosted page.
6. The gateway redirects to your success or cancel page.
7. Frontend polls your backend for final Order status until webhook processing completes.

Use the hosted Xero payment gateway flow, not custom embedded payment UI.

## 8. Xero integration

### Important change

Do **not** create a Xero repeating invoice.

Instead, for every successful recurring billing cycle, create:

- one normal **ACCREC invoice** in Xero
- one related **Payment** in Xero

### Invoice creation rule

Create the Xero invoice on `invoice.paid`, not earlier.

Reason:

- avoids unpaid or stale accounting invoices if Stripe checkout is abandoned
- keeps Xero aligned to actual successful billings
- one successful renewal cycle = one Xero accounting invoice

### Invoice contents

Build Xero invoice lines from your **atomic SKU mapping**, not from provider package rows, because account codes and tax codes live at the atomic accounting level.

### Reference strategy

On every Xero invoice, write a stable reference such as:

- `subscription_reference`
- CRM Order number
- provider subscription ID

Then fetch from Xero by reference whenever you need invoice or payment history instead of duplicating invoices into CRM.

## 9. What not to build now

Do not build now:

- CRM invoice module
- Xero repeating invoices
- direct provider integrations
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

**CRM creates the commercial order, the v1 Xero payment gateway handles hosted payment/setup, normalized payment events update CRM, and each successful recurring charge creates the required accounting records in Xero.**
