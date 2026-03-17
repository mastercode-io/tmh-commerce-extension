import { Check, Minus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MonitoringPlan =
  | 'monitoring_defence'
  | 'monitoring_essentials'
  | 'annual_review';

const rows = [
  ['Trademark monitoring', 'check', 'check', 'check'],
  ['Annual review across all trademarks', 'check', 'check', 'check'],
  ['UK & international IPO notifications', 'check', 'check', 'check'],
  ['Trademark reports', 'Monthly', 'Quarterly', 'Annually'],
  ['Search engine reports', 'Monthly', 'Quarterly', 'Annually'],
  ['Domain name alerts & reports', 'Monthly', 'Quarterly', 'Annually'],
  ['Social media alerts & reports', 'Ongoing', 'Quarterly', 'Annually'],
  ['Risk-scored threat reporting', 'Monthly', 'Quarterly', 'Annually'],
  ['Temmy portal access', 'check', 'check', 'check'],
  ['Defence hours', 'Up to 10 hours / 12 months', 'no', 'no'],
  [
    'Proactive takedown & opposition hours',
    'Up to 2 hours / 12 months',
    'no',
    'no',
  ],
  ['Optional IPO address for service', 'check', 'check', 'check'],
  ['Trademark renewal reminders', 'check', 'check', 'check'],
  ['Auto renewal option', 'check', 'no', 'no'],
  ['Minimum term', '6 months', '1 month notice', '1 month notice'],
  ['Discounted hourly rate', '£99/hour', '£119/hour', '£149/hour'],
] as const;

const planActions = [
  { plan: 'monitoring_defence', label: 'Get a Quote' },
  { plan: 'monitoring_essentials', label: 'Select Plan' },
  { plan: 'annual_review', label: 'Select Plan' },
] as const satisfies Array<{ plan: MonitoringPlan; label: string }>;

const planDetails = [
  {
    plan: 'monitoring_defence',
    shortLabel: 'MAD',
    title: 'Monitoring, Advisory & Defence',
    badge: 'Most comprehensive',
    accent: 'border-amber-200 bg-amber-50/70',
  },
  {
    plan: 'monitoring_essentials',
    shortLabel: 'Essentials',
    title: 'Monitoring Essentials',
    badge: 'Recommended',
    accent: 'border-primary/20 bg-primary/5',
  },
  {
    plan: 'annual_review',
    shortLabel: 'Annual Review',
    title: 'Annual Review & Representation',
    badge: 'Most cost effective',
    accent: 'border-slate-200 bg-slate-50/80',
  },
] as const satisfies Array<{
  plan: MonitoringPlan;
  shortLabel: string;
  title: string;
  badge: string;
  accent: string;
}>;

const mobileFeatureSections = [
  {
    title: 'Monitoring',
    features: [
      {
        label: 'Trademark monitoring',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'check',
          annual_review: 'check',
        },
      },
      {
        label: 'Annual review across all trademarks',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'check',
          annual_review: 'check',
        },
      },
      {
        label: 'UK & international IPO notifications',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'check',
          annual_review: 'check',
        },
      },
    ],
  },
  {
    title: 'Reports & Alerts',
    features: [
      {
        label: 'Trademark reports',
        values: {
          monitoring_defence: 'Monthly',
          monitoring_essentials: 'Quarterly',
          annual_review: 'Annually',
        },
      },
      {
        label: 'Search engine reports',
        values: {
          monitoring_defence: 'Monthly',
          monitoring_essentials: 'Quarterly',
          annual_review: 'Annually',
        },
      },
      {
        label: 'Domain name alerts & reports',
        values: {
          monitoring_defence: 'Monthly',
          monitoring_essentials: 'Quarterly',
          annual_review: 'Annually',
        },
      },
      {
        label: 'Social media alerts & reports',
        values: {
          monitoring_defence: 'Ongoing',
          monitoring_essentials: 'Quarterly',
          annual_review: 'Annually',
        },
      },
      {
        label: 'Risk-scored threat reporting',
        values: {
          monitoring_defence: 'Monthly',
          monitoring_essentials: 'Quarterly',
          annual_review: 'Annually',
        },
      },
    ],
  },
  {
    title: 'Portal & Renewal',
    features: [
      {
        label: 'Temmy portal access',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'check',
          annual_review: 'check',
        },
      },
      {
        label: 'Optional IPO address for service',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'check',
          annual_review: 'check',
        },
      },
      {
        label: 'Trademark renewal reminders',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'check',
          annual_review: 'check',
        },
      },
      {
        label: 'Auto renewal option',
        values: {
          monitoring_defence: 'check',
          monitoring_essentials: 'no',
          annual_review: 'no',
        },
      },
    ],
  },
  {
    title: 'Support & Terms',
    features: [
      {
        label: 'Defence hours',
        values: {
          monitoring_defence: 'Up to 10 hours / 12 months',
          monitoring_essentials: 'no',
          annual_review: 'no',
        },
      },
      {
        label: 'Proactive takedown & opposition hours',
        values: {
          monitoring_defence: 'Up to 2 hours / 12 months',
          monitoring_essentials: 'no',
          annual_review: 'no',
        },
      },
      {
        label: 'Minimum term',
        values: {
          monitoring_defence: '6 months',
          monitoring_essentials: '1 month notice',
          annual_review: '1 month notice',
        },
      },
      {
        label: 'Discounted hourly rate',
        values: {
          monitoring_defence: '£99/hour',
          monitoring_essentials: '£119/hour',
          annual_review: '£149/hour',
        },
      },
    ],
  },
] as const;

