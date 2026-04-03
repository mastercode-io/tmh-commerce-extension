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

type NotificationPreferencesEnvelope = {
  email?: unknown;
  categories?: unknown;
};

export type NotificationPreferencesResponse = {
  email: string;
  categories: NotificationPreferencesPayload;
  debug?: NotificationPreferencesDebug;
};

export type NotificationPreferencesDebug = {
  requestMethod: 'GET' | 'POST';
  requestUrl: string;
  upstreamStatus: number;
  responsePayload: unknown;
  responseBody: unknown;
};

export class NotificationPreferencesError extends Error {
  status: number;
  code: 'config_error' | 'upstream_error' | 'invalid_response';
  debug?: NotificationPreferencesDebug;

  constructor(
    message: string,
    status: number,
    code: 'config_error' | 'upstream_error' | 'invalid_response',
    debug?: NotificationPreferencesDebug,
  ) {
    super(message);
    this.name = 'NotificationPreferencesError';
    this.status = status;
    this.code = code;
    this.debug = debug;
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
): { email?: string; categories: NotificationPreferencesPayload } {
  if (!body || typeof body !== 'object') {
    throw new NotificationPreferencesError(
      'CRM response did not include a notification preferences object.',
      502,
      'invalid_response',
    );
  }

  const envelope = body as NotificationPreferencesEnvelope;

  if (!Array.isArray(envelope.categories)) {
    throw new NotificationPreferencesError(
      'CRM response did not include a categories array.',
      502,
      'invalid_response',
    );
  }

  if (!envelope.categories.every(isNotificationPreferenceCategory)) {
    throw new NotificationPreferencesError(
      'CRM response included invalid notification category data.',
      502,
      'invalid_response',
    );
  }

  return {
    email: typeof envelope.email === 'string' ? envelope.email : undefined,
    categories: envelope.categories,
  };
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

function createDebugPayload(
  requestMethod: 'GET' | 'POST',
  requestUrl: string,
  upstreamStatus: number,
  responsePayload: unknown,
  responseBody: unknown,
): NotificationPreferencesDebug {
  return {
    requestMethod,
    requestUrl,
    upstreamStatus,
    responsePayload,
    responseBody,
  };
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
  const debug = createDebugPayload(
    'GET',
    requestUrl.toString(),
    upstreamStatus || 502,
    payload,
    upstreamBody,
  );

  if (!response.ok || upstreamStatus >= 400) {
    throw new NotificationPreferencesError(
      normalizeErrorMessage(
        upstreamBody,
        `CRM request failed with status ${upstreamStatus}.`,
      ),
      upstreamStatus || 502,
      'upstream_error',
      debug,
    );
  }

  try {
    const normalizedResponse = normalizeNotificationCategories(upstreamBody);

    return {
      email: normalizedResponse.email ?? email,
      categories: normalizedResponse.categories,
      debug,
    };
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      throw new NotificationPreferencesError(
        error.message,
        error.status,
        error.code,
        debug,
      );
    }

    throw error;
  }
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
  const debug = createDebugPayload(
    'POST',
    requestUrl.toString(),
    upstreamStatus || 502,
    payload,
    upstreamBody,
  );

  if (!response.ok || upstreamStatus >= 400) {
    throw new NotificationPreferencesError(
      normalizeErrorMessage(
        upstreamBody,
        `CRM save request failed with status ${upstreamStatus}.`,
      ),
      upstreamStatus || 502,
      'upstream_error',
      debug,
    );
  }

  let normalizedCategories = categories;
  let normalizedEmail = email;

  try {
    if (upstreamBody != null) {
      const normalizedResponse = normalizeNotificationCategories(upstreamBody);
      normalizedCategories = normalizedResponse.categories;
      normalizedEmail = normalizedResponse.email ?? email;
    }
  } catch (error) {
    if (error instanceof NotificationPreferencesError) {
      throw new NotificationPreferencesError(
        error.message,
        error.status,
        error.code,
        debug,
      );
    }

    throw error;
  }

  return {
    email: normalizedEmail,
    categories: normalizedCategories,
    debug,
  };
}
