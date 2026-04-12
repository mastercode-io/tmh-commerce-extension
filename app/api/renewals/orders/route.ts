import { type NextRequest } from 'next/server';

import { RenewalServiceError } from '@/lib/renewals/errors';
import {
  createRenewalJsonResponse,
  createRenewalServiceErrorResponse,
  createRenewalUnhandledErrorResponse,
} from '@/lib/renewals/route-utils';
import { createRenewalOrder } from '@/lib/renewals/service';
import { getOrCreateCorrelationId } from '@/lib/server/correlation';
import { parseJsonRequestBody } from '@/lib/server/request-json';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);

  try {
    const result = await createRenewalOrder({
      body: (await parseJsonRequestBody(request)) ?? {},
      origin: request.nextUrl.origin,
      correlationId,
    });

    return createRenewalJsonResponse(
      {
        ...result,
        correlationId,
      },
      correlationId,
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof RenewalServiceError) {
      return createRenewalServiceErrorResponse(error, correlationId);
    }

    return createRenewalUnhandledErrorResponse(
      error,
      correlationId,
      'We hit a temporary problem while creating this renewal order.',
    );
  }
}
