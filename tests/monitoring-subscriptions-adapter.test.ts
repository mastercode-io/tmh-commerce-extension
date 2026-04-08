import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMonitoringClientDataPayload } from '../lib/monitoring/normalize.ts';

test('normalizeMonitoringClientDataPayload maps title-case trademark enums', () => {
  const input = {
    token: 'abc',
    clientName: 'Test360 Limited',
    helpPhoneNumber: '7555123456',
    helpEmail: 'test55@example.com',
    bookingUrl: 'https://bookings.thetrademarkhelpline.com',
    trademarks: [
      {
        id: '1',
        name: 'INCERTS',
        brandName: 'INCERTS',
        jurisdiction: 'UK',
        type: 'Word',
        status: 'Registered',
        expiryDate: '2026-11-28',
      },
      {
        id: '2',
        name: 'Taith360',
        brandName: 'Taith360',
        jurisdiction: 'UK',
        type: 'Figurative',
        status: 'Pending',
      },
      {
        id: '3',
        name: 'Example',
        brandName: 'Example',
        jurisdiction: 'UK',
        type: 'Combined Mark',
        status: 'Expired',
      },
    ],
  };

  const normalized = normalizeMonitoringClientDataPayload(input) as {
    trademarks: Array<{ type: string; status: string }>;
  };

  assert.deepEqual(
    normalized.trademarks.map((trademark) => ({
      type: trademark.type,
      status: trademark.status,
    })),
    [
      { type: 'word_mark', status: 'registered' },
      { type: 'figurative', status: 'pending' },
      { type: 'combined', status: 'expired' },
    ],
  );
});
