'use client';

import type { ComponentType } from 'react';
import { ArrowRight, ShieldPlus, Sparkles, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

type MonitoringPlan =
  | 'monitoring_defence'
  | 'monitoring_essentials'
  | 'annual_review';

const plans = [
  {
    plan: 'monitoring_defence',
    label: 'MAD',
    fullName: 'Monitoring, Advisory & Defence',
    badge: 'Most comprehensive',
    pricePrimary: 'From £49/month',
    priceSecondary: 'depending on risk profile',
    minimumTerm: '6 month minimum term',
    hourlyRate: '£99/hour discounted support',
    cta: 'Get a Quote',
    icon: ShieldPlus,
  },
  {
    plan: 'monitoring_essentials',
    label: 'Monitoring Essentials',
    fullName: 'Monitoring Essentials',
    badge: 'Recommended',
    pricePrimary: '£24/month for 1 trademark,',
    priceSecondary: '+£12/month each additional TM',
    minimumTerm: 'Cancel any time',
    minimumTermSecondary: '(one month notice period)',
    hourlyRate: '£119/hour discounted support',
    cta: 'Select Plan',
    icon: Sparkles,
  },
  {
    plan: 'annual_review',
    label: 'Annual Review',
    fullName: 'Annual Review & Representation',
    badge: 'Most cost effective',
    pricePrimary: '£14/month per trademark,',
    priceSecondary: '+£7/month each additional TM',
    minimumTerm: 'Cancel any time',
    minimumTermSecondary: '(one month notice period)',
    hourlyRate: '£149/hour discounted support',
    cta: 'Select Plan',
    icon: Wallet,
  },
] satisfies Array<{
  plan: MonitoringPlan;
  label: string;
  fullName: string;
  badge: string;
  pricePrimary: string;
  priceSecondary: string;
  minimumTerm: string;
  minimumTermSecondary?: string;
  hourlyRate: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
}>;

export function PlanCards({
  onSelectPlan,
  busyPlan,
}: {
  onSelectPlan: (plan: MonitoringPlan) => void;
  busyPlan?: MonitoringPlan | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const Icon = plan.icon;
        const recommended = plan.plan === 'monitoring_essentials';
        const loading = busyPlan === plan.plan;

        return (
          <Card
            key={plan.plan}
            className={cn(
              'bg-background h-full',
              recommended && 'ring-primary/20 border-primary/20 ring-2',
            )}
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-2">
                  <Badge variant={recommended ? 'default' : 'secondary'}>
                    {plan.badge}
                  </Badge>
                  <CardTitle className="text-xl">{plan.label}</CardTitle>
                  <CardDescription>{plan.fullName}</CardDescription>
                </div>
                <div
                  className={cn(
                    'grid size-11 place-items-center rounded-xl border',
                    recommended
                      ? 'bg-primary/10 text-primary border-primary/20'
                      : 'bg-muted text-foreground',
                  )}
                >
                  <Icon className="size-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              <div className="grid gap-1">
                <div className="text-[2rem] leading-tight font-semibold tracking-tight">
                  {plan.pricePrimary}
                </div>
                <div className="text-muted-foreground text-base font-medium">
                  {plan.priceSecondary}
                </div>
              </div>
              <div className="text-muted-foreground grid gap-2 text-sm">
                <div>{plan.minimumTerm}</div>
                {plan.minimumTermSecondary ? (
                  <div className="-mt-1 text-xs">
                    {plan.minimumTermSecondary}
                  </div>
                ) : null}
                <div>{plan.hourlyRate}</div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto justify-center bg-transparent p-4 pt-0">
              <Button
                className="min-w-[9.75rem]"
                onClick={() => onSelectPlan(plan.plan)}
                disabled={loading}
              >
                {plan.cta}
                <ArrowRight />
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
