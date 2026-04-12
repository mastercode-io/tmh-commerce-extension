# Source Fixtures And Examples

This document captures source-side examples that should be used as reference fixtures during the rebuild.

Use them for:
- API handler tests
- UI integration tests
- adapter normalization tests
- manual parity checks

## 1. Renewal Details Example

Primary source:
- `api/_lib/mock-data.js`
- `docs/RENEWAL-PAYLOAD-SPEC.md`

Representative source payload:

```json
{
  "account": {
    "type": "organization",
    "name": "Tech Innovations Ltd",
    "company_number": "09876543",
    "vat_number": "GB123456789",
    "address": {
      "line1": "123 High Street",
      "line2": "Suite 4B",
      "city": "Manchester",
      "postcode": "M1 1AA",
      "country": "United Kingdom"
    }
  },
  "contact": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@techinnovations.com",
    "mobile": "+44 7700 900123",
    "phone": "+44 161 123 4567",
    "position": "Managing Director"
  },
  "trademark": {
    "id": "tm_001",
    "word_mark": "TECHIFY",
    "mark_type": "Word Mark",
    "status": "Registered",
    "jurisdiction": "UK",
    "application_number": "UK00003456789",
    "registration_number": "UK00003456789",
    "application_date": "2014-06-20",
    "registration_date": "2015-06-20",
    "expiry_date": "2025-06-20",
    "next_renewal_date": "2025-06-20",
    "image_url": null,
    "classes_count": 2
  },
  "next_due": [
    {
      "id": "tm_002",
      "word_mark": "INNOVATE PRO",
      "registration_number": "UK00003567890",
      "classes_count": 3
    },
    {
      "id": "tm_003",
      "word_mark": "SMARTECH",
      "registration_number": "UK00003678901",
      "classes_count": 1
    }
  ],
  "links": {
    "book_call": "https://bookings.thetrademarkhelpline.com/#/4584810000004811044",
    "manage_prefs": "https://portal.thetrademarkhelpline.com/preferences",
    "terms_conditions": "https://www.thetrademarkhelpline.com/terms-and-conditions"
  }
}
```

Use this fixture to verify:
- tokenized prefill rendering
- organization contact hydration
- primary trademark rendering
- additional renewals selection UI

## 2. Renewal Submit Example: Current Source

Primary source:
- `public/renewal/uktm/assets/js/main.js`

Current source request payload:

```json
{
  "token": "tok_123",
  "source": "renewal-landing",
  "type": "lead",
  "data": {
    "first_name": "Sarah",
    "last_name": "Johnson",
    "email": "sarah.johnson@techinnovations.com",
    "phone": "+44 7700 900123",
    "trademark_number": "UK00003456789"
  }
}
```

Important note:
- this is not multi-renewal complete
- it proves the source branch still serializes only one trademark identifier

## 3. Renewal Submit Example: Required Target Replacement

This is the fixture the rebuilt target app should satisfy:

```json
{
  "token": "tok_123",
  "source": "renewal-landing",
  "contact": {
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@techinnovations.com",
    "phone": "+44 7700 900123"
  },
  "screening": {
    "ownershipChange": false,
    "classesChange": false
  },
  "selection": {
    "primaryTrademarkId": "tm_001",
    "selectedTrademarkIds": ["tm_001", "tm_002", "tm_003"]
  },
  "consents": {
    "authorisedToRenew": true,
    "contactConsent": true
  }
}
```

Use this as the migration acceptance fixture for real multi-renewal.

## 4. Renewal Order Example

Primary source:
- `api/_lib/mock-data.js`
- `api/_services/renewal.js`

Representative source order payload:

