import { NextResponse, type NextRequest } from 'next/server';

import { isDebugModeEnabled } from '@/lib/env/debug-mode';
import { MonitoringServiceError } from '@/lib/monitoring/errors';
import { getMonitoringSubscriptionContextWithDebug } from '@/lib/monitoring/service';
import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';

export const runtime = 'edge';

function getErrorDebug(error: unknown) {
  if (error && typeof error === 'object' && 'debug' in error) {
    return error.debug;
  }

  return undefined;
}

function createJsonResponse(
  payload: unknown,
  correlationId: string,
  init?: ResponseInit,
) {
  return attachCorrelationIdHeader(NextResponse.json(payload, init), correlationId);
}

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);

  try {
    const result = await getMonitoringSubscriptionContextWithDebug({
      token: request.nextUrl.searchParams.get('token'),
      origin: request.nextUrl.origin,
      correlationId,
    });

    return createJsonResponse(
      {
        ...result.data,
        correlationId,
        ...(isDebugModeEnabled() && result.debug ? { debug: result.debug } : {}),
      },
      correlationId,
    );
  } catch (error) {
    if (error instanceof MonitoringServiceError) {
      return createJsonResponse(
        {
          ...error.response,
          correlationId,
          ...(isDebugModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        correlationId,
        {
          status: error.status,
        },
      );
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'We hit a temporary problem while loading this subscription link.',
        correlationId,
        ...(isDebugModeEnabled() && getErrorDebug(error)
          ? { debug: getErrorDebug(error) }
          : {}),
      },
      correlationId,
      { status: 500 },
    );
  }
}
