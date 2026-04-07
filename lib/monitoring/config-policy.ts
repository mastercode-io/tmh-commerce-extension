export type MonitoringSubscriptionConfigPolicyInput = {
  requireZohoMonitoringSubscription?: string;
  vercelEnv?: string;
  hasZohoCustomApi: boolean;
};

export function isStrictMonitoringIntegrationRequiredFor({
  requireZohoMonitoringSubscription,
  vercelEnv,
}: MonitoringSubscriptionConfigPolicyInput) {
  return (
    requireZohoMonitoringSubscription === 'true' || vercelEnv === 'production'
  );
}

export function canUseMockMonitoringSubscriptionFor(
  input: MonitoringSubscriptionConfigPolicyInput,
) {
  return (
    !isStrictMonitoringIntegrationRequiredFor(input) && !input.hasZohoCustomApi
  );
}

