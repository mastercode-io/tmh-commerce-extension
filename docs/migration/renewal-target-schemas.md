# Renewal Target Schemas

This document defines the recommended target-side schemas for implementing the renewal flow inside `tmh-commerce-extension`.

These schemas are designed to:
- preserve `multi-deal-order` renewal behavior
- support true multi-renewal selection
- fit the target app's normalized commerce approach
- avoid reusing the source repo's fragile URL-embedded order payload pattern

## 1. Route Family

Recommended target route family:
- `GET /api/renewals/details?token=...`
- `POST /api/renewals/orders`
- `GET /api/renewals/orders/:orderId`
- `POST /api/renewals/orders/:orderId/payment-link`
- `GET /api/renewals/orders/:orderId/payment-status`

Optional page routes:
- `/renewal`
- `/orders/[orderId]`
- `/orders/[orderId]/confirmation`

You can rename the route group, but keep the contract separation.

## 2. `GET /api/renewals/details?token=...`

Purpose:
- resolve tokenized renewal context for the landing flow

Success response:

```json
{
  "token": "tok_123",
  "account": {
    "type": "organization",
    "name": "Tech Innovations Ltd",
    "companyNumber": "09876543",
    "vatNumber": "GB123456789",
    "address": {
      "line1": "123 High Street",
      "line2": "Suite 4B",
      "city": "Manchester",
      "postcode": "M1 1AA",
      "country": "United Kingdom"
    }
  },
  "contact": {
    "firstName": "Sarah",
    "lastName": "Johnson",
    "email": "sarah.johnson@techinnovations.com",
    "mobile": "+44 7700 900123",
    "phone": "+44 161 123 4567",
    "position": "Managing Director"
  },
  "primaryTrademark": {
    "id": "tm_001",
    "wordMark": "TECHIFY",
    "markType": "Word Mark",
    "status": "Registered",
    "jurisdiction": "UK",
    "applicationNumber": "UK00003456789",
    "registrationNumber": "UK00003456789",
    "applicationDate": "2014-06-20",
    "registrationDate": "2015-06-20",
    "expiryDate": "2025-06-20",
    "nextRenewalDate": "2025-06-20",
    "imageUrl": null,
    "classes": [
      {
        "nice": "9",
        "description": "Computer software"
      }
    ],
    "classesCount": 1,
    "proprietor": {
      "name": "Tech Innovations Ltd",
      "address": "123 High Street, Manchester, M1 1AA, United Kingdom"
    }
  },
  "additionalRenewals": [
    {
      "id": "tm_002",
      "wordMark": "INNOVATE PRO",
      "markType": "Logo",
      "status": "Registered",
      "jurisdiction": "UK",
      "applicationNumber": "UK00003567890",
      "registrationNumber": "UK00003567890",
      "applicationDate": "2015-08-15",
      "registrationDate": "2016-08-15",
      "expiryDate": "2026-08-15",
      "nextRenewalDate": "2026-08-15",
      "imageUrl": "https://cdn.example.com/trademarks/tm_002.png",
      "classes": [],
      "classesCount": 3,
      "proprietor": {
        "name": "Tech Innovations Ltd",
        "address": "123 High Street, Manchester, M1 1AA, United Kingdom"
      }
    }
  ],
  "links": {
    "bookCall": "https://bookings.thetrademarkhelpline.com/#/4584810000004811044",
    "termsConditions": "https://www.thetrademarkhelpline.com/terms-and-conditions",
    "managePreferences": "https://portal.thetrademarkhelpline.com/preferences"
  }
}
```

Notes:
- Use camelCase in the target app contract
- Keep `token` out of reusable nested objects
- Split source `trademark` and `next_due` into:
  - `primaryTrademark`
  - `additionalRenewals`

## 3. `POST /api/renewals/orders`

Purpose:
- create or update a renewal order from the landing flow

This is the critical replacement for the source repo’s incomplete multi-renewal submit payload.

