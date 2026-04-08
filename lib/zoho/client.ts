export type ZohoRequestMethod = 'GET' | 'POST';

export type ZohoClientErrorCode =
  | 'config_error'
  | 'upstream_error'
  | 'invalid_response';

type CrmApiEnvelope = {
  crmAPIResponse?: {
    status_code?: number;
    body?: unknown;
  };
};

export type ZohoRequestDebug = {
  correlationId: string;
  operation: string;
  requestMethod: ZohoRequestMethod;
  requestUrl: string;
  upstreamStatus: number;
  responsePayload: unknown;
  responseBody: unknown;
};

export class ZohoClientError extends Error {
  status: number;
  code: ZohoClientErrorCode;
  debug?: ZohoRequestDebug;

  constructor(
    message: string,
    status: number,
    code: ZohoClientErrorCode,
    debug?: ZohoRequestDebug,
  ) {
    super(message);
    this.name = 'ZohoClientError';
    this.status = status;
    this.code = code;
    this.debug = debug;
  }
}

type ExecuteZohoRequestOptions = {
  correlationId: string;
  operation: string;
  requestMethod: ZohoRequestMethod;
  requestUrl: string;
  body?: unknown;
};

export type ZohoRequestResult = {
  debug: ZohoRequestDebug;
  responseBody: unknown;
  responsePayload: unknown;
  upstreamStatus: number;
};

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

export function normalizeZohoErrorMessage(body: unknown, fallback: string) {
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

export function requireZohoBaseUrl(envVarName: string) {
  const baseUrl = process.env[envVarName];

  if (!baseUrl) {
    throw new ZohoClientError(
      `Missing ${envVarName} environment variable.`,
      500,
      'config_error',
    );
  }

  return baseUrl;
}

export async function executeZohoRequest({
  correlationId,
  operation,
  requestMethod,
  requestUrl,
  body,
}: ExecuteZohoRequestOptions): Promise<ZohoRequestResult> {
  const response = await fetch(requestUrl, {
    method: requestMethod,
    headers: {
      Accept: 'application/json',
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      'X-Correlation-Id': correlationId,
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: 'no-store',
  });

  const responsePayload = await parseResponsePayload(response);
  const envelope = extractEnvelope(responsePayload);
  const upstreamStatus = envelope?.status_code ?? response.status;
  const responseBody = envelope
    ? typeof envelope.body === 'string'
      ? parseMaybeJson(envelope.body)
      : envelope.body
    : responsePayload;
  const debug: ZohoRequestDebug = {
    correlationId,
    operation,
    requestMethod,
    requestUrl,
    upstreamStatus: upstreamStatus || 502,
    responsePayload,
    responseBody,
  };

  if (!response.ok || upstreamStatus >= 400) {
    throw new ZohoClientError(
      normalizeZohoErrorMessage(
        responseBody,
        `${operation} failed with status ${upstreamStatus}.`,
      ),
      upstreamStatus || 502,
      'upstream_error',
      debug,
    );
  }

  return {
    debug,
    responseBody,
    responsePayload,
    upstreamStatus,
  };
}
