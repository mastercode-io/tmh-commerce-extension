'use client';

import type { ComponentType } from 'react';
import { ArrowRight, ShieldPlus, Sparkles, Wallet } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
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
    monthlyPrimary: 'From £49/month',
    monthlySecondary: 'depending on risk profile',
    annualPrimary: 'From £490/year',
    annualSecondary: 'depending on risk profile',
    annualSaving: 'Save £98-£298/year',
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
    monthlyPrimary: '£24/month per trademark',
    monthlySecondary: '+£12/month each additional TM',
    annualPrimary: '£240/year per trademark',
    annualSecondary: '+£120/year each additional TM',
    annualSaving: 'Save £48/year on first trademark',
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
    monthlyPrimary: '£14/month per trademark',
    monthlySecondary: '+£7/month each additional TM',
    annualPrimary: '£140/year per trademark',
    annualSecondary: '+£70/year each additional TM',
    annualSaving: 'Save £28/year per trademark',
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
  monthlyPrimary: string;
  monthlySecondary: string;
  annualPrimary: string;
  annualSecondary: string;
  annualSaving: string;
  minimumTerm: string;
  minimumTermSecondary?: string;
  hourlyRate: string;
  cta: string;
  icon: ComponentType<{ className?: string }>;
}>;

export function PlanCards({
  billingFrequency,
  onSelectPlan,
  busyPlan,
}: {
  billingFrequency: 'monthly' | 'annual';
  onSelectPlan: (plan: MonitoringPlan) => void;
  busyPlan?: MonitoringPlan | null;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const Icon = plan.icon;
        const recommended = plan.plan === 'monitoring_essentials';
        const loading = busyPlan === plan.plan;
        const primary =
          billingFrequency === 'annual'
            ? plan.annualPrimary
            : plan.monthlyPrimary;
        const secondary =
          billingFrequency === 'annual'
            ? plan.annualSecondary
            : plan.monthlySecondary;

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
                <div className="text-[1.55rem] leading-tight font-semibold tracking-tight">
                  {primary}
                </div>
                <div className="text-muted-foreground text-sm font-medium">
                  {secondary}
                </div>
                {billingFrequency === 'annual' ? (
                  <div className="text-primary text-sm font-medium">
                    {plan.annualSaving}
                  </div>
                ) : null}
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
            <div className="mt-auto flex justify-center px-4 pb-4">
              <Button
                className="min-w-[9.75rem]"
                onClick={() => onSelectPlan(plan.plan)}
                disabled={loading}
              >
                {plan.cta}
                <ArrowRight />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
