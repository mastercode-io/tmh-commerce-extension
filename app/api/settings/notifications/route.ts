import { NextResponse, type NextRequest } from 'next/server';

import {
  fetchNotificationPreferences,
  NotificationPreferencesError,
  saveNotificationPreferences,
} from '@/lib/email-preferences/crm';
import type { NotificationPreferencesPayload } from '@/lib/email-preferences/types';

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

function validateCategories(
  payload: unknown,
): payload is NotificationPreferencesPayload {
  return Array.isArray(payload);
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';

  try {
    const preferences = await fetchNotificationPreferences(email);
    return NextResponse.json({
      email: preferences.email,
      categories: preferences.categories,
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
  const email = request.nextUrl.searchParams.get('email')?.trim() ?? '';
  const payload = (await request.json()) as unknown;

  if (!validateCategories(payload)) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'A notification categories array is required.',
      },
      { status: 400 },
    );
  }

  if (isDevModeEnabled()) {
    return NextResponse.json({
      email,
      categories: payload,
    });
  }

  if (!email) {
    return NextResponse.json(
      {
        code: 'invalid_request',
        message: 'Email is required.',
      },
      { status: 400 },
    );
  }

  try {
    const preferences = await saveNotificationPreferences(email, payload);
    return NextResponse.json({
      email: preferences.email,
      categories: preferences.categories,
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
