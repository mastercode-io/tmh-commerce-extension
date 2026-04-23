import test from 'node:test';
import assert from 'node:assert/strict';

import { pollPaymentStatus } from '../lib/commerce/payment-polling.ts';

test('pollPaymentStatus resolves when a terminal status is reached', async () => {
  const snapshots = [
    { status: 'pending' as const },
    { status: 'pending' as const },
    { status: 'succeeded' as const, updatedAt: '2026-04-12T10:07:00.000Z' },
  ];

  let index = 0;

  const result = await pollPaymentStatus(
    async () => snapshots[index++] ?? snapshots[snapshots.length - 1],
    {
      initialFastIntervalMs: 1,
      initialFastDurationMs: 2,
      midIntervalMs: 1,
      midDurationMs: 2,
      slowIntervalMs: 1,
      timeoutMs: 10,
    },
  );

  assert.equal(result.status, 'succeeded');
  assert.equal(result.lastSnapshot?.updatedAt, '2026-04-12T10:07:00.000Z');
});

test('pollPaymentStatus times out when status never becomes terminal', async () => {
  const result = await pollPaymentStatus(
    async () => ({ status: 'pending' as const }),
    {
      initialFastIntervalMs: 1,
      initialFastDurationMs: 1,
      midIntervalMs: 1,
      midDurationMs: 1,
      slowIntervalMs: 1,
      timeoutMs: 5,
    },
  );

  assert.equal(result.status, 'timeout');
  assert.equal(result.lastSnapshot?.status, 'pending');
});
