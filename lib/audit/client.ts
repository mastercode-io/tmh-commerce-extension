'use client';

export type AuditApiErrorResponse = {
  code?: string;
  message?: string;
  correlationId?: string;
};

export class AuditApiResponseError extends Error {
  status: number;
  code?: string;
  correlationId?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
    correlationId?: string,
  ) {
    super(message);
    this.name = 'AuditApiResponseError';
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
  }
}

export async function requestAuditJson<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });
  const data = (await response.json().catch(() => null)) as
    | (T & AuditApiErrorResponse)
    | AuditApiErrorResponse
    | null;

  if (!response.ok) {
    throw new AuditApiResponseError(
      data?.message ?? 'We could not complete this audit action.',
      response.status,
      data?.code,
      data?.correlationId,
    );
  }

  return data as T;
}
