import { NextResponse, type NextRequest } from 'next/server';

import {
  fetchNotificationPreferences,
  NotificationPreferencesError,
  saveNotificationPreferences,
} from '@/lib/email-preferences/crm';
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
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';

  try {
    const preferences = await fetchNotificationPreferences(email);
    return NextResponse.json({
      email: preferences.email,
      categories: preferences.categories,
      ...(preferences.optOut ? { optOut: true as const } : {}),
      ...(isDevModeEnabled() && preferences.debug ? { debug: preferences.debug } : {}),
    });
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return NextResponse.json(
        {
          code: error.code,
          message: getUserFacingError(error, 'load'),
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        code: 'server_error',
        message: 'Unable to load notification preferences.',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as unknown;

  if (!isCategoriesPayload(payload) && !isGlobalOptOutPayload(payload)) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'A valid email preferences payload is required.',
      },
      { status: 400 },
    );
  }

  try {
    const preferences = await saveNotificationPreferences(payload);
    return NextResponse.json({
      email: preferences.email,
      categories: preferences.categories,
      ...(preferences.optOut ? { optOut: true as const } : {}),
      ...(isDevModeEnabled() && preferences.debug ? { debug: preferences.debug } : {}),
    });
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      return NextResponse.json(
        {
          code: error.code,
          message: getUserFacingError(error, 'save'),
          ...(isDevModeEnabled() && error.debug ? { debug: error.debug } : {}),
        },
        { status: error.status },
      );
    }

    return NextResponse.json(
      {
        code: 'server_error',
        message: 'Unable to save notification preferences.',
      },
      { status: 500 },
    );
  }
}
