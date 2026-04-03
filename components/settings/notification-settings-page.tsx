'use client';

import * as React from 'react';
import {
  AlertTriangle,
  BellRing,
  Briefcase,
  Gem,
  Landmark,
  Mail,
  Scale,
  Sparkles,
} from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type {
  NotificationPreferenceOption,
  NotificationPreferencesPayload,
} from '@/lib/email-preferences/types';
import { NOTIFICATION_OPTION_LABELS } from '@/lib/email-preferences/types';
import { cn } from '@/lib/utils';

type TopicMeta = {
  accentClassName: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NotificationPreferencesResponse = {
  email?: string;
  categories?: NotificationPreferencesPayload;
  message?: string;
  debug?: {
    requestMethod: 'GET' | 'POST';
    requestUrl: string;
    upstreamStatus: number;
    responsePayload: unknown;
    responseBody: unknown;
  };
};

class NotificationLoadError extends Error {
  status: number;
  debug?: NotificationPreferencesResponse['debug'];

  constructor(
    message: string,
    status: number,
    debug?: NotificationPreferencesResponse['debug'],
  ) {
    super(message);
    this.name = 'NotificationLoadError';
    this.status = status;
    this.debug = debug;
  }
}

type PreferenceChoice = {
  id: NotificationPreferenceOption;
  label: string;
};

const marketingChoices: PreferenceChoice[] = NOTIFICATION_OPTION_LABELS.map((label) => ({
  id: label,
  label,
}));

const topicMetaByCategory: Record<string, TopicMeta> = {
  Newsletters: {
    accentClassName: 'text-primary',
    icon: Mail,
  },
  'Earning Through Referrals': {
    accentClassName: 'text-emerald-600',
    icon: Gem,
  },
  'Financial Advice': {
    accentClassName: 'text-rose-500',
    icon: Landmark,
  },
  'Legal Services': {
    accentClassName: 'text-slate-700',
    icon: Scale,
  },
  Investing: {
    accentClassName: 'text-lime-700',
    icon: Sparkles,
  },
  'Business Services': {
    accentClassName: 'text-stone-700',
    icon: Briefcase,
  },
};

function areCategoriesEqual(
  left: NotificationPreferencesPayload,
  right: NotificationPreferencesPayload,
) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function getFriendlyLoadErrorMessage(status: number, fallback?: string) {
  if (status === 400) {
    return 'We could not load your email preferences because the link is missing an email address.';
  }

  if (status === 404) {
    return 'We could not find any email preferences for this email address.';
  }

  return fallback ?? 'Unable to load notification preferences.';
}

export function NotificationSettingsPage({
  email,
  devMode,
}: {
  email?: string;
  devMode: boolean;
}) {
  const [savedEssentialOptIn, setSavedEssentialOptIn] = React.useState(true);
  const [essentialOptIn, setEssentialOptIn] = React.useState(true);
  const [savedCategories, setSavedCategories] =
    React.useState<NotificationPreferencesPayload>([]);
  const [categories, setCategories] =
    React.useState<NotificationPreferencesPayload>([]);
  const [isLoadingPreferences, setIsLoadingPreferences] = React.useState(false);
  const [isSavingPreferences, setIsSavingPreferences] = React.useState(false);
  const [pageError, setPageError] = React.useState<string | null>(null);
  const [hasBlockingLoadError, setHasBlockingLoadError] = React.useState(false);
  const [hasResolvedInitialLoad, setHasResolvedInitialLoad] = React.useState(false);
  const [debugPayload, setDebugPayload] =
    React.useState<NotificationPreferencesResponse['debug'] | null>(null);
  const normalizedEmail = email?.trim() ?? '';

  React.useEffect(() => {
    let cancelled = false;

    async function loadPreferences() {
      setIsLoadingPreferences(true);
      setPageError(null);
      setHasBlockingLoadError(false);
      setHasResolvedInitialLoad(false);
      setDebugPayload(null);

      try {
        const url = normalizedEmail
          ? `/api/settings/notifications?email=${encodeURIComponent(normalizedEmail)}`
          : '/api/settings/notifications';
        const response = await fetch(url, {
          method: 'GET',
          cache: 'no-store',
        });
        const payload = (await response.json()) as NotificationPreferencesResponse;

        if (!response.ok) {
          throw new NotificationLoadError(
            getFriendlyLoadErrorMessage(response.status, payload.message),
            response.status,
            payload.debug,
          );
        }

        if (cancelled) {
          return;
        }

        const nextCategories = payload.categories ?? [];

        setCategories(nextCategories);
        setSavedCategories(nextCategories);
        setDebugPayload(payload.debug ?? null);
        setHasResolvedInitialLoad(true);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setCategories([]);
        setSavedCategories([]);
        setHasBlockingLoadError(true);
        setPageError(
          error instanceof NotificationLoadError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Unable to load notification preferences.',
        );
        setDebugPayload(
          error instanceof NotificationLoadError ? error.debug ?? null : null,
        );
        setHasResolvedInitialLoad(true);
      } finally {
        if (!cancelled) {
          setIsLoadingPreferences(false);
        }
      }
    }

    void loadPreferences();

    return () => {
      cancelled = true;
    };
  }, [devMode, normalizedEmail]);

  const isDirty =
    essentialOptIn !== savedEssentialOptIn || !areCategoriesEqual(categories, savedCategories);

  const warningVisible = !essentialOptIn;
  const showMarketingPreferences = essentialOptIn;
  const isGlobalMarketingOptOut =
    categories.length > 0 &&
    categories.every((category) =>
      category.topics.every((topic) => topic.option === 'No Thanks'),
    );

  function updateTopicOption(
    categoryIndex: number,
    topicIndex: number,
    option: NotificationPreferenceOption,
  ) {
    setCategories((current) =>
      current.map((category, currentCategoryIndex) => {
        if (currentCategoryIndex !== categoryIndex) {
          return category;
        }

        return {
          ...category,
          topics: category.topics.map((topic, currentTopicIndex) =>
            currentTopicIndex === topicIndex ? { ...topic, option } : topic,
          ),
        };
      }),
    );
  }

  function toggleGlobalMarketingOptOut() {
    setCategories((current) => {
      const nextOption: NotificationPreferenceOption =
        current.length > 0 &&
        current.every((category) =>
          category.topics.every((topic) => topic.option === 'No Thanks'),
        )
          ? 'Keep Me Posted'
          : 'No Thanks';

      return current.map((category) => ({
        ...category,
        topics: category.topics.map((topic) => ({
          ...topic,
          option: nextOption,
        })),
      }));
    });
  }

  async function handleSave() {
    setIsSavingPreferences(true);
    setPageError(null);

    try {
      const url = normalizedEmail
        ? `/api/settings/notifications?email=${encodeURIComponent(normalizedEmail)}`
        : '/api/settings/notifications';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(categories),
      });
      const payload = (await response.json()) as NotificationPreferencesResponse;

      if (!response.ok) {
        setDebugPayload(payload.debug ?? debugPayload);
        throw new Error(payload.message ?? 'Unable to save notification preferences.');
      }

      const nextCategories = payload.categories ?? categories;

      setCategories(nextCategories);
      setSavedCategories(nextCategories);
      setSavedEssentialOptIn(essentialOptIn);
      setDebugPayload(payload.debug ?? debugPayload);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : 'Unable to save notification preferences.',
      );
    } finally {
      setIsSavingPreferences(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 pb-10">
      {hasResolvedInitialLoad ? (
        <>
          <PageHeader
            title="Email Preferences"
            description="Manage essential trademark communications separately from optional marketing content."
          />

          {normalizedEmail && !hasBlockingLoadError ? (
            <div className="text-muted-foreground -mt-3 text-sm">
              Managing preferences for{' '}
              <span className="text-foreground font-medium">{normalizedEmail}</span>
              {isLoadingPreferences ? '...' : null}
            </div>
          ) : null}

          {pageError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
              {pageError}
            </div>
          ) : null}

          {!hasBlockingLoadError ? (
            <>
              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={handleSave}
                  disabled={!isDirty || isLoadingPreferences || isSavingPreferences}
                >
                  <Mail className="size-4" />
                  Save Changes
                </Button>
              </div>

              <Card className="overflow-hidden border-slate-300">
                <CardHeader className="border-b">
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="text-primary size-4" />
                    Essential Trademark Updates
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    These communications cover important deadlines, office actions, and
                    opposition notices related to your trademarks.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-5 pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="radio"
                        name="essential-updates"
                        checked={essentialOptIn}
                        onChange={() => setEssentialOptIn(true)}
                        className="accent-primary size-4"
                      />
                      <span>Opt in</span>
                    </label>

                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="radio"
                        name="essential-updates"
                        checked={!essentialOptIn}
                        onChange={() => setEssentialOptIn(false)}
                        className="accent-primary size-4"
                      />
                      <span>Opt out</span>
                    </label>
                  </div>

                  <div className="text-sm leading-6 text-slate-700">
                    Please note, if we are representative on your trademarks and you opt
                    out of Essential Trademark Updates, you must remove us as
                    representative on each relevant brand database to avoid missing
                    essential notifications that could affect an application or
                    registration.
                  </div>

                  {warningVisible ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-4">
                      <div className="flex items-start gap-3">
                        <div className="bg-primary text-primary-foreground mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md">
                          <AlertTriangle className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold">Critical warning</div>
                          <div className="mt-1 text-sm text-rose-950/80">
                            Unsubscribing means you may not receive urgent trademark
                            deadlines or opposition alerts until after a deadline has
                            passed.
                            <br />
                            <strong className="font-semibold text-rose-950">
                              Save changes only if you are certain.
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {showMarketingPreferences ? (
                <>
                  <Card className="overflow-hidden border-slate-300">
                    <CardHeader className="border-b">
                      <CardTitle>Email Preferences</CardTitle>
                      <p className="text-muted-foreground text-sm">
                        Choose how open you are to optional marketing and partner
                        communications.
                      </p>
                    </CardHeader>
                    <CardContent className="grid gap-6 pt-6">
                      {categories.map((category, categoryIndex) => {
                        const meta = topicMetaByCategory[category.category];
                        const Icon = meta?.icon ?? Mail;

                        return (
                          <section key={category.category} className="grid gap-4">
                            <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                              <Icon
                                className={cn(
                                  'size-4',
                                  meta?.accentClassName ?? 'text-slate-500',
                                )}
                              />
                              <h2 className="text-base font-semibold">{category.category}</h2>
                            </div>

                            <div className="hidden border-b border-dashed border-slate-200 pb-2 md:grid md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] md:gap-4">
                              <div className="text-muted-foreground text-xs font-medium">
                                Topic
                              </div>
                              {marketingChoices.map((choice) => (
                                <div
                                  key={choice.id}
                                  className="text-muted-foreground text-center text-xs font-medium"
                                >
                                  {choice.label}
                                </div>
                              ))}
                            </div>

                            <div className="grid gap-0">
                              {category.topics.map((topic, topicIndex) => (
                                <div
                                  key={`${category.category}-${topic.topic}`}
                                  className="grid gap-3 border-b border-slate-200 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] md:gap-4 md:items-start"
                                >
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium">{topic.label}</div>
                                  </div>

                                  {marketingChoices.map((choice) => (
                                    <label
                                      key={choice.id}
                                      className="flex items-center gap-2 text-sm md:justify-center"
                                    >
                                      <input
                                        type="radio"
                                        name={`${category.category}-${topic.topic}`}
                                        checked={topic.option === choice.id}
                                        onChange={() =>
                                          updateTopicOption(categoryIndex, topicIndex, choice.id)
                                        }
                                        className="accent-primary size-4"
                                      />
                                      <span className="md:hidden">{choice.label}</span>
                                    </label>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </section>
                        );
                      })}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-semibold">Opt out of all marketing</div>
                            <p className="text-muted-foreground mt-1 text-xs leading-5">
                              Turn this on to move every optional marketing preference to
                              No Thanks. If you change any single row back, this switch will
                              automatically return to off.
                            </p>
                          </div>

                          <button
                            type="button"
                            role="switch"
                            aria-checked={isGlobalMarketingOptOut}
                            onClick={toggleGlobalMarketingOptOut}
                            className={cn(
                              'relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors',
                              isGlobalMarketingOptOut
                                ? 'border-primary/20 bg-primary'
                                : 'border-slate-300 bg-slate-200',
                            )}
                          >
                            <span
                              className={cn(
                                'bg-background pointer-events-none inline-block size-5 rounded-full border border-white/80 shadow-sm transition-transform',
                                isGlobalMarketingOptOut ? 'translate-x-6' : 'translate-x-1',
                              )}
                            />
                            <span className="sr-only">Toggle opt out of all marketing</span>
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-end">
                    <Button
                      size="lg"
                      onClick={handleSave}
                      disabled={!isDirty || isLoadingPreferences || isSavingPreferences}
                    >
                      <Mail className="size-4" />
                      Save Changes
                    </Button>
                  </div>
                </>
              ) : null}
            </>
          ) : null}

          {devMode && debugPayload ? (
            <Card className="overflow-hidden border-slate-300">
              <CardContent className="pt-4">
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900">
                    CRM Debug Response
                  </summary>
                  <div className="text-muted-foreground mt-3 text-xs">
                    {debugPayload.requestMethod} {debugPayload.requestUrl}
                    <span className="ml-3 font-medium text-slate-700">
                      Status {debugPayload.upstreamStatus}
                    </span>
                  </div>
                  <pre className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs leading-5 text-slate-800">
                    {JSON.stringify(debugPayload.responsePayload, null, 2)}
                  </pre>
                </details>
              </CardContent>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
