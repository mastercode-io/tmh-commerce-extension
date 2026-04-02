const NOTIFICATION_SETTINGS_URL_ENV =
  'ZOHO_CLIENT_PORTAL_SETTINGS_NOTIFICATIONS_URL';

type CrmApiEnvelope = {
  crmAPIResponse?: {
    status_code?: number;
    body?: unknown;
  };
};

type EmailOptionsBody = {
  email_options?: unknown;
};

export type NotificationPreferences = {
  email: string;
  emailOptions: Record<string, boolean>;
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

function normalizeEmailOptions(body: unknown) {
  const candidateEmailOptions =
    body && typeof body === 'object' && 'email_options' in body
      ? (body as EmailOptionsBody).email_options
      : null;
  const rawEmailOptions: unknown[] | null = Array.isArray(candidateEmailOptions)
    ? candidateEmailOptions
    : null;

  if (!rawEmailOptions) {
    throw new NotificationPreferencesError(
      'CRM response did not include an email_options array.',
      502,
      'invalid_response',
    );
  }

  const emailOptions: Record<string, boolean> = {};

  for (const item of rawEmailOptions) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    for (const [key, value] of Object.entries(item)) {
      if (typeof value === 'boolean') {
        emailOptions[key] = value;
        continue;
      }

      if (value === 'true') {
        emailOptions[key] = true;
        continue;
      }

      if (value === 'false') {
        emailOptions[key] = false;
      }
    }
  }

  return emailOptions;
}

export async function fetchNotificationPreferences(
  email: string,
): Promise<NotificationPreferences> {
  const baseUrl = process.env[NOTIFICATION_SETTINGS_URL_ENV];

  if (!baseUrl) {
    throw new NotificationPreferencesError(
      `Missing ${NOTIFICATION_SETTINGS_URL_ENV} environment variable.`,
      500,
      'config_error',
    );
  }

  const requestUrl = new URL(baseUrl);
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
    emailOptions: normalizeEmailOptions(upstreamBody),
  };
}
