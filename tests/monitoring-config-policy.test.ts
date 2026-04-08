import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  canUseMockMonitoringSubscriptionFor,
  isStrictMonitoringIntegrationRequiredFor,
} from '../lib/monitoring/config-policy.ts';

describe('monitoring subscription config policy', () => {
  it('allows mock fallback for local development when Zoho is not configured', () => {
    assert.equal(
      canUseMockMonitoringSubscriptionFor({
        hasZohoCustomApi: false,
      }),
      true,
    );
  });

  it('disables mock fallback when Zoho is configured', () => {
    assert.equal(
      canUseMockMonitoringSubscriptionFor({
        hasZohoCustomApi: true,
      }),
      false,
    );
  });

  it('requires strict integration in production', () => {
    assert.equal(
      isStrictMonitoringIntegrationRequiredFor({
        hasZohoCustomApi: false,
        vercelEnv: 'production',
      }),
      true,
    );
    assert.equal(
      canUseMockMonitoringSubscriptionFor({
        hasZohoCustomApi: false,
        vercelEnv: 'production',
      }),
      false,
    );
  });

  it('requires strict integration when explicitly enabled', () => {
    assert.equal(
      isStrictMonitoringIntegrationRequiredFor({
        hasZohoCustomApi: false,
        requireZohoMonitoringSubscription: 'true',
      }),
      true,
    );
    assert.equal(
      canUseMockMonitoringSubscriptionFor({
        hasZohoCustomApi: false,
        requireZohoMonitoringSubscription: 'true',
      }),
      false,
    );
  });
});

