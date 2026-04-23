import { type NextRequest } from 'next/server';

import { getRenewalDetails } from '@/lib/renewals/service';
import {
  createRenewalJsonResponse,
  createRenewalServiceErrorResponse,
  createRenewalUnhandledErrorResponse,
} from '@/lib/renewals/route-utils';
import { RenewalServiceError } from '@/lib/renewals/errors';
import {
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);

  try {
    const details = await getRenewalDetails({
      token: request.nextUrl.searchParams.get('token'),
      origin: request.nextUrl.origin,
      correlationId,
    });

    return createRenewalJsonResponse(
      {
        ...details,
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
      'We hit a temporary problem while loading this renewal.',
    );
  }
}
