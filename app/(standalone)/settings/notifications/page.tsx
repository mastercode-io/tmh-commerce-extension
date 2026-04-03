import { NotificationSettingsPage } from '@/components/settings/notification-settings-page';

type SettingsNotificationsPageProps = {
  searchParams: Promise<{
    email?: string | string[];
  }>;
};

export default async function SettingsNotificationsPage({
  searchParams,
}: SettingsNotificationsPageProps) {
  const params = await searchParams;
  const rawEmail = params.email;
  const email = Array.isArray(rawEmail) ? rawEmail[0] : rawEmail;
  const devMode = process.env.DEV_MODE?.toLowerCase() === 'true';
  const bookingUrl =
    process.env.TMH_GENERAL_ENQUIRY_BOOKING_URL ??
    'https://bookings.thetrademarkhelpline.com/#/general-enquiry';

  return (
    <NotificationSettingsPage
      email={email ?? ''}
      devMode={devMode}
      bookingUrl={bookingUrl}
    />
  );
}
