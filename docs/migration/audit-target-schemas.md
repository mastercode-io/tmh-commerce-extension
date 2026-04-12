# Audit Target Schemas

This document defines the recommended target-side schemas for implementing the audit flow inside `tmh-commerce-extension`.

The audit flow should remain a dedicated wizard, not a thin wrapper around the target app’s generic request create route.

## 1. Route Family

Recommended target route family:
- `POST /api/audit/lead`
- `POST /api/audit/orders/sections`
- `GET /api/audit/orders/:orderId`
- `POST /api/audit/orders/:orderId/payment`
- `GET /api/audit/orders/:orderId/confirmation`
- `POST /api/temmy/search`

Suggested page routes:
- `/audit`
- `/audit/summary/[orderId]`
- `/audit/confirmation/[orderId]`

## 2. `POST /api/audit/lead`

Purpose:
- incremental lead upsert for early wizard stages

Request:

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

Response:

```json
{
  "token": "lead_tok_123",
  "lead": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000"
  },
  "request": {
    "requestId": "req_123",
    "requestType": "audit",
    "status": "submitted",
    "summary": "Trademark audit request",
    "createdAt": "2026-04-12T10:00:00.000Z",
    "updatedAt": "2026-04-12T10:00:00.000Z",
    "reference": "TMH-AUD-REQ-123"
  }
}
```

Notes:
- returning `RequestSummary` is optional at the beginning but useful
- keep `token` dedicated to wizard continuation

## 3. `POST /api/audit/orders/sections`

Purpose:
- create or update the audit order progressively by section

Request:

```json
{
  "orderId": "optional_until_created",
  "token": "lead_tok_123",
  "section": "contact",
  "data": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000"
  }
}
```

Allowed `section` values:
- `contact`
- `preferences`
- `tmStatus`
- `temmy`
- `tmInfo`
- `goods`
- `billing`
- `appointment`
- `paymentOptions`

Response:

```json
{
  "orderId": "aud_ord_123",
  "success": true,
  "message": "Section saved successfully",
  "orderStatus": "draft"
}
```

For payment section:

```json
{
  "orderId": "aud_ord_123",
  "success": true,
  "message": "Payment created successfully",
  "checkoutUrl": "https://...",
  "orderStatus": "pending_checkout"
}
```

## 4. `GET /api/audit/orders/:orderId`

Purpose:
- load complete audit order state for summary and confirmation

Response:

```json
{
  "orderId": "aud_ord_123",
  "dealId": "zoho_deal_123",
  "status": "draft",
  "currency": "GBP",
  "createdAt": "2026-04-12T10:00:00.000Z",
  "updatedAt": "2026-04-12T10:10:00.000Z",
  "request": {
    "requestId": "req_123",
    "requestType": "audit",
    "status": "submitted",
    "summary": "Trademark audit request",
    "createdAt": "2026-04-12T10:00:00.000Z",
    "updatedAt": "2026-04-12T10:10:00.000Z",
    "orderId": "aud_ord_123",
    "reference": "TMH-AUD-REQ-123"
  },
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
      "tmAppNumber": "UK00003456789",
      "tmName": ""
    },
    "temmy": {
      "selected": "UK00003456789",
      "results": {
        "items": []
      }
    },
    "goods": {
      "description": "Software development",
      "website": "https://example.com"
    },
    "billing": {
      "type": "Organisation",
      "companyName": "Tech Innovations Ltd",
      "address": {
        "line1": "123 High Street",
        "line2": "Suite 4B",
        "city": "Manchester",
        "county": "Greater Manchester",
        "postcode": "M1 1AA",
        "country": "United Kingdom"
      },
      "invoiceEmail": "finance@example.com",
      "invoicePhone": "+44 161 123 4567"
    },
    "appointment": {
      "scheduled": false,
      "skipped": true
    }
  },
  "pricing": {
    "lineItems": [
      {
        "orderLineId": "ol_1",
        "orderId": "aud_ord_123",
        "lineType": "service_request",
        "label": "Trademark Audit",
        "quantity": 1,
        "unitPrice": 99,
        "disposition": "payable_now"
      }
    ],
    "subtotal": 59,
    "vat": 11.8,
    "total": 70.8
  },
  "payment": {
    "paymentId": "pay_123",
    "status": "initiated"
  }
}
```

Important rule:
- pricing should be server-authoritative in the target app
- do not preserve the current client-side price math as the source of truth

## 5. `POST /api/audit/orders/:orderId/payment`

Purpose:
- create payment or hosted checkout for the audit order

Request:

```json
{
  "paymentOptions": {
    "termsAccepted": true,
    "socialMediaAddon": true
  }
}
```

Response:

```json
{
  "orderId": "aud_ord_123",
  "checkoutUrl": "https://...",
  "order": {
    "orderId": "aud_ord_123",
    "kind": "service_request",
    "status": "pending_checkout",
    "currency": "GBP",
    "totalDueNow": 70.8,
    "createdAt": "2026-04-12T10:00:00.000Z",
    "reference": "TMH-AUD-ORD-123"
  },
  "payment": {
    "paymentId": "pay_123",
    "status": "initiated",
    "reference": "TMH-AUD-PAY-123"
  }
}
```

## 6. `GET /api/audit/orders/:orderId/confirmation`

Purpose:
- resolve confirmation screen after hosted payment

Response:

```json
{
  "orderId": "aud_ord_123",
  "paymentStatus": "succeeded",
  "confirmedAt": "2026-04-12T10:15:00.000Z",
  "reference": "TMH-AUD-ORD-123"
}
```

## 7. Temmy Search Contract

Target app can preserve this route mostly as-is:
- `POST /api/temmy/search`

Request:

```json
{
  "application_number": "UK00003456789"
}
```

or:

```json
{
  "text": "TECHIFY"
}
```

Response:

```json
{
  "source": "live",
  "data": {
    "items": [
      {
        "application_number": "UK00003456789",
        "verbal_element_text": "TECHIFY",
        "status": "Registered",
        "expiry_date": "2026-08-15",
        "applicants": [
          {
            "name": "Tech Innovations Ltd"
          }
        ]
      }
    ]
  }
}
```

## 8. Validation Rules To Keep In Contract

Contact:
- first name required
- last name required
- email required and valid
- phone required and valid

Preferences:
- at least one contact method required

Trademark status:
- `existing` or `new`

Existing search:
- at least one of:
  - trademark name
  - application number

New trademark:
- type required
- name required when type is `Word` or `Both`
- at least one jurisdiction required
- custom jurisdiction required when the “other” bucket is chosen

Billing:
- billing type required
- billing name fields by type required
- address line 1, city, postcode required
- invoice email and phone required

Payment:
- terms must be accepted

## 9. Mapping Into Target App Types

Recommended summary mapping:
- audit submission lifecycle -> `RequestSummary` with `requestType: 'audit'`
- payable audit output -> `OrderSummary`
- audit payment -> `PaymentSummary`

Keep wizard-section detail payloads outside the normalized summary types.

## 10. Minimum Implementation Rule

Do not collapse the audit wizard into a single request form just because the target app already has `POST /api/requests`.

Parity requires:
- wizard-specific routes
- wizard-specific contracts
- server-side section persistence
- summary and confirmation reads by `orderId`
