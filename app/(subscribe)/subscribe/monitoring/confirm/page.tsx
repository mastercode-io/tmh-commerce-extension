import { SubscriptionConfirmation } from '@/components/subscribe/subscription-confirmation';
import { canUseMockMonitoringSubscription } from '@/lib/monitoring/config';

export default async function MonitoringConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; session?: string }>;
}) {
  const { token, session } = await searchParams;

  return (
    <SubscriptionConfirmation
      token={token ?? null}
      session={session ?? null}
      showDemoHelpers={canUseMockMonitoringSubscription()}
    />
  );
}
