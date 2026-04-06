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
| WS3 | Monitoring Subscription Production Path | Not started | Waiting on WS2 boundary work |
| WS4 | Preferences Flow Hardening | Not started | Can partially overlap after WS2 |
| WS5 | Account Visibility Surfaces | Not started | Depends on normalized read APIs |
| WS6 | Request Flows | Not started | Depends on canonical request contract implementation |
| WS7 | Production Hardening And Supportability | Not started | Cross-cutting finalization work |

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
| WS2.4 Define mapper boundaries for customer/order/subscription/request/preferences | In progress | Preference mapping boundary is in place; other commerce mappers are still pending | Continue with monitoring subscription and request adapters |

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
