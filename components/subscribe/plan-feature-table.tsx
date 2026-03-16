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
  ['Defence hours', 'Up to 10 hrs / 12 months', 'no', 'no'],
  [
    'Proactive takedown & opposition hours',
    'Up to 2 hrs / 12 months',
    'no',
    'no',
  ],
  ['Optional IPO address for service', 'check', 'check', 'check'],
  ['Trademark renewal reminders', 'check', 'check', 'check'],
  ['Auto renewal option', 'check', 'no', 'no'],
  ['Minimum term', '6 months', '1 month notice', '1 month notice'],
  ['Discounted hourly rate', '£99/hr', '£119/hr', '£149/hr'],
] as const;

const planActions = [
  { plan: 'monitoring_defence', label: 'Get a Quote' },
  { plan: 'monitoring_essentials', label: 'Select Plan' },
  { plan: 'annual_review', label: 'Select Plan' },
] as const satisfies Array<{ plan: MonitoringPlan; label: string }>;

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
        <div className="overflow-x-auto">
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
                  const recommended = action.plan === 'monitoring_essentials';
                  const loading = busyPlan === action.plan;

                  return (
                    <td
                      key={action.plan}
                      className={cn(
                        'px-2 pt-6 text-center',
                        recommended &&
                          'bg-primary/5 border-primary/20 border-x border-b',
                      )}
                    >
                      <div
                        className={cn(
                          'bg-background mx-auto flex min-h-[92px] max-w-[180px] flex-col items-center justify-center rounded-2xl border px-4 py-4',
                          recommended &&
                            'border-primary/40 ring-primary/15 ring-2',
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
