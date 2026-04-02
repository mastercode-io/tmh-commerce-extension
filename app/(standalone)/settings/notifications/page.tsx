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

  return <NotificationSettingsPage email={email ?? ''} />;
}
