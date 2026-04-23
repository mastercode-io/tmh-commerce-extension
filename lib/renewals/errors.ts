export type RenewalApiErrorCode =
  | 'invalid_token'
  | 'expired_token'
  | 'invalid_request'
  | 'self_serve_blocked'
  | 'terms_required'
  | 'not_found'
  | 'config_error'
  | 'server_error';

export interface RenewalApiError {
  code: RenewalApiErrorCode;
  message: string;
}

export class RenewalServiceError extends Error {
  status: number;
  response: RenewalApiError;
  correlationId: string;
  debug?: unknown;

  constructor(
    response: RenewalApiError,
    status: number,
    correlationId: string,
    debug?: unknown,
  ) {
    super(response.message);
    this.name = 'RenewalServiceError';
    this.status = status;
    this.response = response;
    this.correlationId = correlationId;
    this.debug = debug;
  }
}

export function createRenewalError(
  code: RenewalApiErrorCode,
  message: string,
): RenewalApiError {
  return { code, message };
}
