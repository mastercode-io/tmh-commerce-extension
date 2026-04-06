const CORRELATION_HEADER_NAME = 'x-correlation-id';

function readCorrelationId(headers: Headers) {
  const headerValue = headers.get(CORRELATION_HEADER_NAME)?.trim();
  return headerValue ? headerValue : null;
}

export function getOrCreateCorrelationId(source: Headers | { headers: Headers }) {
  const headers = source instanceof Headers ? source : source.headers;
  return readCorrelationId(headers) ?? globalThis.crypto.randomUUID();
}

export function attachCorrelationIdHeader<T extends Response>(
  response: T,
  correlationId: string,
) {
  response.headers.set(CORRELATION_HEADER_NAME, correlationId);
  return response;
}

export { CORRELATION_HEADER_NAME };
