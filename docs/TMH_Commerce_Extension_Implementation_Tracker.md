# TMH Commerce Extension — Implementation Tracker

## Status

Active implementation tracker for the TMH Commerce Extension workstreams.

## Purpose

Record workstream task execution, outcomes, and follow-up actions against the locked planning artifacts.

## Workstream Status

| Workstream | Name | Status | Notes |
| --- | --- | --- | --- |
| WS1 | Scope And Surface Cleanup | Complete | Surface cleanup and archive markers applied |
| WS2 | Zoho And Integration Boundary Cleanup | In progress | Preferences route now uses the normalized Zoho service boundary |
| WS3 | Monitoring Subscription Production Path | In progress | Started production-path hardening around the Zoho subscription adapter |
| WS4 | Preferences Flow Hardening | In progress | Preferences route now returns normalized profile metadata and UI surfaces CRM sync status |
| WS5 | Account Visibility Surfaces | In progress | Account summary and resource list pages now read from normalized commerce routes |
| WS6 | Request Flows | In progress | Canonical request create route and generic request form are in place |
| WS7 | Production Hardening And Supportability | In progress | Production configuration checklist is in place; live endpoint validation remains external |

## WS1 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS1.1 README and docs scope patch | Complete | README rewritten to describe TMH Commerce Extension scope and local workflow | Add implementation commands and env docs as real integrations land |
| WS1.2 Root metadata/title/copy cleanup | Complete | Root metadata updated from portal POC framing to TMH Commerce Extension account framing | Revisit title/description once account home route exists |
| WS1.3 Dashboard/header/nav de-portalization | Complete | Removed active `Portfolio` and `Watchlist` primary nav exposure from live header and reframed account surfaces | Replace placeholder account destination with dedicated account home in WS5 |
| WS1.4 Active marketing/auth copy cleanup | Complete | Landing and auth flows now describe subscriptions, preferences, and requests instead of portfolio creation | Replace mock auth redirects with real auth/session handling in later auth work |
| WS1.5 Archive marker pass for portal-era docs | Complete | Added explicit archive notices to retained portal-era docs in `docs/` | Reorganize archive docs into a dedicated folder only if needed later |

## WS2 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS2.1 Create normalized Zoho service layer skeleton | Complete | Added `lib/zoho/client.ts` and `lib/zoho/preferences.ts` as the first reusable Zoho-backed service boundary | Extend with customer/order/subscription/request adapters in later WS2 slices |
| WS2.2 Introduce correlation-id utilities and logging conventions | Complete | Added `lib/server/correlation.ts` and propagated correlation IDs through the preferences route and upstream Zoho calls | Expand correlation handling to subscription and request routes |
| WS2.3 Refactor existing preferences route onto normalized service interface | Complete | `app/api/settings/notifications/route.ts` now depends on the Zoho service boundary instead of a feature-local CRM implementation | Normalize the public response contract further during WS4 if needed |
| WS2.4 Define mapper boundaries for customer/order/subscription/request/preferences | Complete | Preference mapping boundary is in place, the monitoring route family now sits behind `lib/monitoring/service.ts`, the Zoho monitoring subscription adapter is available, and shared commerce account/customer/order/subscription/payment/request adapter contracts are defined | Wire account/request routes to the generic commerce adapter in WS5/WS6 |
| WS2.5 Zoho subscription custom API adapter contract | Complete | Added `lib/zoho/subscriptions.ts` and `TMH_Commerce_Extension_Zoho_Subscription_Custom_API_Contract_v1.md` for resolve-token, checkout-intent, and confirmation operations | Wire the configured Zoho endpoint and remove mock fallback during WS3 production cutover |
| WS2.6 Generic Zoho commerce adapter contract | Complete | Added `lib/commerce/types.ts`, `lib/commerce/validators.ts`, `lib/zoho/commerce.ts`, and `TMH_Commerce_Extension_Zoho_Commerce_Custom_API_Contract_v1.md` | Use `ZOHO_COMMERCE_CUSTOM_API_URL` when account visibility and request routes are implemented |