Request:

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
    "selectedTrademarkIds": [
      "tm_001",
      "tm_002",
      "tm_003"
    ]
  },
  "consents": {
    "authorisedToRenew": true,
    "contactConsent": true
  },
  "context": {
    "utmSource": "google",
    "utmMedium": "cpc",
    "utmCampaign": "renewals",
    "utmTerm": "trademark renewal",
    "utmContent": "ad-1",
    "referrer": "https://www.google.com/",
    "landingPath": "/renewal?token=tok_123"
  }
}
```

Validation rules:
- `token` required
- `contact.firstName` required
- `contact.lastName` required
- `contact.email` required and valid
- `contact.phone` required
- both screening fields required
- self-serve submission allowed only when both screening values are `false`
- `selection.primaryTrademarkId` required
- `selection.selectedTrademarkIds` required and must include primary trademark
- `consents.authorisedToRenew` must be `true`
- `consents.contactConsent` must be `true`

Response:

```json
{
  "request": {
    "requestId": "req_123",
    "requestType": "renewal",
    "status": "submitted",
    "summary": "Renewal request for 3 trademarks",
    "createdAt": "2026-04-12T10:00:00.000Z",
    "updatedAt": "2026-04-12T10:00:00.000Z",
    "orderId": "ord_123",
    "reference": "TMH-REN-123"
  },
  "order": {
    "orderId": "ord_123",
    "kind": "service_request",
    "status": "pending_checkout",
    "currency": "GBP",
    "totalDueNow": 912,
    "totalFollowUp": 0,
    "createdAt": "2026-04-12T10:00:00.000Z",
    "reference": "TMH-ORD-123"
  },
  "orderDetails": {
    "orderId": "ord_123",
    "dealToken": "deal_tok_123",
    "currency": "GBP",
    "totals": {
      "subtotal": 760,
      "vat": 152,
      "total": 912
    },
    "trademarks": [
      {
        "id": "tm_001",
        "wordMark": "TECHIFY",
        "registrationNumber": "UK00003456789"
      },
      {
        "id": "tm_002",
        "wordMark": "INNOVATE PRO",
        "registrationNumber": "UK00003567890"
      }
    ],
    "lineItems": [
      {
        "orderLineId": "ol_1",
        "orderId": "ord_123",
        "lineType": "service_request",
        "label": "IPO Renewal Fee",
        "quantity": 1,
        "unitPrice": 200,
        "disposition": "payable_now",
        "sourceRecordId": "tm_001"
      }
    ]
  }
}
```

Notes:
- Return both normalized summary data and the richer detail payload the active renewal order page needs
- This avoids forcing the UI to reassemble display details from account-level summaries

## 4. `GET /api/renewals/orders/:orderId`

Purpose:
- read the server-authoritative renewal order details

Success response:

```json
{
  "orderId": "ord_123",
  "dealToken": "deal_tok_123",
  "pipeline": "Renewal",
  "currency": "GBP",
  "totals": {
    "subtotal": 760,
    "vat": 152,
    "total": 912
  },
  "trademarks": [
    {
      "id": "tm_001",
      "wordMark": "TECHIFY",
      "applicationNumber": "UK00003456789",
      "registrationNumber": "UK00003456789",
      "markType": "Word Mark",
      "classesCount": 2
    }
  ],
  "lineItems": [],
  "payment": {
    "paymentId": "pay_123",
    "status": "initiated"
  },
  "request": {
    "requestId": "req_123",
    "status": "submitted"
  }
}
```

This is the preferred replacement for base64 JSON in the URL.

## 5. `POST /api/renewals/orders/:orderId/payment-link`

Purpose:
- create or retrieve payment link for the order

Request:

```json
{
  "termsAccepted": true
}
```

Response:

```json
{
  "orderId": "ord_123",
  "dealToken": "deal_tok_123",
  "paymentUrl": "https://invoices.xero.com/link/example",
  "payment": {
    "paymentId": "pay_123",
    "status": "initiated",
    "reference": "TMH-PAY-123"
  }
}
```

## 6. `GET /api/renewals/orders/:orderId/payment-status`

Purpose:
- poll normalized payment state for the renewal order

Response:

```json
{
  "orderId": "ord_123",
  "paymentId": "pay_123",
  "status": "pending",
  "updatedAt": "2026-04-12T10:05:00.000Z"
}
```

Canonical statuses for the route:
- `initiated`
- `pending`
- `succeeded`
- `failed`
- `cancelled`

UI mapping:
- `succeeded` -> success redirect
- `pending` -> continue polling
- `failed` -> retry/recheck state
- `cancelled` -> voided/not-found fallback state

## 7. `GET /api/renewals/orders/:orderId/confirmation`

Optional but recommended.

Purpose:
- replace the current client-only confirmation guard with a server-verifiable confirmation read

Response:

```json
{
  "orderId": "ord_123",
  "requestId": "req_123",
  "paymentStatus": "succeeded",
  "confirmedAt": "2026-04-12T10:07:00.000Z",
  "reference": "TMH-ORD-123"
}
```

If this is added, the browser `sessionStorage` token guard becomes a temporary fallback instead of the primary confirmation rule.

## 8. Target Type Mapping

Recommended summary mapping into existing `tmh-commerce-extension` types:
- renewal request -> `RequestSummary` with `requestType: 'renewal'`
- renewal payable entity -> `OrderSummary`
- renewal payment -> `PaymentSummary`

Keep the detail payloads above separate from those summary types.

## 9. Minimum Implementation Rule

Do not implement multi-renewal by silently reusing the old single-field `trademark_number` contract.

The target renewal schema must carry:
- one primary trademark identifier
- the full selected renewal set

Anything less will lose the behavior you explicitly want to preserve.
