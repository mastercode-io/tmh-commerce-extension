import { RenewalConfirmationScreen } from '@/components/renewal/renewal-confirmation-screen';

export default async function RenewalConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;

  return <RenewalConfirmationScreen orderId={orderId} />;
}
