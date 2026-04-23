import { type NextRequest } from 'next/server';

import { AuditServiceError } from '@/lib/audit/errors';
import {
  createAuditJsonResponse,
  createAuditServiceErrorResponse,
  createAuditUnhandledErrorResponse,
} from '@/lib/audit/route-utils';
import { getAuditOrder } from '@/lib/audit/service';
import { getOrCreateCorrelationId } from '@/lib/server/correlation';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const correlationId = getOrCreateCorrelationId(request);
  const { orderId } = await context.params;

  try {
    const result = await getAuditOrder({
      orderId,
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
      'We hit a temporary problem while loading this audit order.',
    );
  }
}
