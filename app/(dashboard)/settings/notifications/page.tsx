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
import { cn } from '@/lib/utils';

type PreferenceState = {
  essentialUpdates: boolean;
  trademarkUpdates: boolean;
  unsubscribeMarketing: boolean;
  referralsAffiliatePrograms: boolean;
  referralsPartnerRewards: boolean;
  financialWealthManagement: boolean;
  financialTaxEfficiency: boolean;
  legalGlobalProtection: boolean;
  legalContractualGuidance: boolean;
  investingValuation: boolean;
  businessStrategicPlanning: boolean;
  businessBrandIdentity: boolean;
  newsletterTmh: boolean;
};

type MarketingKey = Exclude<
  keyof PreferenceState,
  'essentialUpdates' | 'trademarkUpdates' | 'unsubscribeMarketing'
>;

type CategoryItem = {
  key: MarketingKey;
  label: string;
  description: string;
};

type CategoryConfig = {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
  items: CategoryItem[];
};

const defaultPreferences: PreferenceState = {
  essentialUpdates: true,
  trademarkUpdates: true,
  unsubscribeMarketing: false,
  referralsAffiliatePrograms: false,
  referralsPartnerRewards: false,
  financialWealthManagement: false,
  financialTaxEfficiency: false,
  legalGlobalProtection: false,
  legalContractualGuidance: false,
  investingValuation: false,
  businessStrategicPlanning: false,
  businessBrandIdentity: true,
  newsletterTmh: false,
};

const categoryConfigs: CategoryConfig[] = [
  {
    id: 'referrals',
    title: 'Earning Through Referrals',
    icon: Gem,
    accentClassName: 'text-emerald-600',
    items: [
      {
        key: 'referralsAffiliatePrograms',
        label: 'Affiliate Programs',
        description: 'Offers on how to earn commissions by referring new clients.',
      },
      {
        key: 'referralsPartnerRewards',
        label: 'Partner Rewards',
        description: 'Exclusive bonus offers for our most active referral partners.',
      },
    ],
  },
  {
    id: 'financial',
    title: 'Financial Advice',
    icon: Landmark,
    accentClassName: 'text-rose-500',
    items: [
      {
        key: 'financialWealthManagement',
        label: 'Wealth Management',
        description: 'Insights on protecting and growing your business assets.',
      },
      {
        key: 'financialTaxEfficiency',
        label: 'Tax Efficiency',
        description: 'Updates on intellectual property tax benefits and credits.',
      },
    ],
  },
  {
    id: 'legal',
    title: 'Legal Services',
    icon: Scale,
    accentClassName: 'text-slate-700',
    items: [
      {
        key: 'legalGlobalProtection',
        label: 'Global Protection',
        description: 'News about international trademark laws and expansion.',
      },
      {
        key: 'legalContractualGuidance',
        label: 'Contractual Guidance',
        description: 'Updates on licensing agreements and IP transfer legalities.',
      },
    ],
  },
  {
    id: 'investing',
    title: 'Investing',
    icon: Sparkles,
    accentClassName: 'text-lime-700',
    items: [
      {
        key: 'investingValuation',
        label: 'Valuation',
        description: 'How to value your trademarks for potential investors.',
      },
    ],
  },
  {
    id: 'business',
    title: 'Business Services',
    icon: Briefcase,
    accentClassName: 'text-stone-700',
    items: [
      {
        key: 'businessStrategicPlanning',
        label: 'Strategic Planning',
        description: 'Quarterly business reviews and growth strategy updates.',
      },
      {
        key: 'businessBrandIdentity',
        label: 'Brand Identity',
        description: 'Resources for developing and protecting your brand’s visual identity.',
      },
    ],
  },
];

const marketingKeys: MarketingKey[] = categoryConfigs.flatMap((category) =>
  category.items.map((item) => item.key)
).concat('newsletterTmh');

