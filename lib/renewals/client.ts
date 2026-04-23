'use client';

export type RenewalApiErrorResponse = {
  code?: string;
  message?: string;
  correlationId?: string;
};

export class RenewalApiResponseError extends Error {
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
    this.name = 'RenewalApiResponseError';
    this.status = status;
    this.code = code;
    this.correlationId = correlationId;
  }
}

export async function requestRenewalJson<T>(
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
    | (T & RenewalApiErrorResponse)
    | RenewalApiErrorResponse
    | null;

  if (!response.ok) {
    throw new RenewalApiResponseError(
      data?.message ?? 'We could not complete this renewal action.',
      response.status,
      data?.code,
      data?.correlationId,
    );
  }

  return data as T;
}
