export type AuditApiErrorCode =
  | 'invalid_request'
  | 'invalid_token'
  | 'not_found'
  | 'terms_required'
  | 'config_error'
  | 'server_error';

export interface AuditApiError {
  code: AuditApiErrorCode;
  message: string;
}

export class AuditServiceError extends Error {
  status: number;
  response: AuditApiError;
  correlationId: string;
  debug?: unknown;

  constructor(
    response: AuditApiError,
    status: number,
    correlationId: string,
    debug?: unknown,
  ) {
    super(response.message);
    this.name = 'AuditServiceError';
    this.status = status;
    this.response = response;
    this.correlationId = correlationId;
    this.debug = debug;
  }
}

export function createAuditError(
  code: AuditApiErrorCode,
  message: string,
): AuditApiError {
  return { code, message };
}
