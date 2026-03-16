import { SubscriptionConfirmation } from '@/components/subscribe/subscription-confirmation';

export default async function MonitoringConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; session?: string }>;
}) {
  const { token, session } = await searchParams;

  return (
    <SubscriptionConfirmation token={token ?? null} session={session ?? null} />
  );
}
