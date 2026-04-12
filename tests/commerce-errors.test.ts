import test from 'node:test';
import assert from 'node:assert/strict';

import { parseZohoError } from '../lib/commerce/errors.ts';
import { ZohoClientError } from '../lib/zoho/client.ts';

test('parseZohoError preserves correlation metadata and retryability', () => {
  const error = new ZohoClientError('Gateway timeout', 504, 'upstream_error', {
    correlationId: 'corr_123',
    operation: 'renewal.create_order',
    requestMethod: 'POST',
    requestUrl: 'https://example.com',
    upstreamStatus: 504,
    responsePayload: null,
    responseBody: null,
  });

  assert.deepEqual(parseZohoError(error), {
    code: 'upstream_failure',
    message: 'Gateway timeout',
    correlationId: 'corr_123',
    upstreamStatus: 504,
    retryable: true,
  });
});

test('parseZohoError maps not found to not_found', () => {
  const error = new ZohoClientError('No order found', 404, 'upstream_error');

  assert.deepEqual(parseZohoError(error), {
    code: 'not_found',
    message: 'No order found',
    correlationId: null,
    upstreamStatus: 404,
    retryable: false,
  });
});
