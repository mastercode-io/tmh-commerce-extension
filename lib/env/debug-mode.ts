const DEBUG_TRUE_VALUES = new Set(['1', 'true', 'yes', 'on']);

export function isDebugModeEnabled() {
  const configuredValue =
    process.env.DEV_MODE ?? process.env.NEXT_PUBLIC_DEV_MODE;

  if (typeof configuredValue === 'string') {
    return DEBUG_TRUE_VALUES.has(configuredValue.trim().toLowerCase());
  }

  return process.env.NODE_ENV !== 'production';
}
