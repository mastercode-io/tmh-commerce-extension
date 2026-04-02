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
import topicConfigs from '@/lib/email-preferences/topics.json';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type TopicOption = {
  id: string;
  title: string;
  subtitle: string;
};

type TopicConfig = {
  id: string;
  title: string;
  options: TopicOption[];
};

type TopicMeta = {
  accentClassName: string;
  icon: React.ComponentType<{ className?: string }>;
};

type MarketingPreference = 'only_if_relevant' | 'happy_to_receive' | 'opt_out';

type PreferenceChoice = {
  id: MarketingPreference;
  label: string;
};

const topics = topicConfigs as TopicConfig[];

const topicMetaById: Record<string, TopicMeta> = {
  'trademark-updates': {
    accentClassName: 'text-primary',
    icon: BellRing,
  },
  referrals: {
    accentClassName: 'text-emerald-600',
    icon: Gem,
  },
  financial: {
    accentClassName: 'text-rose-500',
    icon: Landmark,
  },
  legal: {
    accentClassName: 'text-slate-700',
    icon: Scale,
  },
  investing: {
    accentClassName: 'text-lime-700',
    icon: Sparkles,
  },
  business: {
    accentClassName: 'text-stone-700',
    icon: Briefcase,
  },
  newsletters: {
    accentClassName: 'text-primary',
    icon: Mail,
  },
};

const TRADEMARK_TOPIC_ID = 'trademark-updates';
const TRADEMARK_OPTION_ID = 'trademarkUpdates';
const DEFAULT_MARKETING_PREFERENCE: MarketingPreference = 'happy_to_receive';

const marketingTopics = topics.filter((topic) => topic.id !== TRADEMARK_TOPIC_ID);
const marketingOptionIds = marketingTopics.flatMap((topic) =>
  topic.options.map((option) => option.id),
);

const defaultMarketingSelections = Object.fromEntries(
  marketingOptionIds.map((optionId) => [optionId, DEFAULT_MARKETING_PREFERENCE]),
) as Record<string, MarketingPreference>;

const marketingChoices: PreferenceChoice[] = [
  {
    id: 'only_if_relevant',
    label: 'Tell me more',
  },
  {
    id: 'happy_to_receive',
    label: 'Keep me posted',
  },
  {
    id: 'opt_out',
    label: 'No thanks',
  },
];

