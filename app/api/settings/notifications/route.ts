import { NextResponse, type NextRequest } from 'next/server';

import {
  attachCorrelationIdHeader,
  getOrCreateCorrelationId,
} from '@/lib/server/correlation';
import {
  getPreferenceProfile,
  NotificationPreferencesError,
  savePreferenceProfile,
} from '@/lib/zoho/preferences';
import type {
  NotificationPreferencesOptOutRequest,
  NotificationPreferencesSaveRequest,
} from '@/lib/email-preferences/types';

export const runtime = 'edge';

function isDevModeEnabled() {
  return process.env.DEV_MODE?.toLowerCase() === 'true';
}

function getUserFacingError(
  error: NotificationPreferencesError,
  action: 'load' | 'save',
) {
  if (error.status === 400) {
    return action === 'load'
      ? 'Bad request. Please check the link and try again.'
      : 'Bad request. Please review your changes and try again.';
  }

  if (error.status === 404) {
    return 'User not found. We could not find email preferences for this email address.';
  }

  return action === 'load'
    ? 'We could not load email preferences right now. Please try again later.'
    : 'We could not save email preferences right now. Please try again later.';
}

function createJsonResponse(
  payload: unknown,
  correlationId: string,
  init?: ResponseInit,
) {
  return attachCorrelationIdHeader(NextResponse.json(payload, init), correlationId);
}

function isCategoriesPayload(
  payload: unknown,
): payload is NotificationPreferencesSaveRequest {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'email' in payload &&
      typeof payload.email === 'string' &&
      'categories' in payload &&
      Array.isArray(payload.categories),
  );
}

function isGlobalOptOutPayload(
  payload: unknown,
): payload is NotificationPreferencesOptOutRequest {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'email' in payload &&
      typeof payload.email === 'string' &&
      'optOut' in payload &&
      payload.optOut === true,
  );
}

export async function GET(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';

  try {
    const preferences = await getPreferenceProfile(email, correlationId);
    return createJsonResponse(
      {
        email: preferences.email,
        categories: preferences.categories,
        ...(preferences.globalOptOut ? { optOut: true as const } : {}),
        ...(preferences.isNew ? { new: true as const } : {}),
        ...(isDevModeEnabled() && preferences.debug ? { debug: preferences.debug } : {}),
      },
      correlationId,
    );
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return createJsonResponse(
        {
          code: error.code,
          message: getUserFacingError(error, 'load'),
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        correlationId,
        { status: error.status },
      );
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'Unable to load notification preferences.',
      },
      correlationId,
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const correlationId = getOrCreateCorrelationId(request);
  const payload = (await request.json()) as unknown;

  if (!isCategoriesPayload(payload) && !isGlobalOptOutPayload(payload)) {
    return createJsonResponse(
      {
        code: 'invalid_request',
        message: 'A valid email preferences payload is required.',
      },
      correlationId,
      { status: 400 },
    );
  }

  try {
    const preferences = await savePreferenceProfile(payload, correlationId);
    return createJsonResponse(
      {
        email: preferences.email,
        categories: preferences.categories,
        ...(preferences.globalOptOut ? { optOut: true as const } : {}),
        ...(isDevModeEnabled() && preferences.debug ? { debug: preferences.debug } : {}),
      },
      correlationId,
    );
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return createJsonResponse(
        {
          code: error.code,
          message: getUserFacingError(error, 'save'),
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        correlationId,
        { status: error.status },
      );
    }

    return createJsonResponse(
      {
        code: 'server_error',
        message: 'Unable to save notification preferences.',
      },
      correlationId,
      { status: 500 },
    );
  }
}
