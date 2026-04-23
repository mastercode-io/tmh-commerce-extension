import { RenewalFlow } from '@/components/renewal/renewal-flow';
import { canUseMockRenewals } from '@/lib/renewals/config';

export default async function RenewalPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <RenewalFlow
      initialToken={token ?? null}
      showDemoHelpers={canUseMockRenewals()}
    />
  );
}