export function NotificationSettingsPage({
  email,
}: {
  email?: string;
}) {
  const [savedEssentialOptIn, setSavedEssentialOptIn] = React.useState(true);
  const [essentialOptIn, setEssentialOptIn] = React.useState(true);
  const [savedMarketingSelections, setSavedMarketingSelections] = React.useState(
    defaultMarketingSelections,
  );
  const [marketingSelections, setMarketingSelections] = React.useState(
    defaultMarketingSelections,
  );
  const [isLoadingPreferences, setIsLoadingPreferences] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const normalizedEmail = email?.trim() ?? '';

  React.useEffect(() => {
    if (!normalizedEmail) {
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function loadPreferences() {
      setIsLoadingPreferences(true);
      setLoadError(null);

      try {
        const response = await fetch(
          `/api/settings/notifications?email=${encodeURIComponent(normalizedEmail)}`,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        const payload = (await response.json()) as
          | { message?: string }
          | { emailOptions?: Record<string, boolean> };

        if (!response.ok) {
          throw new Error(
            'message' in payload && typeof payload.message === 'string'
              ? payload.message
              : 'Unable to load notification preferences.',
          );
        }

        if (cancelled) {
          return;
        }

        const nextEmailOptions =
          'emailOptions' in payload && payload.emailOptions
            ? payload.emailOptions
            : {};
        const nextEssentialOptIn =
          typeof nextEmailOptions[TRADEMARK_OPTION_ID] === 'boolean'
            ? nextEmailOptions[TRADEMARK_OPTION_ID]
            : true;

        const nextMarketingSelections = { ...defaultMarketingSelections };

        for (const optionId of marketingOptionIds) {
          const optionValue = nextEmailOptions[optionId];

          if (optionValue === true) {
            nextMarketingSelections[optionId] = DEFAULT_MARKETING_PREFERENCE;
          }

          if (optionValue === false) {
            nextMarketingSelections[optionId] = 'opt_out';
          }
        }

        setEssentialOptIn(nextEssentialOptIn);
        setSavedEssentialOptIn(nextEssentialOptIn);
        setMarketingSelections(nextMarketingSelections);
        setSavedMarketingSelections(nextMarketingSelections);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : 'Unable to load notification preferences.',
        );
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
  }, [normalizedEmail]);

  const isDirty =
    essentialOptIn !== savedEssentialOptIn ||
    JSON.stringify(marketingSelections) !== JSON.stringify(savedMarketingSelections);

  const warningVisible = !essentialOptIn;
  const isGlobalMarketingOptOut = marketingOptionIds.every(
    (optionId) => marketingSelections[optionId] === 'opt_out',
  );

  function updateMarketingPreference(
    optionId: string,
    value: MarketingPreference,
  ) {
    setMarketingSelections((current) => ({
      ...current,
      [optionId]: value,
    }));
  }

  function toggleGlobalMarketingOptOut() {
    setMarketingSelections((current) => {
      const nextValue = Object.values(current).every(
        (selection) => selection === 'opt_out',
      )
        ? DEFAULT_MARKETING_PREFERENCE
        : 'opt_out';

      return Object.fromEntries(
        marketingOptionIds.map((optionId) => [optionId, nextValue]),
      ) as Record<string, MarketingPreference>;
    });
  }

  function handleSave() {
    setSavedEssentialOptIn(essentialOptIn);
    setSavedMarketingSelections(marketingSelections);
  }

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 pb-10">
      <PageHeader
        title="Email Preferences"
        description="Manage essential trademark communications separately from optional marketing content."
      />

      {normalizedEmail ? (
        <div className="text-muted-foreground -mt-3 text-sm">
          Managing preferences for{' '}
          <span className="text-foreground font-medium">{normalizedEmail}</span>
          {isLoadingPreferences ? '...' : null}
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
          {loadError}
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={!isDirty || isLoadingPreferences}>
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
                  <p className="mt-1 text-sm text-rose-950/80">
                    Unsubscribing means you may not receive urgent trademark
                    deadlines or opposition alerts until after a deadline has
                    passed. Save changes only if you are certain.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-slate-300">
        <CardHeader className="border-b">
          <CardTitle>Email Preferences</CardTitle>
          <p className="text-muted-foreground text-sm">
            Choose how open you are to optional marketing and partner
            communications. By default, every option starts in the middle
            “I&apos;m happy to receive it” column.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6">
          {marketingTopics.map((topic) => {
            const meta = topicMetaById[topic.id];
            const Icon = meta.icon;

            return (
              <section key={topic.id} className="grid gap-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Icon className={cn('size-4', meta.accentClassName)} />
                  <h2 className="text-base font-semibold">{topic.title}</h2>
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
                  {topic.options.map((option) => (
                    <div
                      key={option.id}
                      className="grid gap-3 border-b border-slate-200 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))] md:gap-4 md:items-start"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{option.title}</div>
                        <p className="text-muted-foreground mt-1 text-xs leading-5">
                          {option.subtitle}
                        </p>
                      </div>

                      {marketingChoices.map((choice) => (
                        <label
                          key={choice.id}
                          className="flex items-center gap-2 text-sm md:justify-center"
                        >
                          <input
                            type="radio"
                            name={option.id}
                            checked={marketingSelections[option.id] === choice.id}
                            onChange={() =>
                              updateMarketingPreference(option.id, choice.id)
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
                  opt out. If you change any single row back, this switch will
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
        <Button size="lg" onClick={handleSave} disabled={!isDirty || isLoadingPreferences}>
          <Mail className="size-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
