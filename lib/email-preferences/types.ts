export const NOTIFICATION_OPTION_LABELS = [
  'Tell Me More',
  'Keep Me Posted',
  'No Thanks',
] as const;

export type NotificationPreferenceOption =
  (typeof NOTIFICATION_OPTION_LABELS)[number];

export type NotificationPreferenceTopic = {
  topic: string;
  label: string;
  option: NotificationPreferenceOption;
};

export type NotificationPreferenceCategory = {
  category: string;
  topics: NotificationPreferenceTopic[];
};

export type NotificationPreferencesPayload = NotificationPreferenceCategory[];
