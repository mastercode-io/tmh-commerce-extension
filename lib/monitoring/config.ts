import { createMonitoringError } from '@/lib/monitoring/mock-data';
import { MonitoringServiceError } from '@/lib/monitoring/errors';
import { canUseMockMonitoringSubscriptionFor } from '@/lib/monitoring/config-policy';
import { isMonitoringSubscriptionCustomApiConfigured } from '@/lib/zoho/subscriptions';

export function canUseMockMonitoringSubscription() {
  return canUseMockMonitoringSubscriptionFor({
    requireZohoMonitoringSubscription:
      process.env.TMH_REQUIRE_ZOHO_MONITORING_SUBSCRIPTION,
    vercelEnv: process.env.VERCEL_ENV,
    hasZohoCustomApi: isMonitoringSubscriptionCustomApiConfigured(),
  });
}

export function assertMonitoringSubscriptionIntegration(correlationId: string) {
  if (isMonitoringSubscriptionCustomApiConfigured() || canUseMockMonitoringSubscription()) {
    return;
  }

  throw new MonitoringServiceError(
    createMonitoringError(
      'config_error',
      'Monitoring subscription integration is not configured.',
    ),
    500,
    correlationId,
  );
}
