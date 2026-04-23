# Contract Deltas For `tmh-commerce-extension`

This document describes what must change between the current source behavior and the target app’s normalized commerce contract.

## 1. Renewal Needs A Dedicated Contract

Current target generic request route:
- `POST /api/requests`

Current generic request payload:

```json
{
  "customerId": "optional",
  "email": "optional",
  "requestType": "renewal",
  "summary": "string",
  "details": {}
}
```

This is not enough for full renewal parity.

Reason:
- renewal requires tokenized prefill and trademark hydration
- renewal requires multi-renewal selection
- renewal requires order/payment state
- renewal requires explicit deal/order identifiers and payment lifecycle

Recommendation:
- keep `POST /api/requests` for generic account/history request creation
- add dedicated renewal app API routes for the transactional flow

## 2. Audit Needs A Dedicated Contract

Current target generic request route is also insufficient for audit parity.

Reason:
- audit requires staged writes
- audit requires Temmy search state
- audit requires wizard persistence
- audit requires billing and payment options
- audit eventually produces a payable order

Recommendation:
- keep a normalized `RequestSummary` record for audit
- add dedicated audit route handlers and dedicated Zoho operations for the multi-step flow

## 3. Recommended New Dedicated Operations

## Renewal operations

Suggested operation family:
- `renewal.resolve_token`
- `renewal.create_order`
- `renewal.get_order`
- `renewal.create_payment_link`
- `renewal.get_payment_status`

## Audit operations

Suggested operation family:
- `audit.lead.upsert`
- `audit.order.update_section`
- `audit.order.get`
- `audit.payment.create`

These should live beside the existing target dedicated monitoring operations, not inside the generic `commerce.*` family.

## 4. Multi-Renewal Delta

Current source branch:
- UI supports selecting multiple renewals
- backend request still only carries one `trademark_number`

Target requirement:
- multi-renewal must remain

Therefore the target contract must add an explicit selected-renewals array.

Recommended renewal create-order payload:

```json
{
  "token": "tok_123",
  "contact": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com",
    "phone": "+44 7700 900000"
  },
  "screening": {
    "ownershipChange": false,
    "classesChange": false
  },
  "selection": {
    "primaryTrademarkNumber": "UK0000123456",
    "selectedTrademarkNumbers": [
      "UK0000123456",
      "UK0000654321",
      "UK0000789012"
    ]
  },
  "consents": {
    "authorisedToRenew": true,
    "contactConsent": true
  }
}
```

## 5. Server-Authoritative Order Retrieval Delta

Current source renewal branch:
- order data passed through URL as base64 JSON

Target recommendation:
- create order on server
- redirect with stable identifier only
- read order from server on the destination route

Target shape should follow existing commerce patterns:
- active flow uses detail payload
- account/history surfaces use normalized summaries

## 6. Payment Status Delta

Current source statuses:
- `paid`
- `pending`
- `voided`
- `not_found`
- `failed`
- client-side timeout

Target normalized payment statuses:
- `initiated`
- `pending`
- `succeeded`
- `failed`
- `cancelled`

Recommended mapping:
- `paid` -> `succeeded`
- `pending` -> `pending`
- `failed` -> `failed`
- `voided` -> `cancelled`
- `not_found` -> `cancelled` or `failed`

Business decision still required:
- whether `not_found` means “cancelled/expired link” or “upstream failure”

## 7. Request / Order Dual-Record Delta

For both renewal and audit, the target app should likely maintain both:
- `RequestSummary` for tracking the commercial request
- `OrderSummary` when a payable commercial order is created

Recommended stance:
- request record starts early
- order record appears when pricing / payable state exists
- account surfaces show both in their respective lists

## 8. Identity Delta

Current target app still allows query-param customer identity for some account/request routes.

For migrated renewal/audit flows:
- tokenized public entry may still be acceptable for marketing-linked flows
- authenticated customer context should be used once the user is inside account/history surfaces

Do not build long-term renewal/audit confirmation/account visibility on query-param customer identity.

## 9. Minimum Contracts To Define Next

Before implementation in the target app, lock these three schemas:

1. Renewal details response schema
2. Renewal create-order request/response schema with multi-renewal support
3. Audit section-write schema and audit order-read schema

That is enough to unblock the target-side route and adapter work without dragging old page structure into the new app.
