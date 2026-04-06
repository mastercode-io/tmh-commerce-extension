import type {
  NotificationPreferenceCategory,
  NotificationPreferencesOptOutRequest,
  NotificationPreferencesPayload,
  NotificationPreferencesSaveRequest,
} from '@/lib/email-preferences/types';
import { NOTIFICATION_OPTION_LABELS } from '@/lib/email-preferences/types';
import {
  executeZohoRequest,
  requireZohoBaseUrl,
  ZohoClientError,
  type ZohoClientErrorCode,
  type ZohoRequestDebug,
} from '@/lib/zoho/client';

const NOTIFICATION_SETTINGS_URL_ENV =
  'ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL';

type NotificationPreferencesEnvelope = {
  email?: unknown;
  categories?: unknown;
  optOut?: unknown;
  new?: unknown;
};

type NormalizedNotificationCategoriesResponse = {
  email?: string;
  categories: NotificationPreferencesPayload;
  new?: true;
};

export type NotificationPreferencesDebug = ZohoRequestDebug;

export type PreferenceProfileSummary = {
  customerId?: string;
  email: string;
  globalOptOut: boolean;
  categories: NotificationPreferencesPayload;
  updatedAt?: string;
  crmSyncStatus: 'synced' | 'pending_sync' | 'sync_failed';
  isNew?: true;
  correlationId: string;
  debug?: NotificationPreferencesDebug;
};

export type NotificationPreferencesResponse = {
  email: string;
  categories: NotificationPreferencesPayload;
  optOut?: true;
  new?: true;
  debug?: NotificationPreferencesDebug;
};

export class NotificationPreferencesError extends Error {
  status: number;
  code: ZohoClientErrorCode;
  debug?: NotificationPreferencesDebug;

  constructor(
    message: string,
    status: number,
    code: ZohoClientErrorCode,
    debug?: NotificationPreferencesDebug,
  ) {
    super(message);
    this.name = 'NotificationPreferencesError';
    this.status = status;
    this.code = code;
    this.debug = debug;
  }
}

function createPreferencesRequestUrl(email: string) {
  const requestUrl = new URL(requireZohoBaseUrl(NOTIFICATION_SETTINGS_URL_ENV));
  requestUrl.searchParams.set('email', email);
  return requestUrl.toString();
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

function normalizeNotificationResponse(
  body: unknown,
): NormalizedNotificationCategoriesResponse | NotificationPreferencesOptOutRequest {
  if (!body || typeof body !== 'object') {
    throw new NotificationPreferencesError(
      'CRM response did not include a notification preferences object.',
      502,
      'invalid_response',
    );
  }

  const envelope = body as NotificationPreferencesEnvelope;

  if (envelope.optOut === true) {
    if (typeof envelope.email !== 'string') {
      throw new NotificationPreferencesError(
        'CRM response did not include an email for the opt-out state.',
        502,
        'invalid_response',
      );
    }

    return {
      email: envelope.email,
      optOut: true,
      ...(envelope.new === true ? { new: true as const } : {}),
    };
  }

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
    ...(envelope.new === true ? { new: true as const } : {}),
  };
}

function mapClientError(error: unknown) {
  if (error instanceof NotificationPreferencesError) {
    return error;
  }

  if (error instanceof ZohoClientError) {
    return new NotificationPreferencesError(
      error.message,
      error.status,
      error.code,
      error.debug,
    );
  }

  return error;
}

function mapProfileToResponse(
  profile: PreferenceProfileSummary,
): NotificationPreferencesResponse {
  return {
    email: profile.email,
    categories: profile.categories,
    ...(profile.globalOptOut ? { optOut: true as const } : {}),
    ...(profile.isNew ? { new: true as const } : {}),
    ...(profile.debug ? { debug: profile.debug } : {}),
  };
}

export async function getPreferenceProfile(
  email: string,
  correlationId: string,
): Promise<PreferenceProfileSummary> {
  const requestUrl = createPreferencesRequestUrl(email);

  try {
    const result = await executeZohoRequest({
      correlationId,
      operation: 'preferences.fetch',
      requestMethod: 'GET',
      requestUrl,
    });

    try {
      const normalizedResponse = normalizeNotificationResponse(result.responseBody);

      return {
        email: normalizedResponse.email ?? email,
        globalOptOut: 'optOut' in normalizedResponse,
        categories:
          'categories' in normalizedResponse ? normalizedResponse.categories : [],
        crmSyncStatus: 'synced',
        ...(normalizedResponse.new ? { isNew: true as const } : {}),
        correlationId,
        debug: result.debug,
      };
    } catch (error) {
      if (error instanceof NotificationPreferencesError) {
        throw new NotificationPreferencesError(
          error.message,
          error.status,
          error.code,
          result.debug,
        );
      }

      throw error;
    }
  } catch (error) {
    throw mapClientError(error);
  }
}

export async function savePreferenceProfile(
  payloadBody:
    | NotificationPreferencesSaveRequest
    | NotificationPreferencesOptOutRequest,
  correlationId: string,
): Promise<PreferenceProfileSummary> {
  const requestUrl = createPreferencesRequestUrl(payloadBody.email);

  try {
    const result = await executeZohoRequest({
      correlationId,
      operation: 'preferences.save',
      requestMethod: 'POST',
      requestUrl,
      body: payloadBody,
    });

    try {
      const normalizedResponse = normalizeNotificationResponse(result.responseBody);

      return {
        email: normalizedResponse.email ?? payloadBody.email,
        globalOptOut: 'optOut' in normalizedResponse,
        categories:
          'categories' in normalizedResponse ? normalizedResponse.categories : [],
        crmSyncStatus: 'synced',
        ...(normalizedResponse.new ? { isNew: true as const } : {}),
        correlationId,
        debug: result.debug,
      };
    } catch (error) {
      if (error instanceof NotificationPreferencesError) {
        throw new NotificationPreferencesError(
          error.message,
          error.status,
          error.code,
          result.debug,
        );
      }

      throw error;
    }
  } catch (error) {
    throw mapClientError(error);
  }
}

export async function fetchNotificationPreferences(
  email: string,
  correlationId: string,
) {
  const profile = await getPreferenceProfile(email, correlationId);
  return mapProfileToResponse(profile);
}

export async function saveNotificationPreferences(
  payloadBody:
    | NotificationPreferencesSaveRequest
    | NotificationPreferencesOptOutRequest,
  correlationId: string,
) {
  const profile = await savePreferenceProfile(payloadBody, correlationId);
  return mapProfileToResponse(profile);
}
