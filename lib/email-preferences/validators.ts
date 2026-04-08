import type {
  NotificationPreferenceCategory,
  NotificationPreferencesOptOutRequest,
  NotificationPreferencesSaveRequest,
} from '@/lib/email-preferences/types';

const VALID_NOTIFICATION_OPTION_LABELS = new Set([
  'Tell Me More',
  'Keep Me Posted',
  'No Thanks',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object';
}

export function isNotificationPreferenceCategory(
  value: unknown,
): value is NotificationPreferenceCategory {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.category !== 'string' || !Array.isArray(value.topics)) {
    return false;
  }

  return value.topics.every((topic) => {
    if (!isRecord(topic)) {
      return false;
    }

    return (
      typeof topic.topic === 'string' &&
      typeof topic.label === 'string' &&
      typeof topic.option === 'string' &&
      VALID_NOTIFICATION_OPTION_LABELS.has(topic.option)
    );
  });
}

export function isNotificationPreferencesSaveRequest(
  payload: unknown,
): payload is NotificationPreferencesSaveRequest {
  return (
    isRecord(payload) &&
    typeof payload.email === 'string' &&
    Array.isArray(payload.categories) &&
    payload.categories.every(isNotificationPreferenceCategory)
  );
}

export function isNotificationPreferencesOptOutRequest(
  payload: unknown,
): payload is NotificationPreferencesOptOutRequest {
  return (
    isRecord(payload) &&
    typeof payload.email === 'string' &&
    payload.optOut === true
  );
}
