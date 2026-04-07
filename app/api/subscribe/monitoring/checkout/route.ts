import { NextResponse, type NextRequest } from 'next/server';

import {
  createMonitoringCheckout,
} from '@/lib/monitoring/service';
import { MonitoringServiceError } from '@/lib/monitoring/errors';
import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';
import { parseJsonRequestBody } from '@/lib/server/request-json';

export const runtime = 'edge';

function createJsonResponse(
  payload: unknown,
  correlationId: string,
  init?: ResponseInit,
) {
  return attachCorrelationIdHeader(NextResponse.json(payload, init), correlationId);
}

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);

  try {
    const checkout = await createMonitoringCheckout({
      body: (await parseJsonRequestBody(request)) ?? {},
      origin: request.nextUrl.origin,
      correlationId,
    });

    return createJsonResponse(checkout, correlationId);
  } catch (error) {
    if (error instanceof MonitoringServiceError) {
      return createJsonResponse(error.response, correlationId, {
        status: error.status,
      });
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'We hit a temporary problem while starting checkout.',
      },
      correlationId,
      { status: 500 },
    );
  }
}