function FeatureCell({ value }: { value: string }) {
  if (value === 'check') {
    return (
      <span className="inline-flex items-center gap-2 font-medium">
        <Check className="text-primary size-4" />
        Included
      </span>
    );
  }

  if (value === 'no') {
    return (
      <span className="text-muted-foreground inline-flex items-center gap-2">
        <Minus className="size-4" />
        Not included
      </span>
    );
  }

  return <span>{value}</span>;
}

function MobilePlanDetailCard({
  plan,
  onSelectPlan,
  busyPlan,
}: {
  plan: (typeof planDetails)[number];
  onSelectPlan: (plan: MonitoringPlan) => void;
  busyPlan?: MonitoringPlan | null;
}) {
  const action = planActions.find((item) => item.plan === plan.plan);
  const loading = busyPlan === plan.plan;

  return (
    <div className={cn('rounded-2xl border p-4', plan.accent)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-2">
          <div className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
            {plan.shortLabel}
          </div>
          <div>
            <h3 className="text-base font-semibold">{plan.title}</h3>
            <p className="text-muted-foreground mt-1 text-sm">{plan.badge}</p>
          </div>
        </div>
        {action ? (
          <div className="flex w-full justify-center sm:w-auto">
            <Button
              className="min-w-[9.75rem]"
              onClick={() => onSelectPlan(plan.plan)}
              disabled={loading}
            >
              {action.label}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid gap-4">
        {mobileFeatureSections.map((section) => (
          <div key={`${plan.plan}-${section.title}`} className="grid gap-2">
            <div className="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase">
              {section.title}
            </div>
            <div className="grid gap-2">
              {section.features.map((feature) => (
                <div
                  key={`${plan.plan}-${feature.label}`}
                  className="bg-background/85 rounded-xl border px-3 py-3"
                >
                  <div className="text-sm font-medium">{feature.label}</div>
                  <div className="mt-2 text-sm">
                    <FeatureCell value={feature.values[plan.plan]} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {action ? (
        <div className="mt-5 flex justify-center">
          <Button
            className="min-w-[9.75rem]"
            onClick={() => onSelectPlan(plan.plan)}
            disabled={loading}
          >
            {action.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export function PlanFeatureTable({
  onSelectPlan,
  busyPlan,
}: {
  onSelectPlan: (plan: MonitoringPlan) => void;
  busyPlan?: MonitoringPlan | null;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>What each plan covers</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid gap-4 md:hidden">
          {planDetails.map((plan) => (
            <MobilePlanDetailCard
              key={plan.plan}
              plan={plan}
              onSelectPlan={onSelectPlan}
              busyPlan={busyPlan}
            />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="text-muted-foreground border-b text-left text-xs tracking-[0.12em] uppercase">
              <tr>
                <th className="px-2 py-3 font-medium">Feature</th>
                <th className="px-2 py-3 font-medium">MAD</th>
                <th className="bg-primary/5 border-primary/20 border-x px-2 py-3 font-medium">
                  Essentials
                </th>
                <th className="px-2 py-3 font-medium">Annual Review</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, mad, essentials, annual]) => (
                <tr key={label} className="border-b last:border-b-0">
                  <td className="px-2 py-3 font-medium">{label}</td>
                  <td className="px-2 py-3">
                    <FeatureCell value={mad} />
                  </td>
                  <td className="bg-primary/5 border-primary/20 border-x px-2 py-3">
                    <FeatureCell value={essentials} />
                  </td>
                  <td className="px-2 py-3">
                    <FeatureCell value={annual} />
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="pt-6" />
                {planActions.map((action) => {
                  const loading = busyPlan === action.plan;

                  return (
                    <td
                      key={action.plan}
                      className="bg-background px-2 pt-6 text-center"
                    >
                      <div
                        className={cn(
                          'mx-auto flex min-h-[92px] max-w-[180px] flex-col items-center justify-center bg-white px-4 py-4',
                        )}
                      >
                        <Button
                          className="min-w-[9.75rem]"
                          onClick={() => onSelectPlan(action.plan)}
                          disabled={loading}
                        >
                          {action.label}
                        </Button>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
