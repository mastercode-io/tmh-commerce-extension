# Field Mapping

This document maps source fields into recommended target-app field names.

The main goals are:
- preserve source business meaning
- move the target app to consistent camelCase contracts
- keep CRM-specific naming isolated behind adapters

## 1. Renewal Details Mapping

## Source -> Target

### Account

- `account.type` -> `account.type`
- `account.name` -> `account.name`
- `account.company_number` -> `account.companyNumber`
- `account.vat_number` -> `account.vatNumber`
- `account.address.line1` -> `account.address.line1`
- `account.address.line2` -> `account.address.line2`
- `account.address.city` -> `account.address.city`
- `account.address.postcode` -> `account.address.postcode`
- `account.address.country` -> `account.address.country`

### Contact

- `contact.first_name` -> `contact.firstName`
- `contact.last_name` -> `contact.lastName`
- `contact.email` -> `contact.email`
- `contact.mobile` -> `contact.mobile`
- `contact.phone` -> `contact.phone`
- `contact.position` -> `contact.position`

### Primary trademark

- `trademark.id` -> `primaryTrademark.id`
- `trademark.word_mark` -> `primaryTrademark.wordMark`
- `trademark.mark_type` -> `primaryTrademark.markType`
- `trademark.status` -> `primaryTrademark.status`
- `trademark.jurisdiction` -> `primaryTrademark.jurisdiction`
- `trademark.application_number` -> `primaryTrademark.applicationNumber`
- `trademark.registration_number` -> `primaryTrademark.registrationNumber`
- `trademark.application_date` -> `primaryTrademark.applicationDate`
- `trademark.registration_date` -> `primaryTrademark.registrationDate`
- `trademark.expiry_date` -> `primaryTrademark.expiryDate`
- `trademark.next_renewal_date` -> `primaryTrademark.nextRenewalDate`
- `trademark.image_url` -> `primaryTrademark.imageUrl`
- `trademark.classes_count` -> `primaryTrademark.classesCount`

### Additional renewals

- `next_due[]` -> `additionalRenewals[]`
- `next_due[].word_mark` -> `additionalRenewals[].wordMark`
- `next_due[].application_number` -> `additionalRenewals[].applicationNumber`
- `next_due[].registration_number` -> `additionalRenewals[].registrationNumber`

### Links

- `links.book_call` -> `links.bookCall`
- `links.manage_prefs` -> `links.managePreferences`
- `links.terms_conditions` -> `links.termsConditions`
- `links.pay_now` -> avoid in details payload unless business really needs it

## 2. Renewal Submit Mapping

Current source submit:

- `data.first_name`
- `data.last_name`
- `data.email`
- `data.phone`
- `data.trademark_number`

Recommended target submit:

- `contact.firstName`
- `contact.lastName`
- `contact.email`
- `contact.phone`
- `selection.primaryTrademarkId`
- `selection.selectedTrademarkIds`
- `screening.ownershipChange`
- `screening.classesChange`
- `consents.authorisedToRenew`
- `consents.contactConsent`

## 3. Renewal Order Mapping

Source summary fields:
- `deal_id`
- `deal_token`
- `subtotal`
- `vat`
- `total`
- `line_items`
- `trademark`

Recommended target detail fields:
- `orderId`
- `dealToken`
- `totals.subtotal`
- `totals.vat`
- `totals.total`
- `lineItems`
- `trademarks`

Recommended target summary fields for account surfaces:
- `OrderSummary.orderId`
- `OrderSummary.kind`
- `OrderSummary.status`
- `OrderSummary.currency`
- `OrderSummary.totalDueNow`
- `OrderSummary.reference`

## 4. Audit Lead Mapping

Source lead fields created in the wizard:
- `first_name`
- `last_name`
- `email`
- `phone`
- `preferred_methods_of_contact`
- `trademark_status`
- `trademark_name`
- `trademark_application_number`
- `trademark_types`
- `trademark_jurisdictions`
- `trademark_other_jurisdiction`
- `trademark_image_choice`
- `trademark_image_file`
- `goods_description`
- `website`
- `billing_type`
- `billing_first_name`
- `billing_last_name`
- `billing_company_name`
- `billing_address`
- `billing_invoice_email`
- `billing_invoice_phone`

Recommended target contract shape:

- `sections.contact.firstName`
- `sections.contact.lastName`
- `sections.contact.email`
- `sections.contact.phone`
- `sections.preferences.methods`
- `sections.tmStatus.status`
- `sections.tmStatus.tmName`
- `sections.tmStatus.tmAppNumber`
- `sections.tmInfo.types`
- `sections.tmInfo.name`
- `sections.tmInfo.jurisdictions`
- `sections.tmInfo.otherJurisdiction`
- `sections.tmInfo.imageUploadChoice`
- `sections.tmInfo.imageFile`
- `sections.goods.description`
- `sections.goods.website`
- `sections.billing.type`
- `sections.billing.firstName`
- `sections.billing.lastName`
- `sections.billing.companyName`
- `sections.billing.address`
- `sections.billing.invoiceEmail`
- `sections.billing.invoicePhone`

In other words:
- prefer section-structured writes in the target app
- do not keep flattening wizard data into CRM-style field names at the UI boundary

## 5. Audit Summary Mapping

Source:
- `sections`
- `subtotal`
- `vat`
- `total`
- `status`

Recommended target:
- `sections`
- `pricing.subtotal`
- `pricing.vat`
- `pricing.total`
- `status`

## 6. Payment Status Mapping

Source renewal page statuses:
- `paid`
- `pending`
- `voided`
- `not_found`
- `failed`

Target `PaymentSummary.status`:
- `succeeded`
- `pending`
- `cancelled`
- `failed`

Recommended mapping:
- `paid` -> `succeeded`
- `pending` -> `pending`
- `voided` -> `cancelled`
- `not_found` -> `cancelled` or `failed`
- `failed` -> `failed`

## 7. Request Type Mapping

Source business flows:
- renewal
- audit
- application
- support / callback

Target request types already available:
- `renewal`
- `audit`
- `application`
- `support`

This is a clean match and should be preserved.

## 8. Rule For Adapters

UI layer:
- should use target camelCase contracts

Server adapter layer:
- should translate to/from source CRM field names and response wrappers

Do not let source snake_case CRM naming leak into the new React component contracts unless there is a very specific reason.
