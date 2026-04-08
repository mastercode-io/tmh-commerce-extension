# TMH Commerce Extension — Production Config Checklist v1

## Status

Active supportability artifact for WS7 production hardening.

## Purpose

Define the minimum environment, route, and validation checklist needed before the TMH Commerce Extension can be considered production-ready.

## Required Environment Variables

| Variable | Required For | Production Requirement |
| --- | --- | --- |
| `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL` | Email preferences | Must point to the Zoho custom API that loads and saves preference profiles |
| `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` | Monitoring subscription checkout | Must point to the Zoho custom API that resolves tokens, creates checkout intents, and confirms checkout |
| `ZOHO_COMMERCE_CUSTOM_API_URL` | Account visibility and service requests | Must point to the Zoho custom API for account summary, customer lookup, order/subscription/payment/request reads, and request creation |
| `TMH_REQUIRE_ZOHO_MONITORING_SUBSCRIPTION` | Subscription strict mode | Set to `true` outside local demo environments |
| `TMH_GENERAL_ENQUIRY_BOOKING_URL` | Booking handoff | Must point to the approved TMH booking URL |
| `DEV_MODE` | Debug output | Must be unset or `false` in production |

## Route Validation Checklist

| Route | Required Validation |
| --- | --- |
| `GET /api/settings/notifications?email=...` | Returns a normalized preference profile, `crmSyncStatus`, and `x-correlation-id` |
| `POST /api/settings/notifications` | Rejects malformed payloads locally and saves valid preference updates through Zoho |
| `GET /api/subscribe/monitoring?token=...` | Resolves a real Zoho-backed token and returns eligible monitoring items |
| `POST /api/subscribe/monitoring/quote` | Validates selected items server-side and returns authoritative quote classification |
| `POST /api/subscribe/monitoring/checkout` | Creates a persisted checkout intent and returns a hosted Xero gateway redirect |
| `GET /api/subscribe/monitoring/confirm` | Reads persisted checkout/order/payment/subscription state and returns normalized success, pending, failed, or cancelled state |
| `GET /api/account/summary?customerId=...` | Returns normalized customer, order, subscription, payment, and request summaries |
| `GET /api/account/orders?customerId=...` | Returns normalized order summaries |
| `GET /api/account/subscriptions?customerId=...` | Returns normalized subscription summaries |
| `GET /api/account/payments?customerId=...` | Returns normalized payment summaries |
| `GET /api/account/requests?customerId=...` | Returns normalized request summaries |
| `POST /api/requests` | Creates a normalized service request in Zoho and returns the created request reference |

## App-Side Quality Gates

Run these before handoff:

```bash
npm test
npm run lint
npm run build
```

## External Dependency Gate

The app can build and validate local contracts without live Zoho endpoints. Production cutover is blocked until:

- `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` is configured and returns contract-compliant responses
- `ZOHO_COMMERCE_CUSTOM_API_URL` is configured and returns contract-compliant responses
- `ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL` is confirmed in the production environment
- Xero payment gateway redirects can be created through the Zoho subscription custom API
- confirmation reads return durable order, payment, and subscription state after hosted checkout

## Correlation Rules

- Every API response should include the `x-correlation-id` response header.
- Write routes should include `correlationId` in the JSON response body.
- Zoho custom API requests should receive the correlation ID as both a request body field and `X-Correlation-Id` header where supported by the adapter.
