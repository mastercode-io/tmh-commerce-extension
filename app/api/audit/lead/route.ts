import { type NextRequest } from 'next/server';

import { AuditServiceError } from '@/lib/audit/errors';
import {
  createAuditJsonResponse,
  createAuditServiceErrorResponse,
  createAuditUnhandledErrorResponse,
} from '@/lib/audit/route-utils';
import { upsertAuditLead } from '@/lib/audit/service';
import { getOrCreateCorrelationId } from '@/lib/server/correlation';
import { parseJsonRequestBody } from '@/lib/server/request-json';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);

  try {
    const result = await upsertAuditLead({
      body: (await parseJsonRequestBody(request)) ?? {},
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
      'We hit a temporary problem while saving the audit lead.',
    );
  }
}
