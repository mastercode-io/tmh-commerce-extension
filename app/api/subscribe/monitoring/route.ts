import { NextResponse, type NextRequest } from 'next/server';

import { MonitoringServiceError } from '@/lib/monitoring/errors';
import { getMonitoringSubscriptionContext } from '@/lib/monitoring/service';
import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';

export const runtime = 'edge';

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
    const data = await getMonitoringSubscriptionContext({
      token: request.nextUrl.searchParams.get('token'),
      origin: request.nextUrl.origin,
      correlationId,
    });

    return createJsonResponse(data, correlationId);
  } catch (error) {
    if (error instanceof MonitoringServiceError) {
      return createJsonResponse(error.response, correlationId, {
        status: error.status,
      });
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'We hit a temporary problem while loading this subscription link.',
      },
      correlationId,
      { status: 500 },
    );
  }
}