## WS3 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS3.1 Production integration guardrails | Complete | Added `lib/monitoring/config.ts` so production Vercel deployments and `TMH_REQUIRE_ZOHO_MONITORING_SUBSCRIPTION=true` fail clearly when `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` is missing | Remove local mock fallback after Zoho custom API is live and tested |
| WS3.2 Monitoring service error boundary cleanup | Complete | Moved `MonitoringServiceError` into `lib/monitoring/errors.ts` for shared route/config usage | Add structured logging in WS7 |
| WS3.3 Confirmation copy cleanup | Complete | Removed mock GoCardless/mock CRM/portal wording from the confirmation UI | Revisit account destination once WS5 account home exists |
| WS3.4 Request body parsing guardrails | Complete | Added `lib/server/request-json.ts` and routed monitoring quote/checkout plus preferences saves through controlled JSON parsing | Extend to future write routes as they are added |
| WS3.5 TypeScript build gate cleanup | Complete | Fixed strict TypeScript validator and adapter typing issues surfaced by `npm run build` | Keep running build for route/service changes, not only lint |
| WS3.6 Demo fallback exposure cleanup | Complete | Demo helper links now render only when mock fallback is allowed, and local mock payment/booking pages return 404 when strict production integration is required | Remove mock pages entirely after Zoho/Xero flow is live and account pages exist |
| WS3.7 Real Zoho token/checkout/confirmation validation | Blocked | Adapter is wired, but live validation requires the Zoho custom API endpoint and env var | Configure `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` when Zoho side is ready |

## WS4 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS4.1 Normalize preferences API response metadata | Complete | Preferences API now returns legacy-compatible fields plus `profile`, `crmSyncStatus`, and `correlationId` | Move UI fully to `profile` after broader account payloads are wired |
| WS4.2 Harden invalid preference request handling | Complete | Preferences GET/POST now reject missing or blank email values locally with controlled `invalid_request` responses | Add schema-level category validation if categories become editable outside current UI |
| WS4.3 Preferences UI sync observability | Complete | Preferences UI now tracks and displays CRM sync status and includes correlation ID in dev debug output | Add structured logging in WS7 |
| WS4.4 Preferences copy alignment | Complete | Copy now consistently refers to email preferences and CRM sync debug rather than generic notification settings | Revisit compliance/legal wording with business before launch |
| WS4.5 Lightweight test coverage baseline | Complete | Added Node built-in test harness and tests for commerce validators, monitoring config policy, and controlled JSON parsing | Add route-level integration tests when a test-friendly Next route harness is introduced |
| WS4.6 Preference payload schema validation | Complete | Added reusable email preference payload validators and tests; preferences route now rejects malformed category/topic options before Zoho | Expand validation if the topic catalogue becomes dynamic |

## WS5 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS5.1 Account summary route and page | Complete | Added `/api/account/summary` and `/account` using the normalized commerce adapter, with controlled missing-context and integration-not-configured states instead of portal mock data | Replace query-param identity handoff with authenticated customer context when auth is implemented |
| WS5.2 Account resource list routes and pages | Complete | Added `/api/account/[resource]` plus `/account/orders`, `/account/subscriptions`, `/account/payments`, and `/account/requests` using normalized commerce read operations | Validate against live `ZOHO_COMMERCE_CUSTOM_API_URL` responses once Zoho is configured |
| WS5.3 Active portal-route redirect cleanup | Complete | Replaced old `/portfolio`, `/watchlist`, `/asset/[id]`, `/welcome`, `/discovery`, and `/renew/[id]` mock surfaces with redirects to account/request surfaces | Remove archived portal components entirely only if the future-reference archive is no longer needed |

## WS6 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS6.1 Canonical request route and payload validation | Complete | Added `/api/requests` with controlled JSON parsing, request payload validation, customer lookup by email when needed, and Zoho commerce request creation | Validate against live `ZOHO_COMMERCE_CUSTOM_API_URL` responses once Zoho is configured |
| WS6.2 Generic request form surface | Complete | Added `/requests/new` for audit, renewal, application, and support request submission using the canonical request route | Replace query-param identity handoff with authenticated customer context when auth is implemented |

## WS7 Task Log

| Task | Status | Result | Follow-up |
| --- | --- | --- | --- |
| WS7.1 Production configuration checklist | Complete | Added `TMH_Commerce_Extension_Production_Config_Checklist_v1.md` with required env vars, route validation checks, quality gates, and external dependency gates | Use this as the deployment handoff checklist once Zoho and Xero gateway plumbing are available |
| WS7.2 Blockers and next handoff TODO | Complete | Added `TMH_Commerce_Extension_Blockers_Next_Handoff_TODO_v1.md` with blockers, next tasks, app endpoint contracts, Zoho request/response shapes, env vars, and acceptance criteria | Keep this current as Zoho endpoints and auth/customer context are delivered |

