import { type NextRequest } from 'next/server';

import { RenewalServiceError } from '@/lib/renewals/errors';
import {
  createRenewalJsonResponse,
  createRenewalServiceErrorResponse,
  createRenewalUnhandledErrorResponse,
} from '@/lib/renewals/route-utils';
import { createRenewalPaymentLink } from '@/lib/renewals/service';
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
    const result = await createRenewalPaymentLink({
      orderId,
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
    );
  } catch (error) {
    if (error instanceof RenewalServiceError) {
      return createRenewalServiceErrorResponse(error, correlationId);
    }

    return createRenewalUnhandledErrorResponse(
      error,
      correlationId,
      'We hit a temporary problem while starting payment for this renewal order.',
    );
  }
}
