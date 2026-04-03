import type {
  NotificationPreferenceCategory,
  NotificationPreferencesPayload,
} from '@/lib/email-preferences/types';
import { NOTIFICATION_OPTION_LABELS } from '@/lib/email-preferences/types';

const NOTIFICATION_SETTINGS_URL_ENV =
  'ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL';

type CrmApiEnvelope = {
  crmAPIResponse?: {
    status_code?: number;
    body?: unknown;
  };
};

export type NotificationPreferencesResponse = {
  email: string;
  categories: NotificationPreferencesPayload;
};

export class NotificationPreferencesError extends Error {
  status: number;
  code: 'config_error' | 'upstream_error' | 'invalid_response';

  constructor(
    message: string,
    status: number,
    code: 'config_error' | 'upstream_error' | 'invalid_response',
  ) {
    super(message);
    this.name = 'NotificationPreferencesError';
    this.status = status;
    this.code = code;
  }
}

function parseMaybeJson(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

async function parseResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  return parseMaybeJson(text);
}

function extractEnvelope(payload: unknown): CrmApiEnvelope['crmAPIResponse'] | null {
  if (!payload || typeof payload !== 'object' || !('crmAPIResponse' in payload)) {
    return null;
  }

  return (payload as CrmApiEnvelope).crmAPIResponse ?? null;
}

function normalizeErrorMessage(body: unknown, fallback: string) {
  if (typeof body === 'string' && body.trim()) {
    return body;
  }

  if (
    body &&
    typeof body === 'object' &&
    'message' in body &&
    typeof body.message === 'string' &&
    body.message.trim()
  ) {
    return body.message;
  }

  return fallback;
}

function isNotificationPreferenceCategory(
  value: unknown,
): value is NotificationPreferenceCategory {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (
    !('category' in value) ||
    typeof value.category !== 'string' ||
    !('topics' in value) ||
    !Array.isArray(value.topics)
  ) {
    return false;
  }

  return value.topics.every((topic) => {
    if (!topic || typeof topic !== 'object') {
      return false;
    }

    return (
      'topic' in topic &&
      typeof topic.topic === 'string' &&
      'label' in topic &&
      typeof topic.label === 'string' &&
      'option' in topic &&
      typeof topic.option === 'string' &&
      NOTIFICATION_OPTION_LABELS.includes(topic.option as never)
    );
  });
}

function normalizeNotificationCategories(
  body: unknown,
): NotificationPreferencesPayload {
  const directCategories = Array.isArray(body) ? body : null;
  const nestedCategories =
    body &&
    typeof body === 'object' &&
    'email_options' in body &&
    Array.isArray(body.email_options)
      ? body.email_options
      : null;
  const candidateCategories = directCategories ?? nestedCategories;

  if (!candidateCategories) {
    throw new NotificationPreferencesError(
      'CRM response did not include a notification categories array.',
      502,
      'invalid_response',
    );
  }

  if (!candidateCategories.every(isNotificationPreferenceCategory)) {
    throw new NotificationPreferencesError(
      'CRM response included invalid notification category data.',
      502,
      'invalid_response',
    );
  }

  return candidateCategories;
}

function getCrmBaseUrl() {
  const baseUrl = process.env[NOTIFICATION_SETTINGS_URL_ENV];

  if (!baseUrl) {
    throw new NotificationPreferencesError(
      `Missing ${NOTIFICATION_SETTINGS_URL_ENV} environment variable.`,
      500,
      'config_error',
    );
  }

  return baseUrl;
}

export async function fetchNotificationPreferences(
  email: string,
): Promise<NotificationPreferencesResponse> {
  const requestUrl = new URL(getCrmBaseUrl());
  requestUrl.searchParams.set('email', email);

  const response = await fetch(requestUrl.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  const payload = await parseResponsePayload(response);
  const envelope = extractEnvelope(payload);
  const upstreamStatus = envelope?.status_code ?? response.status;
  const upstreamBody =
    typeof envelope?.body === 'string' ? parseMaybeJson(envelope.body) : envelope?.body;

  if (!response.ok || upstreamStatus >= 400) {
    throw new NotificationPreferencesError(
      normalizeErrorMessage(
        upstreamBody,
        `CRM request failed with status ${upstreamStatus}.`,
      ),
      upstreamStatus || 502,
      'upstream_error',
    );
  }

  return {
    email,
    categories: normalizeNotificationCategories(upstreamBody),
  };
}

export async function saveNotificationPreferences(
  email: string,
  categories: NotificationPreferencesPayload,
): Promise<NotificationPreferencesResponse> {
  const requestUrl = new URL(getCrmBaseUrl());
  requestUrl.searchParams.set('email', email);

  const response = await fetch(requestUrl.toString(), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(categories),
    cache: 'no-store',
  });

  const payload = await parseResponsePayload(response);
  const envelope = extractEnvelope(payload);
  const upstreamStatus = envelope?.status_code ?? response.status;
  const upstreamBody =
    typeof envelope?.body === 'string' ? parseMaybeJson(envelope.body) : envelope?.body;

  if (!response.ok || upstreamStatus >= 400) {
    throw new NotificationPreferencesError(
      normalizeErrorMessage(
        upstreamBody,
        `CRM save request failed with status ${upstreamStatus}.`,
      ),
      upstreamStatus || 502,
      'upstream_error',
    );
  }

  const normalizedCategories =
    upstreamBody == null ? categories : normalizeNotificationCategories(upstreamBody);

  return {
    email,
    categories: normalizedCategories,
  };
}
