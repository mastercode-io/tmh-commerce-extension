import { RenewalOrderScreen } from '@/components/renewal/renewal-order-screen';
import { canUseMockRenewals } from '@/lib/renewals/config';

export default async function RenewalOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return (
    <RenewalOrderScreen
      orderId={orderId}
      showDemoHelpers={canUseMockRenewals()}
    />
  );
}
