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

import topicConfigs from '@/lib/email-preferences/topics.json';
import { PageHeader } from '@/components/common/page-header';
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
const NEWSLETTER_TOPIC_ID = 'newsletters';

const defaultSelectedOptionIds = new Set([
  TRADEMARK_OPTION_ID,
  'businessBrandIdentity',
]);

const allOptionIds = topics.flatMap((topic) => topic.options.map((option) => option.id));

const defaultSelections = Object.fromEntries(
  allOptionIds.map((optionId) => [optionId, defaultSelectedOptionIds.has(optionId)])
) as Record<string, boolean>;

const marketingOptionIds = topics
  .filter((topic) => topic.id !== TRADEMARK_TOPIC_ID)
  .flatMap((topic) => topic.options.map((option) => option.id));

function PreferenceCheckbox({
  checked,
  onChange,
  title,
  subtitle,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  subtitle: string;
}) {
  return (
    <label className="flex items-start gap-3 rounded-lg border border-transparent px-1 py-1.5 transition-colors hover:border-border/80">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="border-input text-primary accent-primary mt-0.5 size-4 rounded"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="text-muted-foreground mt-1 block text-xs">{subtitle}</span>
      </span>
    </label>
  );
}

function SelectAllButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-primary text-xs font-medium transition-opacity hover:opacity-80"
    >
      {label}
    </button>
  );
}

export function NotificationSettingsPage() {
  const [savedSelections, setSavedSelections] =
    React.useState<Record<string, boolean>>(defaultSelections);
  const [selections, setSelections] =
    React.useState<Record<string, boolean>>(defaultSelections);
  const [savedUnsubscribeMarketing, setSavedUnsubscribeMarketing] =
    React.useState(false);
  const [unsubscribeMarketing, setUnsubscribeMarketing] =
    React.useState(false);

  const isDirty =
    JSON.stringify({
      selections,
      unsubscribeMarketing,
    }) !==
    JSON.stringify({
      selections: savedSelections,
      unsubscribeMarketing: savedUnsubscribeMarketing,
    });

  const warningVisible = !selections[TRADEMARK_OPTION_ID];

  function updateOption(optionId: string, value: boolean) {
    setSelections((current) => ({ ...current, [optionId]: value }));

    if (value && marketingOptionIds.includes(optionId)) {
      setUnsubscribeMarketing(false);
    }
  }

  function setTopicSelections(optionIds: string[], value: boolean) {
    setSelections((current) => {
      const next = { ...current };

      for (const optionId of optionIds) {
        next[optionId] = value;
      }

      return next;
    });

    if (value && optionIds.some((optionId) => marketingOptionIds.includes(optionId))) {
      setUnsubscribeMarketing(false);
    }
  }

  function toggleMarketingUnsubscribe() {
    setUnsubscribeMarketing((current) => {
      const nextValue = !current;

      if (nextValue) {
        setSelections((selectionState) => {
          const nextSelections = { ...selectionState };

          for (const optionId of marketingOptionIds) {
            nextSelections[optionId] = false;
          }

          return nextSelections;
        });
      }

      return nextValue;
    });
  }

  function handleSave() {
    setSavedSelections(selections);
    setSavedUnsubscribeMarketing(unsubscribeMarketing);
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 pb-8">
      <PageHeader
        title="Email Preferences"
        description="Manage how we communicate with you regarding your portfolio and opportunities."
      />

      <div className="-mt-2 flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={!isDirty}>
          <Mail className="size-4" />
          Save Changes
        </Button>
      </div>

      {warningVisible ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md">
              <AlertTriangle className="size-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Essential Trademark Updates</div>
              <p className="text-foreground/70 mt-1 text-xs">
                You are currently receiving critical notifications about your
                active trademarks, including legal deadlines and opposition
                alerts.
              </p>

              <div className="mt-4 rounded-lg border border-rose-200 bg-background/60 p-3 text-xs text-rose-900">
                <div className="grid gap-1">
                  <div className="font-semibold tracking-[0.16em] uppercase">
                    Critical warning
                  </div>
                  <p className="leading-5">
                    Unsubscribing means you may not receive urgent trademark
                    deadlines or opposition alerts until after a deadline has
                    passed. Save changes only if you are certain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {topics.map((topic) => {
        const meta = topicMetaById[topic.id];
        const Icon = meta.icon;
        const isAllSelected = topic.options.every(
          (option) => selections[option.id]
        );
        const optionIds = topic.options.map((option) => option.id);

        return (
          <Card key={topic.id} className="bg-background">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  {topic.id === NEWSLETTER_TOPIC_ID ? (
                    <span className="bg-primary/10 text-primary inline-flex size-6 items-center justify-center rounded-md">
                      <Icon className="size-3.5" />
                    </span>
                  ) : (
                    <Icon className={cn('size-4', meta.accentClassName)} />
                  )}
                  {topic.title}
                </CardTitle>

                <SelectAllButton
                  label={isAllSelected ? 'Deselect all' : 'Select all'}
                  onClick={() => setTopicSelections(optionIds, !isAllSelected)}
                />
              </div>
            </CardHeader>
            <CardContent
              className={cn(
                'pt-4',
                topic.options.length > 1 ? 'grid gap-4 md:grid-cols-2' : 'grid gap-4'
              )}
            >
              {topic.options.map((option) => (
                <PreferenceCheckbox
                  key={option.id}
                  checked={selections[option.id]}
                  onChange={(checked) => updateOption(option.id, checked)}
                  title={option.title}
                  subtitle={option.subtitle}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card className="border-l-4 border-l-primary bg-rose-50/60 ring-rose-200">
        <CardContent className="flex items-center justify-between gap-4 pt-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">Unsubscribe from all marketing</div>
            <p className="text-muted-foreground mt-1 text-xs">
              Stop receiving all non-essential promotional and educational content.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={unsubscribeMarketing}
            onClick={toggleMarketingUnsubscribe}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
              unsubscribeMarketing
                ? 'border-primary/20 bg-primary'
                : 'border-rose-300 bg-rose-100'
            )}
          >
            <span
              className={cn(
                'bg-background border-white/80 pointer-events-none inline-block size-5 rounded-full border shadow-sm transition-transform',
                unsubscribeMarketing ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
            <span className="sr-only">Toggle marketing unsubscribe</span>
          </button>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleSave} disabled={!isDirty}>
          <Mail className="size-4" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}
