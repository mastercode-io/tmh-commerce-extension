import { ZohoClientError } from '../zoho/client.ts';

export type AppErrorCode =
  | 'invalid_request'
  | 'not_found'
  | 'unauthorized'
  | 'forbidden'
  | 'conflict'
  | 'upstream_failure'
  | 'upstream_timeout'
  | 'payment_failed'
  | 'unknown';

export interface AppErrorDetails {
  code: AppErrorCode;
  message: string;
  correlationId?: string | null;
  upstreamStatus?: number | null;
  retryable?: boolean;
}

function getStatusCode(error: unknown) {
  return error instanceof ZohoClientError
    ? error.status
    : error instanceof Error &&
        'status' in error &&
        typeof error.status === 'number'
      ? error.status
      : null;
}

export function parseZohoError(error: unknown): AppErrorDetails {
  if (error instanceof ZohoClientError) {
    const status = error.status;

    if (status === 400) {
      return {
        code: 'invalid_request',
        message: error.message,
        correlationId: error.debug?.correlationId ?? null,
        upstreamStatus: status,
        retryable: false,
      };
    }

    if (status === 401) {
      return {
        code: 'unauthorized',
        message: error.message,
        correlationId: error.debug?.correlationId ?? null,
        upstreamStatus: status,
        retryable: false,
      };
    }

    if (status === 403) {
      return {
        code: 'forbidden',
        message: error.message,
        correlationId: error.debug?.correlationId ?? null,
        upstreamStatus: status,
        retryable: false,
      };
    }

    if (status === 404) {
      return {
        code: 'not_found',
        message: error.message,
        correlationId: error.debug?.correlationId ?? null,
        upstreamStatus: status,
        retryable: false,
      };
    }

    if (status === 409) {
      return {
        code: 'conflict',
        message: error.message,
        correlationId: error.debug?.correlationId ?? null,
        upstreamStatus: status,
        retryable: false,
      };
    }

    if (status === 408 || status === 429 || status >= 500) {
      return {
        code: status === 408 ? 'upstream_timeout' : 'upstream_failure',
        message: error.message,
        correlationId: error.debug?.correlationId ?? null,
        upstreamStatus: status,
        retryable: true,
      };
    }

    return {
      code: 'upstream_failure',
      message: error.message,
      correlationId: error.debug?.correlationId ?? null,
      upstreamStatus: status,
      retryable: false,
    };
  }

  if (error instanceof Error) {
    return {
      code: 'unknown',
      message: error.message,
      upstreamStatus: getStatusCode(error),
      retryable: false,
    };
  }

  return {
    code: 'unknown',
    message: 'Unknown error.',
    upstreamStatus: null,
    retryable: false,
  };
}
