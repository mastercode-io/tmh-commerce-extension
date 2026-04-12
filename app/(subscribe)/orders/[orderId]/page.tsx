import { RenewalOrderScreen } from '@/components/renewal/renewal-order-screen';

export default async function RenewalOrderPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <RenewalOrderScreen orderId={orderId} />;
}
