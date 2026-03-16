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
    price: 'From £49-£149/mo depending on risk profile',
    minimumTerm: '6 month minimum term',
    hourlyRate: '£99/hr discounted support',
    cta: 'Get a Quote',
    icon: ShieldPlus,
  },
  {
    plan: 'monitoring_essentials',
    label: 'Monitoring Essentials',
    fullName: 'Monitoring Essentials',
    badge: 'Recommended',
    price: '£24/mo for 1 trademark, +£12/mo each additional',
    minimumTerm: '1 month notice',
    hourlyRate: '£119/hr discounted support',
    cta: 'Select Plan',
    icon: Sparkles,
  },
  {
    plan: 'annual_review',
    label: 'Annual Review',
    fullName: 'Annual Review & Representation',
    badge: 'Most cost effective',
    price: '£14/mo per trademark, +£7/mo each additional',
    minimumTerm: '1 month notice',
    hourlyRate: '£149/hr discounted support',
    cta: 'Select Plan',
    icon: Wallet,
  },
] satisfies Array<{
  plan: MonitoringPlan;
  label: string;
  fullName: string;
  badge: string;
  price: string;
  minimumTerm: string;
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
              <div className="text-2xl font-semibold tracking-tight">
                {plan.price}
              </div>
              <div className="text-muted-foreground grid gap-2 text-sm">
                <div>{plan.minimumTerm}</div>
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
