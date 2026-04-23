import { type NextRequest } from 'next/server';

import { AuditServiceError } from '@/lib/audit/errors';
import {
  createAuditJsonResponse,
  createAuditServiceErrorResponse,
  createAuditUnhandledErrorResponse,
} from '@/lib/audit/route-utils';
import { createAuditPayment } from '@/lib/audit/service';
import { getOrCreateCorrelationId } from '@/lib/server/correlation';
import { parseJsonRequestBody } from '@/lib/server/request-json';

export const runtime = 'edge';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const correlationId = getOrCreateCorrelationId(request);
  const { orderId } = await context.params;

  try {
    const result = await createAuditPayment({
      orderId,
      body: (await parseJsonRequestBody(request)) ?? {},
      origin: request.nextUrl.origin,
      correlationId,
    });

    return createAuditJsonResponse(
      {
        ...result,
        correlationId,
      },
      correlationId,
    );
  } catch (error) {
    if (error instanceof AuditServiceError) {
      return createAuditServiceErrorResponse(error, correlationId);
    }

    return createAuditUnhandledErrorResponse(
      error,
      correlationId,
      'We hit a temporary problem while starting audit payment.',
    );
  }
}
