import { MonitoringFlow } from '@/components/subscribe/monitoring-flow';

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
    />
  );
}
