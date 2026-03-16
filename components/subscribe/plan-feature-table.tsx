import { Check, Minus } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  ['Discounted hourly rate', 'GBP99/hr', 'GBP119/hr', 'GBP149/hr'],
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

export function PlanFeatureTable() {
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
                <th className="px-2 py-3 font-medium">Essentials</th>
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
                  <td className="px-2 py-3">
                    <FeatureCell value={essentials} />
                  </td>
                  <td className="px-2 py-3">
                    <FeatureCell value={annual} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
