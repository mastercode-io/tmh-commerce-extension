import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  isNotificationPreferenceCategory,
  isNotificationPreferencesOptOutRequest,
  isNotificationPreferencesSaveRequest,
} from '../lib/email-preferences/validators.ts';

const category = {
  category: 'Newsletters',
  topics: [
    {
      topic: 'monthly_news',
      label: 'Monthly news',
      option: 'Keep Me Posted',
    },
  ],
};

describe('email preference validators', () => {
  it('accepts valid preference category and save payload shapes', () => {
    assert.equal(isNotificationPreferenceCategory(category), true);
    assert.equal(
      isNotificationPreferencesSaveRequest({
        email: 'amelia@example.com',
        categories: [category],
      }),
      true,
    );
  });

  it('accepts valid global opt-out payloads', () => {
    assert.equal(
      isNotificationPreferencesOptOutRequest({
        email: 'amelia@example.com',
        optOut: true,
      }),
      true,
    );
  });

  it('rejects malformed category topic options', () => {
    assert.equal(
      isNotificationPreferenceCategory({
        ...category,
        topics: [{ ...category.topics[0], option: 'Maybe Later' }],
      }),
      false,
    );
  });

  it('rejects invalid save and opt-out payloads', () => {
    assert.equal(
      isNotificationPreferencesSaveRequest({
        email: 'amelia@example.com',
        categories: [{ ...category, topics: 'not-an-array' }],
      }),
      false,
    );
    assert.equal(
      isNotificationPreferencesOptOutRequest({
        email: 'amelia@example.com',
        optOut: false,
      }),
      false,
    );
  });
});

