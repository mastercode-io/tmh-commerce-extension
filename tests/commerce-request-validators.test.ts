import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isCreateCommerceRequestPayload } from '../lib/commerce/request-validators.ts';

describe('commerce request validators', () => {
  it('accepts valid request creation payloads with customer ID or email identity', () => {
    assert.equal(
      isCreateCommerceRequestPayload({
        customerId: 'cust_123',
        requestType: 'support',
        summary: 'Need help with subscription setup.',
      }),
      true,
    );
    assert.equal(
      isCreateCommerceRequestPayload({
        email: 'amelia@example.com',
        requestType: 'renewal',
        summary: 'Please review this renewal.',
        details: {
          trademark: 'TMH',
        },
      }),
      true,
    );
  });

  it('rejects missing identity, invalid request type, blank summary, and non-object details', () => {
    assert.equal(
      isCreateCommerceRequestPayload({
        requestType: 'support',
        summary: 'Need help.',
      }),
      false,
    );
    assert.equal(
      isCreateCommerceRequestPayload({
        customerId: 'cust_123',
        requestType: 'other',
        summary: 'Need help.',
      }),
      false,
    );
    assert.equal(
      isCreateCommerceRequestPayload({
        customerId: 'cust_123',
        requestType: 'support',
        summary: '   ',
      }),
      false,
    );
    assert.equal(
      isCreateCommerceRequestPayload({
        customerId: 'cust_123',
        requestType: 'support',
        summary: 'Need help.',
        details: ['not', 'an', 'object'],
      }),
      false,
    );
  });
});
