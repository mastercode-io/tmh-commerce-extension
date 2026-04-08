import { MonitoringFlow } from '@/components/subscribe/monitoring-flow';
import { canUseMockMonitoringSubscription } from '@/lib/monitoring/config';

export default async function MonitoringSubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; checkout?: string }>;
}) {
  const { token, checkout } = await searchParams;

  return (
    <MonitoringFlow
      initialToken={token ?? null}
      initialCheckoutState={checkout ?? null}
      showDemoHelpers={canUseMockMonitoringSubscription()}
    />
  );
}
