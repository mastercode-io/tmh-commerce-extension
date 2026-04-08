import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { parseJsonRequestBody } from '../lib/server/request-json.ts';

describe('parseJsonRequestBody', () => {
  it('returns parsed JSON for valid request bodies', async () => {
    const body = await parseJsonRequestBody(
      new Request('https://example.com/api', {
        method: 'POST',
        body: JSON.stringify({ email: 'amelia@example.com' }),
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    assert.deepEqual(body, { email: 'amelia@example.com' });
  });

  it('returns null for malformed JSON bodies', async () => {
    const body = await parseJsonRequestBody(
      new Request('https://example.com/api', {
        method: 'POST',
        body: '{not-json',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    );

    assert.equal(body, null);
  });
});

