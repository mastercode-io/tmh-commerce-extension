import test from 'node:test';
import assert from 'node:assert/strict';

import {
  normalizeOrderStatus,
  normalizePaymentStatus,
  normalizeRequestStatus,
} from '../lib/commerce/status.ts';

test('normalizePaymentStatus maps locked renewal payment statuses', () => {
  assert.equal(normalizePaymentStatus('paid'), 'succeeded');
  assert.equal(normalizePaymentStatus('pending'), 'pending');
  assert.equal(normalizePaymentStatus('voided'), 'cancelled');
  assert.equal(normalizePaymentStatus('not_found'), 'cancelled');
  assert.equal(normalizePaymentStatus('failed'), 'failed');
});

test('normalizeRequestStatus collapses source variants into canonical app statuses', () => {
  assert.equal(normalizeRequestStatus('submitted'), 'submitted');
  assert.equal(normalizeRequestStatus('quoted'), 'triaged');
  assert.equal(normalizeRequestStatus('awaiting_customer'), 'awaiting_customer');
  assert.equal(normalizeRequestStatus('pending_checkout'), 'in_progress');
  assert.equal(normalizeRequestStatus('completed'), 'completed');
});

test('normalizeOrderStatus maps upstream states into current commerce order statuses', () => {
  assert.equal(normalizeOrderStatus('draft'), 'draft');
  assert.equal(normalizeOrderStatus('pending_checkout'), 'pending_checkout');
  assert.equal(normalizeOrderStatus('submitted'), 'pending_confirmation');
  assert.equal(normalizeOrderStatus('paid'), 'confirmed');
  assert.equal(normalizeOrderStatus('voided'), 'cancelled');
});