function PreferenceCheckbox({
  checked,
  onChange,
  label,
  description,
  className,
  labelClassName,
  descriptionClassName,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
  className?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}) {
  return (
    <label
      className={cn(
        'flex items-start gap-3 rounded-lg border border-transparent px-1 py-1.5 transition-colors hover:border-border/80',
        className
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="border-input text-primary accent-primary mt-0.5 size-4 rounded"
      />
      <span className="min-w-0">
        <span className={cn('block text-sm font-medium', labelClassName)}>
          {label}
        </span>
        <span
          className={cn(
            'text-muted-foreground mt-1 block text-xs',
            descriptionClassName
          )}
        >
          {description}
        </span>
      </span>
    </label>
  );
}

function SelectAllButton({
  onClick,
  label = 'Select all',
}: {
  onClick: () => void;
  label?: string;
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

export default function NotificationSettingsPage() {
  const [savedPreferences, setSavedPreferences] =
    React.useState<PreferenceState>(defaultPreferences);
  const [preferences, setPreferences] =
    React.useState<PreferenceState>(defaultPreferences);

  const isDirty =
    JSON.stringify(preferences) !== JSON.stringify(savedPreferences);

  const warningVisible = !preferences.essentialUpdates;

  function updatePreference<Key extends keyof PreferenceState>(
    key: Key,
    value: PreferenceState[Key]
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function setAll(keys: MarketingKey[], value: boolean) {
    setPreferences((current) => {
      const next = { ...current };

      for (const key of keys) {
        next[key] = value;
      }

      if (value) {
        next.unsubscribeMarketing = false;
      }

      return next;
    });
  }

  function updateMarketingPreference(key: MarketingKey, value: boolean) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
      unsubscribeMarketing: value ? false : current.unsubscribeMarketing,
    }));
  }

  function toggleMarketingUnsubscribe() {
    setPreferences((current) => {
      const nextValue = !current.unsubscribeMarketing;
      const next = { ...current, unsubscribeMarketing: nextValue };

      if (nextValue) {
        for (const key of marketingKeys) {
          next[key] = false;
        }
      }

      return next;
    });
  }

  function handleSave() {
    setSavedPreferences(preferences);
  }

  function handleDiscard() {
    setPreferences(savedPreferences);
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-6 pb-8">
      <PageHeader
        title="Email Preferences"
        description="Manage how we communicate with you regarding your portfolio and opportunities."
        actions={
          <Button size="lg" onClick={handleSave} disabled={!isDirty}>
            <Mail className="size-4" />
            Save Changes
          </Button>
        }
      />

      <Card className="bg-background">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <BellRing className="text-primary size-4" />
            Essential Trademark Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          {warningVisible ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4">
              <div className="flex items-start gap-3">
                <div className="bg-primary text-primary-foreground mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md">
                  <AlertTriangle className="size-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <PreferenceCheckbox
                    checked={preferences.essentialUpdates}
                    onChange={(checked) =>
                      updatePreference('essentialUpdates', checked)
                    }
                    label="Essential Trademark Updates"
                    description="You are currently receiving critical notifications about your active trademarks, including legal deadlines and opposition alerts."
                    className="px-0 py-0 hover:border-transparent"
                    labelClassName="text-sm"
                    descriptionClassName="text-foreground/70"
                  />

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
          ) : (
            <PreferenceCheckbox
              checked={preferences.essentialUpdates}
              onChange={(checked) => updatePreference('essentialUpdates', checked)}
              label="Essential Trademark Updates"
              description="You are currently receiving critical notifications about your active trademarks, including legal deadlines and opposition alerts."
            />
          )}

          <PreferenceCheckbox
            checked={preferences.trademarkUpdates}
            onChange={(checked) => updatePreference('trademarkUpdates', checked)}
            label="Updates about your trademarks"
            description="Important notices and reminders."
          />
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-primary bg-rose-50/60 ring-rose-200">
        <CardContent className="flex items-center justify-between gap-4 pt-4">
          <div className="min-w-0">
            <div className="text-sm font-medium">
              Unsubscribe from all marketing
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              Stop receiving all non-essential promotional and educational content.
            </p>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={preferences.unsubscribeMarketing}
            onClick={toggleMarketingUnsubscribe}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
              preferences.unsubscribeMarketing
                ? 'border-primary/20 bg-primary'
                : 'border-rose-300 bg-rose-100'
            )}
          >
            <span
              className={cn(
                'bg-background border-white/80 pointer-events-none inline-block size-5 rounded-full border shadow-sm transition-transform',
                preferences.unsubscribeMarketing ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
            <span className="sr-only">Toggle marketing unsubscribe</span>
          </button>
        </CardContent>
      </Card>

      {categoryConfigs.map((category) => {
        const Icon = category.icon;

        return (
          <Card key={category.id} className="bg-background">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2">
                  <Icon className={cn('size-4', category.accentClassName)} />
                  {category.title}
                </CardTitle>
                <SelectAllButton
                  onClick={() =>
                    setAll(
                      category.items.map((item) => item.key),
                      true
                    )
                  }
                />
              </div>
            </CardHeader>
            <CardContent
              className={cn(
                'grid gap-4 pt-4',
                category.items.length > 1 && 'md:grid-cols-2'
              )}
            >
              {category.items.map((item) => (
                <PreferenceCheckbox
                  key={item.key}
                  checked={preferences[item.key]}
                  onChange={(checked) =>
                    updateMarketingPreference(item.key, checked)
                  }
                  label={item.label}
                  description={item.description}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card className="bg-background">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-primary/10 text-primary inline-flex size-6 items-center justify-center rounded-md">
                <Mail className="size-3.5" />
              </span>
              Newsletter
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <PreferenceCheckbox
            checked={preferences.newsletterTmh}
            onChange={(checked) =>
              updateMarketingPreference('newsletterTmh', checked)
            }
            label="The Trademark Helpline Newsletter"
            description="Latest news and insights from our team."
          />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={handleDiscard} disabled={!isDirty}>
          Discard Changes
        </Button>
        <Button onClick={handleSave} disabled={!isDirty}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}