## Activity Log

### 2026-04-06

- Started WS1 implementation.
- Applied surface cleanup to README, metadata, marketing header, dashboard header, landing page, and auth pages.
- Kept route structure intact for now; this pass changes presentation and temporary redirects only.
- Verified the WS1 surface patch with `npm run lint` successfully.

### 2026-04-07

- Completed the WS1 archive-marker pass for retained portal-era docs.
- Closed WS1 as complete and marked WS2 as ready to start.
- Added the first reusable Zoho service boundary and correlation utilities.
- Refactored the notifications preferences API route to use the new service layer.
- Verified the WS2 preferences boundary slice with `npm run lint` successfully.
- Moved the monitoring API route family behind `lib/monitoring/service.ts` and added correlation propagation across the monitoring endpoints.
- Verified the monitoring WS2 boundary slice with `npm run lint` successfully.
- Added the Zoho monitoring subscription custom API adapter and contract spec.
- The monitoring flow now uses the Zoho adapter when `ZOHO_MONITORING_SUBSCRIPTION_CUSTOM_API_URL` is configured, otherwise it retains the local mock fallback.
- Verified the Zoho subscription adapter slice with `npm run lint` successfully.
- Added shared normalized commerce types and validators for customer, order, subscription, payment, request, checkout intent, and account summary payloads.
- Added the generic Zoho commerce custom API adapter and contract spec for account/customer/order/subscription/payment/request operations.
- Verified the generic Zoho commerce adapter slice with `npm run lint` successfully.
- Started WS3.
- Added production-mode monitoring subscription integration guardrails.
- Removed mock provider/portal language from the subscription confirmation UI.
- Verified the first WS3 hardening slice with `npm run lint` successfully.
- Added controlled JSON body parsing for monitoring checkout/quote routes and the preferences save route.
- Verified the request parsing guardrail slice with `npm run lint` successfully.
- Fixed strict TypeScript issues in commerce validators and Zoho adapter envelope handling.
- Verified the WS3 start with both `npm run lint` and `npm run build` successfully.
- Gated monitoring demo helper links and local mock payment/booking pages behind the mock fallback policy.
- Replaced remaining mock/provider-facing subscription UI language with provider-neutral copy.
- Verified the demo fallback exposure cleanup with both `npm run lint` and `npm run build` successfully.
- Started WS4.
- Added normalized profile metadata, CRM sync status, and correlation IDs to preferences API responses.
- Added local invalid-email handling for preference load/save requests.
- Updated the preferences UI to display CRM sync status and correlation IDs in dev debug output.
- Verified the WS4 preferences hardening slice with both `npm run lint` and `npm run build` successfully.
- Added `npm test` using Node's built-in test runner with TypeScript type stripping.
- Added tests for normalized commerce validators, monitoring subscription config policy, and controlled JSON body parsing.
- Verified the current implementation with `npm test`, `npm run lint`, and `npm run build` successfully.
- Added reusable email preference payload validators and wired them into the preferences route.
- Added tests for email preference validator payload shapes.
- Verified the preference validation slice with `npm test`, `npm run lint`, and `npm run build` successfully.
- Started WS5.
- Added the normalized account summary API route and `/account` page.
- Updated the account header destination to use the new account overview route.
- Verified the first WS5 account surface slice with `npm test`, `npm run lint`, and `npm run build` successfully.
- Added normalized account resource endpoints and pages for orders, subscriptions, payments, and requests.
- Verified the expanded WS5 account read surfaces with `npm test`, `npm run lint`, and `npm run build` successfully.
- Started WS6.
- Added the canonical commerce request creation route and request payload validator.
- Added the generic request submission page for audit, renewal, application, and support request types.
- Added tests for commerce request payload validation.
- Verified the first WS6 request-flow slice with `npm test`, `npm run lint`, and `npm run build` successfully.
- Replaced the remaining directly reachable portal-era mock pages with commerce/account redirects.
- Verified the portal-route redirect cleanup with `npm test`, `npm run lint`, and `npm run build` successfully.
- Started WS7.
- Added the production configuration checklist covering environment variables, route validation, quality gates, and external dependency gates.
- Added the blockers, next handoff, and TODO document with endpoint contracts, request/response shapes, environment variables, and acceptance criteria.