```json
{
  "deal_id": "D-000001",
  "deal_token": "mock_deal_token",
  "contact_id": "C-000001",
  "account_id": "A-000001",
  "subtotal": 760,
  "vat": 152,
  "total": 912,
  "currency": "GBP",
  "line_items": [
    {
      "sku": "UKIPOTMREN",
      "name": "IPO Renewal Fee",
      "quantity": 1,
      "unit_price": 200,
      "total": 200
    },
    {
      "sku": "UKTMRENNEW",
      "name": "TMH Professional Fee",
      "quantity": 1,
      "unit_price": 450,
      "total": 450
    },
    {
      "sku": "UKCLASSADMIN",
      "name": "Additional Class Admin",
      "quantity": 1,
      "unit_price": 110,
      "total": 110
    }
  ]
}
```

Use this fixture to verify:
- totals normalization
- line-item rendering
- order summary mapping into `OrderSummary`

## 5. Renewal Payment Examples

Primary source:
- `api/_lib/mock-data.js`
- `api/_services/renewal.js`
- `public/renewal/uktm/assets/js/order.js`

Representative payment-link payload:

```json
{
  "payment_url": "https://invoices.xero.com/link/example",
  "deal_token": "mock_deal_token"
}
```

Representative payment-status payload:

```json
{
  "deal_token": "mock_deal_token",
  "status": "pending",
  "updated_at": "2026-04-12T10:00:00.000Z"
}
```

Source terminal statuses to preserve in adapter tests:

```json
["paid", "pending", "voided", "not_found", "failed", "timeout"]
```

## 6. Audit Lead Example

Primary source:
- `dev:api/_services/audit.js`
- `dev:public/audit/assets/js/wizard.js`

Representative source lead request:

```json
{
  "token": "optional_after_first_submit",
  "lead": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000"
  }
}
```

Representative source lead response:

```json
{
  "token": "lead_tok_123",
  "lead": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000"
  }
}
```

## 7. Audit Section Update Examples

Primary source:
- `dev:api/_services/audit.js`

Representative section write:

```json
{
  "orderId": "aud_ord_123",
  "section": "preferences",
  "data": {
    "methods": ["Phone", "SMS", "WhatsApp", "Email"]
  }
}
```

Representative contact section write:

```json
{
  "orderId": null,
  "section": "contact",
  "data": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000"
  }
}
```

Representative payment-options section write:

```json
{
  "orderId": "aud_ord_123",
  "section": "paymentOptions",
  "data": {
    "termsAccepted": true,
    "socialMediaAddon": false
  }
}
```

## 8. Audit Order Read Example

This is the shape the target app should preserve semantically even if the final fields are normalized differently:

```json
{
  "orderId": "aud_ord_123",
  "dealId": "zoho_deal_123",
  "sections": {
    "contact": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com",
      "phone": "+44 7700 900000"
    },
    "preferences": {
      "methods": ["Email", "Phone"]
    },
    "tmStatus": {
      "status": "existing",
      "tmAppNumber": "UK00003456789"
    },
    "goods": {
      "description": "Software development",
      "website": "https://example.com"
    }
  },
  "subtotal": 59,
  "vat": 11.8,
  "total": 70.8,
  "status": "pending"
}
```

## 9. Generic Order / Payment Example

Primary source:
- `dev:public/assets/js/order.js`

Use the generic order flow only as a pattern fixture for:
- loading order details by stable identifier
- initial loading state
- normalized order/payment status handling

Do not use it as the source of truth for renewal or audit entry behavior.

## 10. Recommended Fixture Set For The Rebuild

Minimum fixture set to carry into `tmh-commerce-extension`:

- `renewal-details.organization.json`
- `renewal-details.individual.json`
- `renewal-create-order.single.json`
- `renewal-create-order.multi.json`
- `renewal-order-summary.json`
- `renewal-payment.pending.json`
- `renewal-payment.paid.json`
- `renewal-payment.failed.json`
- `audit-lead.create.json`
- `audit-section.contact.json`
- `audit-section.preferences.json`
- `audit-order.read.json`

If only one fixture set is carried over, prioritize renewal first because that is the explicit primary migration target.
