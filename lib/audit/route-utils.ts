import { NextResponse } from 'next/server';

import { isDebugModeEnabled } from '../env/debug-mode.ts';
import { attachCorrelationIdHeader } from '../server/correlation.ts';
import { AuditServiceError } from './errors.ts';

function getErrorDebug(error: unknown) {
  if (error && typeof error === 'object' && 'debug' in error) {
    return error.debug;
  }

  return undefined;
}

export function createAuditJsonResponse(
  payload: unknown,
  correlationId: string,
  init?: ResponseInit,
) {
  return attachCorrelationIdHeader(NextResponse.json(payload, init), correlationId);
}

export function createAuditServiceErrorResponse(
  error: AuditServiceError,
  correlationId: string,
) {
  return createAuditJsonResponse(
    {
      ...error.response,
      correlationId,
      ...(isDebugModeEnabled() && error.debug ? { debug: error.debug } : {}),
    },
    correlationId,
    { status: error.status },
  );
}

export function createAuditUnhandledErrorResponse(
  error: unknown,
  correlationId: string,
  message: string,
) {
  return createAuditJsonResponse(
    {
      code: 'server_error',
      message,
      correlationId,
      ...(isDebugModeEnabled() && getErrorDebug(error)
        ? { debug: getErrorDebug(error) }
        : {}),
    },
    correlationId,
    { status: 500 },
  );
}
