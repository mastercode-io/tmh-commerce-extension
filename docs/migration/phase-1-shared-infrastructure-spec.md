# Phase 1 Shared Infrastructure Spec

This document defines the first implementation slice that should be built in `tmh-commerce-extension` before renewal and audit feature pages are wired.

It covers tracker items:
- `S1` shared status/type primitives
- `S2` adapter error normalization
- `S3` payment polling helper contract
- `S4` fixture scaffolding rules

Use this together with:
- `implementation-plan-tracker.md`
- `target-typescript-contracts.md`
- `field-mapping.md`
- `user-facing-route-map.md`

## 1. Objective

Create the shared foundations that both renewal and audit depend on so that:
- route handlers do not invent their own status semantics
- React screens do not interpret raw CRM/Xero strings directly
- renewal payment polling behavior is implemented once
- fixture-backed tests have stable naming and storage

## 2. Shared File Layout In The Target Repo

Recommended initial file layout:

- `lib/commerce/types.ts`
- `lib/commerce/status.ts`
- `lib/commerce/errors.ts`
- `lib/commerce/flow-context.ts`
- `lib/commerce/payment-polling.ts`
- `features/renewals/lib/types.ts`
- `features/audit/lib/types.ts`
- `test/fixtures/renewals/*`
- `test/fixtures/audit/*`

Rule:
- only truly shared primitives should live in `lib/commerce/*`
- flow-specific payload contracts stay in `features/renewals/lib/types.ts` and `features/audit/lib/types.ts`

## 3. S1: Shared Status And Type Primitives

Put these in `lib/commerce/types.ts`:

- `CurrencyCode`
- `RequestType`
- `RequestStatus`
- `OrderStatus`
- `PaymentStatus`
- `Address`
- `RequestSummary`
- `OrderSummary`
- `PaymentSummary`

Source:
- `target-typescript-contracts.md`

Implementation rule:
- do not move renewal-specific and audit-specific payloads into the shared file
- use the shared file only for normalized cross-flow primitives

## 4. S2: Adapter Error Normalization

Create `lib/commerce/errors.ts`.

Recommended shape:

```ts
export type AppErrorCode =
  | 'invalid_request'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'upstream_failure'
  | 'upstream_timeout'
  | 'payment_failed'
  | 'unknown';

export interface AppErrorDetails {
  code: AppErrorCode;
  message: string;
  correlationId?: string | null;
  upstreamStatus?: number | null;
  retryable?: boolean;
}
```

Recommended helper:

```ts
export function parseZohoError(error: unknown): AppErrorDetails
```

Minimum behavior:
- preserve correlation ID when available
- distinguish validation/input errors from upstream availability failures
- mark retryable failures consistently
- avoid exposing raw CRM payloads directly to React screens

## 5. S3: Payment Status Mapping

Create `lib/commerce/status.ts`.

Minimum helper set:

```ts
export function normalizePaymentStatus(rawStatus: string | null | undefined): PaymentStatus
export function normalizeRequestStatus(rawStatus: string | null | undefined): RequestStatus
export function normalizeOrderStatus(rawStatus: string | null | undefined): OrderStatus
```

Renewal payment mapping must be locked as:

| Raw source status | Canonical target status |
| --- | --- |
| `paid` | `succeeded` |
| `pending` | `pending` |
| `failed` | `failed` |
| `voided` | `cancelled` |
| `not_found` | `cancelled` |

Implementation rule:
- these mappings belong on the server boundary
- React components must only receive canonical statuses

## 6. S3: Payment Polling Helper

Create `lib/commerce/payment-polling.ts`.

Recommended contract:

```ts
export interface PaymentPollingOptions {
  initialFastIntervalMs: number;
  initialFastDurationMs: number;
  midIntervalMs: number;
  midDurationMs: number;
  slowIntervalMs: number;
  timeoutMs: number;
}

export interface PaymentPollingSnapshot {
  status: PaymentStatus;
  updatedAt?: string | null;
}

export interface PaymentTerminalState {
  status: PaymentStatus | 'timeout';
  lastSnapshot?: PaymentPollingSnapshot | null;
}

export async function pollPaymentStatus(
  getStatus: () => Promise<PaymentPollingSnapshot>,
  options?: Partial<PaymentPollingOptions>,
): Promise<PaymentTerminalState>
```

Renewal cadence to preserve:
- first 30 seconds: every 2 seconds
- next 90 seconds: every 5 seconds
- after that: every 10 seconds
- total timeout: 10 minutes

Terminal states:
- `succeeded`
- `failed`
- `cancelled`
- `timeout`

Non-terminal state:
- `pending`

## 7. S3: Flow Context Helper

Create `lib/commerce/flow-context.ts`.

Recommended helper:

```ts
export interface FlowContext {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPath?: string;
}

export function buildPublicFlowContext(args: {
  searchParams: URLSearchParams;
  headers: Headers;
  pathname: string;
}): FlowContext
```

Purpose:
- keep UTM/referrer capture out of page components
- preserve source landing-context behavior for renewal

## 8. S4: Fixture Scaffolding Rules

Fixture root:
- `test/fixtures/renewals`
- `test/fixtures/audit`

Rules:
- use JSON fixtures for handler tests and normalization tests
- prefer realistic source-derived payloads over invented minimal payloads
- keep one fixture per meaningful scenario, not one giant catch-all file
- do not mix source snake_case fixture shapes and target camelCase fixture shapes in the same file

Recommended naming:
- `source.*.json` for upstream/source-shaped payloads
- `target.*.json` for normalized target contracts

Example:
- `test/fixtures/renewals/source.details.organization.json`
- `test/fixtures/renewals/target.details.organization.json`

## 9. Exit Criteria For Phase 1

Phase 1 is done when:
- shared status/type primitives are implemented once
- error normalization exists and is reusable
- payment polling helper is implemented with the locked cadence and status rules
- fixture layout exists with the minimum agreed set
- renewal and audit feature work can import shared foundations instead of recreating them

## 10. Next Step After Phase 1

Start renewal backend work:
- token details read
- create-order route
- order read route
- payment-link route
- payment-status route
- confirmation read route
