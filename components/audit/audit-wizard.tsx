'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Search,
} from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { LoadingSkeleton } from '@/components/common/loading-skeleton';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type {
  AuditLeadResponse,
  AuditOrderResponse,
  AuditSections,
  TemmyResultItem,
  TemmySearchResponse,
  UpdateAuditSectionResponse,
} from '@/features/audit/lib/types';
import { AuditApiResponseError, requestAuditJson } from '@/lib/audit/client';
import {
  clearAuditWizardState,
  readAuditWizardState,
  saveAuditWizardState,
  type AuditWizardStorageState,
} from '@/lib/audit/demo-storage';
import { cn } from '@/lib/utils';

type AuditLeadApiResponse = AuditLeadResponse & {
  correlationId: string;
};

type AuditSectionApiResponse = UpdateAuditSectionResponse & {
  correlationId: string;
};

type AuditOrderApiResponse = AuditOrderResponse & {
  correlationId: string;
};

type TemmySearchApiResponse = TemmySearchResponse & {
  correlationId: string;
};

const CONTACT_METHODS = ['Phone', 'SMS', 'WhatsApp', 'Email', 'Video Call'];
const TRADEMARK_TYPES = ['Word Mark', 'Logo', 'Word + Device'];
const JURISDICTIONS = ['United Kingdom', 'European Union', 'International'];
const STEPS = [
  { key: 'contact', label: 'Contact' },
  { key: 'preferences', label: 'Preferences' },
  { key: 'trademark', label: 'Trademark' },
  { key: 'goods', label: 'Goods / Services' },
  { key: 'billing', label: 'Billing' },
  { key: 'appointment', label: 'Appointment' },
] as const;

function createDefaultSections(): AuditSections {
  return {
    contact: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    preferences: {
      methods: [],
    },
    tmStatus: {
      status: 'existing',
      tmAppNumber: '',
      tmName: '',
    },
    temmy: {
      selected: null,
      results: {
        items: [],
      },
    },
    tmInfo: {
      types: ['Word Mark'],
      name: '',
      jurisdictions: ['United Kingdom'],
      otherJurisdiction: '',
      imageUploadChoice: 'later',
      imageFile: null,
    },
    goods: {
      description: '',
      website: '',
    },
    billing: {
      type: 'Organisation',
      companyName: '',
      firstName: '',
      lastName: '',
      address: {
        line1: '',
        line2: '',
        city: '',
        county: '',
        postcode: '',
        country: 'United Kingdom',
      },
      invoiceEmail: '',
      invoicePhone: '',
    },
    appointment: {
      scheduled: false,
      skipped: true,
      slotId: null,
    },
    paymentOptions: {
      termsAccepted: false,
    },
  };
}

function createDefaultWizardState(initialToken: string | null): AuditWizardStorageState {
  return {
    token: initialToken,
    orderId: null,
    currentStep: 0,
    completedAt: null,
    sections: createDefaultSections(),
    lastTemmySearch: null,
    latestOrder: null,
  };
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function normaliseWebsite(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function isValidHttpUrl(value: string) {
  if (!value.trim()) {
    return true;
  }

  try {
    const parsed = new URL(normaliseWebsite(value));
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function getCurrentStepLabel(step: number) {
  return STEPS[step]?.label ?? 'Audit';
}

function TemmyResultCard({
  item,
  selected,
  onSelect,
}: {
  item: TemmyResultItem;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5'
          : 'hover:bg-muted/40 border-border bg-background',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-semibold">{item.verbal_element_text}</div>
          <div className="text-muted-foreground text-xs">
            {item.application_number} · {item.status}
          </div>
        </div>
        {selected ? <Badge>Selected</Badge> : null}
      </div>
      <div className="text-muted-foreground mt-3 text-sm">
        Applicant: {item.applicants[0]?.name ?? 'Unknown'}
      </div>
      <div className="text-muted-foreground mt-1 text-sm">
        Expiry: {formatDate(item.expiry_date)}
      </div>
    </button>
  );
}

export function AuditWizard({
  initialToken,
  showDemoHelpers,
}: {
  initialToken: string | null;
  showDemoHelpers: boolean;
}) {
  const [wizardState, setWizardState] = React.useState<AuditWizardStorageState>(() =>
    createDefaultWizardState(initialToken),
  );
  const [hydrated, setHydrated] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isSearchingTemmy, setIsSearchingTemmy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    const stored = readAuditWizardState();

    if (stored) {
      setWizardState(stored);
    } else if (initialToken) {
      setWizardState((current) => ({ ...current, token: initialToken }));
    }

    setHydrated(true);
  }, [initialToken]);

  React.useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveAuditWizardState(wizardState);
  }, [hydrated, wizardState]);

  React.useEffect(() => {
    if (!hydrated || !wizardState.orderId) {
      return;
    }

    let cancelled = false;

    async function refreshOrder() {
      try {
        const order = await requestAuditJson<AuditOrderApiResponse>(
          `/api/audit/orders/${wizardState.orderId}`,
        );

        if (!cancelled) {
          setWizardState((current) => ({
            ...current,
            latestOrder: order,
          }));
        }
      } catch {
        // Preview deployments can lose mock in-memory state; keep browser snapshot.
      }
    }

    void refreshOrder();

    return () => {
      cancelled = true;
    };
  }, [hydrated, wizardState.orderId]);

  function updateSection<K extends keyof AuditSections>(
    key: K,
    value: NonNullable<AuditSections[K]>,
  ) {
    setWizardState((current) => ({
      ...current,
      sections: {
        ...current.sections,
        [key]: value,
      },
    }));
  }

  function setCurrentStep(step: number) {
    setError(null);
    setNotice(null);
    setWizardState((current) => ({
      ...current,
      currentStep: Math.max(0, Math.min(step, STEPS.length)),
    }));
  }

  async function refreshLatestOrder(orderId: string) {
    try {
      const order = await requestAuditJson<AuditOrderApiResponse>(
        `/api/audit/orders/${orderId}`,
      );
      setWizardState((current) => ({
        ...current,
        latestOrder: order,
      }));
    } catch {
      // Keep the browser snapshot when preview/API mock storage is unavailable.
    }
  }

  async function persistSection<
    K extends
      | 'contact'
      | 'preferences'
      | 'tmStatus'
      | 'temmy'
      | 'tmInfo'
      | 'goods'
      | 'billing'
      | 'appointment',
  >(
    section: K,
    data: NonNullable<AuditSections[K]>,
    overrides?: {
      token?: string | null;
      orderId?: string | null;
    },
  ) {
    const response = await requestAuditJson<AuditSectionApiResponse>(
      '/api/audit/orders/sections',
      {
        method: 'POST',
        body: JSON.stringify({
          orderId: overrides?.orderId ?? wizardState.orderId ?? undefined,
          token: overrides?.token ?? wizardState.token ?? undefined,
          section,
          data,
        }),
      },
    );

    setWizardState((current) => ({
      ...current,
      orderId: response.orderId,
    }));

    await refreshLatestOrder(response.orderId);

    return response;
  }

  async function handleContinue() {
    const contact = wizardState.sections.contact ?? createDefaultSections().contact!;
    const preferences =
      wizardState.sections.preferences ?? createDefaultSections().preferences!;
    const tmStatus = wizardState.sections.tmStatus ?? createDefaultSections().tmStatus!;
    const temmy = wizardState.sections.temmy ?? createDefaultSections().temmy!;
    const tmInfo = wizardState.sections.tmInfo ?? createDefaultSections().tmInfo!;
    const goods = wizardState.sections.goods ?? createDefaultSections().goods!;
    const billing = wizardState.sections.billing ?? createDefaultSections().billing!;
    const appointment =
      wizardState.sections.appointment ?? createDefaultSections().appointment!;

    setIsSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (wizardState.currentStep === 0) {
        const lead = await requestAuditJson<AuditLeadApiResponse>('/api/audit/lead', {
          method: 'POST',
          body: JSON.stringify({
            token: wizardState.token ?? undefined,
            lead: contact,
          }),
        });

        setWizardState((current) => ({
          ...current,
          token: lead.token,
        }));

        await persistSection('contact', contact, { token: lead.token });
        setNotice('Contact details saved.');
      } else if (wizardState.currentStep === 1) {
        await persistSection('preferences', preferences);
        setNotice('Contact preferences saved.');
      } else if (wizardState.currentStep === 2) {
        if (tmStatus.status === 'existing') {
          if (!tmStatus.tmAppNumber?.trim() && !tmStatus.tmName?.trim()) {
            throw new Error(
              'Add an application number or trademark name before continuing.',
            );
          }

          const resultCount = temmy.results?.items.length ?? 0;

          if (resultCount > 1 && !temmy.selected) {
            throw new Error(
              'Choose one Temmy result before continuing with an existing trademark.',
            );
          }

          await persistSection('tmStatus', {
            ...tmStatus,
            tmAppNumber: tmStatus.tmAppNumber?.trim(),
            tmName: tmStatus.tmName?.trim(),
          });

          if (resultCount > 0 || temmy.selected) {
            await persistSection('temmy', temmy);
          }
        } else {
          if (!tmInfo.name?.trim()) {
            throw new Error('Enter the trademark name before continuing.');
          }

          await persistSection('tmStatus', {
            status: 'new',
            tmName: tmInfo.name.trim(),
          });
          await persistSection('tmInfo', {
            ...tmInfo,
            name: tmInfo.name.trim(),
            otherJurisdiction: tmInfo.otherJurisdiction?.trim() ?? '',
          });
        }

        setNotice('Trademark details saved.');
      } else if (wizardState.currentStep === 3) {
        if (!goods.description?.trim()) {
          throw new Error('Add a short business or goods/services description.');
        }

        if (goods.website && !isValidHttpUrl(goods.website)) {
          throw new Error('Enter a valid website URL or leave it blank.');
        }

        await persistSection('goods', {
          ...goods,
          description: goods.description.trim(),
          website: normaliseWebsite(goods.website ?? ''),
        });
        setNotice('Goods and services details saved.');
      } else if (wizardState.currentStep === 4) {
        if (billing.type === 'Organisation' && !billing.companyName?.trim()) {
          throw new Error('Enter the company name for organisation billing.');
        }

        if (
          billing.type === 'Individual' &&
          (!billing.firstName?.trim() || !billing.lastName?.trim())
        ) {
          throw new Error('Enter the billing first name and last name.');
        }

        await persistSection('billing', {
          ...billing,
          companyName: billing.companyName?.trim() ?? '',
          firstName: billing.firstName?.trim() ?? '',
          lastName: billing.lastName?.trim() ?? '',
          invoiceEmail: billing.invoiceEmail?.trim() ?? '',
          invoicePhone: billing.invoicePhone?.trim() ?? '',
          address: {
            ...billing.address,
            line1: billing.address.line1.trim(),
            line2: billing.address.line2?.trim() ?? '',
            city: billing.address.city.trim(),
            county: billing.address.county?.trim() ?? '',
            postcode: billing.address.postcode.trim(),
            country: billing.address.country.trim(),
          },
        });
        setNotice('Billing details saved.');
      } else if (wizardState.currentStep === 5) {
        await persistSection('appointment', appointment);
        setNotice('Appointment preference saved.');
        setWizardState((current) => ({
          ...current,
          currentStep: STEPS.length,
          completedAt: new Date().toISOString(),
        }));
        return;
      }

      setWizardState((current) => ({
        ...current,
        currentStep: Math.min(current.currentStep + 1, STEPS.length),
      }));
    } catch (requestError) {
      setError(
        requestError instanceof AuditApiResponseError || requestError instanceof Error
          ? requestError.message
          : 'We could not save this audit step right now.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTemmySearch() {
    const tmStatus = wizardState.sections.tmStatus ?? createDefaultSections().tmStatus!;
    const applicationNumber = tmStatus.tmAppNumber?.trim() ?? '';
    const text = tmStatus.tmName?.trim() ?? '';

    if (!applicationNumber && !text) {
      setError('Enter an application number or trademark name before searching.');
      return;
    }

    setIsSearchingTemmy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await requestAuditJson<TemmySearchApiResponse>(
        '/api/temmy/search',
        {
          method: 'POST',
          body: JSON.stringify(
            applicationNumber
              ? { application_number: applicationNumber }
              : { text },
          ),
        },
      );

      const selected =
        response.data.items.length === 1
          ? response.data.items[0].application_number
          : null;

      updateSection('temmy', {
        selected,
        results: {
          items: response.data.items,
        },
      });

      setWizardState((current) => ({
        ...current,
        lastTemmySearch: {
          mode: applicationNumber ? 'application_number' : 'text',
          value: applicationNumber || text,
          response,
        },
      }));

      setNotice(
        response.data.items.length === 0
          ? 'No Temmy matches found. You can continue with a manual trademark reference.'
          : response.data.items.length === 1
            ? 'One Temmy match found and selected automatically.'
            : 'Multiple Temmy matches found. Choose the correct trademark before continuing.',
      );
    } catch (requestError) {
      setError(
        requestError instanceof AuditApiResponseError
          ? requestError.message
          : 'We could not search Temmy right now.',
      );
    } finally {
      setIsSearchingTemmy(false);
    }
  }

  function handleReset() {
    clearAuditWizardState();
    setWizardState(createDefaultWizardState(initialToken));
    setError(null);
    setNotice('Audit draft cleared for this browser.');
  }

  if (!hydrated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading audit</CardTitle>
          <CardDescription>
            We&apos;re restoring any saved audit progress for this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton lines={6} />
        </CardContent>
      </Card>
    );
  }

  const contact = wizardState.sections.contact ?? createDefaultSections().contact!;
  const preferences =
    wizardState.sections.preferences ?? createDefaultSections().preferences!;
  const tmStatus = wizardState.sections.tmStatus ?? createDefaultSections().tmStatus!;
  const temmy = wizardState.sections.temmy ?? createDefaultSections().temmy!;
  const tmInfo = wizardState.sections.tmInfo ?? createDefaultSections().tmInfo!;
  const goods = wizardState.sections.goods ?? createDefaultSections().goods!;
  const billing = wizardState.sections.billing ?? createDefaultSections().billing!;
  const appointment =
    wizardState.sections.appointment ?? createDefaultSections().appointment!;

  const isComplete = wizardState.currentStep >= STEPS.length;

  let content: React.ReactNode = null;

  if (isComplete) {
    content = (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="text-primary size-5" />
            <CardTitle>Audit wizard shell complete</CardTitle>
          </div>
          <CardDescription>
            The audit draft, lead token, and order state are now saved. Summary and
            payment routes land in the next audit slice.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border p-4">
              <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                Order ID
              </div>
              <div className="mt-2 text-sm font-semibold">
                {wizardState.orderId ?? 'Not created'}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
                Completed
              </div>
              <div className="mt-2 text-sm font-semibold">
                {formatDate(wizardState.completedAt)}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-dashed p-4 text-sm">
            Current slice delivered: lead upsert, section persistence, Temmy search,
            order read, and the browser-resumable wizard shell on <code>/audit</code>.
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setCurrentStep(STEPS.length - 1)}>
            Review appointment step
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Start a fresh audit
          </Button>
        </CardFooter>
      </Card>
    );
  } else if (wizardState.currentStep === 0) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Start the audit</CardTitle>
          <CardDescription>
            Capture the lead details first so the journey has a continuation token.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="audit-first-name">First name</Label>
            <Input
              id="audit-first-name"
              value={contact.firstName}
              onChange={(event) =>
                updateSection('contact', {
                  ...contact,
                  firstName: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-last-name">Last name</Label>
            <Input
              id="audit-last-name"
              value={contact.lastName}
              onChange={(event) =>
                updateSection('contact', {
                  ...contact,
                  lastName: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-email">Email</Label>
            <Input
              id="audit-email"
              type="email"
              value={contact.email}
              onChange={(event) =>
                updateSection('contact', {
                  ...contact,
                  email: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audit-phone">Phone</Label>
            <Input
              id="audit-phone"
              value={contact.phone}
              onChange={(event) =>
                updateSection('contact', {
                  ...contact,
                  phone: event.target.value,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  } else if (wizardState.currentStep === 1) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Contact preferences</CardTitle>
          <CardDescription>
            Choose at least one way the customer wants the audit team to respond.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {CONTACT_METHODS.map((method) => {
            const selected = preferences.methods?.includes(method) ?? false;

            return (
              <label
                key={method}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                  selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={selected}
                  onChange={(event) => {
                    const nextMethods = event.target.checked
                      ? [...(preferences.methods ?? []), method]
                      : (preferences.methods ?? []).filter((item) => item !== method);

                    updateSection('preferences', {
                      methods: nextMethods,
                    });
                  }}
                />
                <div>
                  <div className="text-sm font-semibold">{method}</div>
                  <div className="text-muted-foreground text-sm">
                    Save this as an allowed follow-up channel for the audit team.
                  </div>
                </div>
              </label>
            );
          })}
        </CardContent>
      </Card>
    );
  } else if (wizardState.currentStep === 2) {
    const temmyItems = temmy.results?.items ?? [];

    content = (
      <Card>
        <CardHeader>
          <CardTitle>Trademark status</CardTitle>
          <CardDescription>
            Use the existing path for a filed or registered mark, or capture a new mark
            directly in the audit draft.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              { value: 'existing', label: 'Existing trademark' },
              { value: 'new', label: 'New trademark' },
            ].map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                  tmStatus.status === option.value
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-muted/40',
                )}
              >
                <input
                  type="radio"
                  name="tm-status"
                  className="mt-1"
                  checked={tmStatus.status === option.value}
                  onChange={() =>
                    updateSection('tmStatus', {
                      ...tmStatus,
                      status: option.value,
                    })
                  }
                />
                <div className="space-y-1">
                  <div className="text-sm font-semibold">{option.label}</div>
                  <div className="text-muted-foreground text-sm">
                    {option.value === 'existing'
                      ? 'Use Temmy lookup when the customer already has a filing or registration.'
                      : 'Capture the proposed mark, jurisdictions, and mark type directly.'}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {tmStatus.status === 'existing' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div className="space-y-2">
                  <Label htmlFor="tm-app-number">Application number</Label>
                  <Input
                    id="tm-app-number"
                    value={tmStatus.tmAppNumber ?? ''}
                    onChange={(event) =>
                      updateSection('tmStatus', {
                        ...tmStatus,
                        tmAppNumber: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tm-name-existing">Trademark name</Label>
                  <Input
                    id="tm-name-existing"
                    value={tmStatus.tmName ?? ''}
                    onChange={(event) =>
                      updateSection('tmStatus', {
                        ...tmStatus,
                        tmName: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTemmySearch}
                    disabled={isSearchingTemmy}
                    className="w-full md:w-auto"
                  >
                    {isSearchingTemmy ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Search className="size-4" />
                    )}
                    Search Temmy
                  </Button>
                </div>
              </div>

              {temmyItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">Temmy matches</div>
                      <div className="text-muted-foreground text-sm">
                        {temmyItems.length === 1
                          ? 'One result found.'
                          : `${temmyItems.length} results found. Select one before continuing.`}
                      </div>
                    </div>
                    {wizardState.lastTemmySearch ? (
                      <Badge variant="outline">
                        {wizardState.lastTemmySearch.mode === 'application_number'
                          ? 'Application number'
                          : 'Text search'}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="space-y-3">
                    {temmyItems.map((item) => (
                      <TemmyResultCard
                        key={item.application_number}
                        item={item}
                        selected={temmy.selected === item.application_number}
                        onSelect={() =>
                          updateSection('temmy', {
                            selected: item.application_number,
                            results: {
                              items: temmyItems,
                            },
                          })
                        }
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tm-type">Trademark type</Label>
                  <Select
                    value={tmInfo.types?.[0] ?? 'Word Mark'}
                    onValueChange={(value) =>
                      updateSection('tmInfo', {
                        ...tmInfo,
                        types: [value],
                      })
                    }
                  >
                    <SelectTrigger id="tm-type" className="h-10 w-full">
                      <SelectValue placeholder="Select trademark type" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRADEMARK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tm-name-new">Trademark name</Label>
                  <Input
                    id="tm-name-new"
                    value={tmInfo.name ?? ''}
                    onChange={(event) =>
                      updateSection('tmInfo', {
                        ...tmInfo,
                        name: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold">Jurisdictions</div>
                <div className="grid gap-3 md:grid-cols-3">
                  {JURISDICTIONS.map((jurisdiction) => {
                    const selected =
                      tmInfo.jurisdictions?.includes(jurisdiction) ?? false;

                    return (
                      <label
                        key={jurisdiction}
                        className={cn(
                          'flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors',
                          selected
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/40',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(event) => {
                            const current = tmInfo.jurisdictions ?? [];
                            const next = event.target.checked
                              ? [...current, jurisdiction]
                              : current.filter((item) => item !== jurisdiction);

                            updateSection('tmInfo', {
                              ...tmInfo,
                              jurisdictions: next,
                            });
                          }}
                        />
                        <span className="text-sm font-medium">{jurisdiction}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tm-other-jurisdiction">Other jurisdiction</Label>
                  <Input
                    id="tm-other-jurisdiction"
                    value={tmInfo.otherJurisdiction ?? ''}
                    onChange={(event) =>
                      updateSection('tmInfo', {
                        ...tmInfo,
                        otherJurisdiction: event.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-upload-choice">Image file available?</Label>
                  <Select
                    value={tmInfo.imageUploadChoice ?? 'later'}
                    onValueChange={(value) =>
                      updateSection('tmInfo', {
                        ...tmInfo,
                        imageUploadChoice: value,
                      })
                    }
                  >
                    <SelectTrigger id="image-upload-choice" className="h-10 w-full">
                      <SelectValue placeholder="Select image option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, available now</SelectItem>
                      <SelectItem value="later">Share later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  } else if (wizardState.currentStep === 3) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Goods and services</CardTitle>
          <CardDescription>
            Give the audit team enough context to review the current or intended use of
            the mark.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goods-description">Business or goods/services description</Label>
            <Textarea
              id="goods-description"
              value={goods.description ?? ''}
              onChange={(event) =>
                updateSection('goods', {
                  ...goods,
                  description: event.target.value,
                })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="goods-website">Website</Label>
            <Input
              id="goods-website"
              placeholder="https://example.com"
              value={goods.website ?? ''}
              onChange={(event) =>
                updateSection('goods', {
                  ...goods,
                  website: event.target.value,
                })
              }
            />
          </div>
        </CardContent>
      </Card>
    );
  } else if (wizardState.currentStep === 4) {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Billing details</CardTitle>
          <CardDescription>
            Capture the invoice contact and billing address now so the later summary can
            stay server-authoritative.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="billing-type">Billing type</Label>
            <Select
              value={billing.type}
              onValueChange={(value) =>
                updateSection('billing', {
                  ...billing,
                  type: value,
                })
              }
            >
              <SelectTrigger id="billing-type" className="h-10 w-full">
                <SelectValue placeholder="Select billing type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Organisation">Organisation</SelectItem>
                <SelectItem value="Individual">Individual</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {billing.type === 'Organisation' ? (
            <div className="space-y-2">
              <Label htmlFor="billing-company">Company name</Label>
              <Input
                id="billing-company"
                value={billing.companyName ?? ''}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    companyName: event.target.value,
                  })
                }
              />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billing-first-name">First name</Label>
                <Input
                  id="billing-first-name"
                  value={billing.firstName ?? ''}
                  onChange={(event) =>
                    updateSection('billing', {
                      ...billing,
                      firstName: event.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-last-name">Last name</Label>
                <Input
                  id="billing-last-name"
                  value={billing.lastName ?? ''}
                  onChange={(event) =>
                    updateSection('billing', {
                      ...billing,
                      lastName: event.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing-line1">Address line 1</Label>
              <Input
                id="billing-line1"
                value={billing.address.line1}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    address: {
                      ...billing.address,
                      line1: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-line2">Address line 2</Label>
              <Input
                id="billing-line2"
                value={billing.address.line2 ?? ''}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    address: {
                      ...billing.address,
                      line2: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-city">City</Label>
              <Input
                id="billing-city"
                value={billing.address.city}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    address: {
                      ...billing.address,
                      city: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-county">County</Label>
              <Input
                id="billing-county"
                value={billing.address.county ?? ''}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    address: {
                      ...billing.address,
                      county: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-postcode">Postcode</Label>
              <Input
                id="billing-postcode"
                value={billing.address.postcode}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    address: {
                      ...billing.address,
                      postcode: event.target.value,
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing-country">Country</Label>
              <Input
                id="billing-country"
                value={billing.address.country}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    address: {
                      ...billing.address,
                      country: event.target.value,
                    },
                  })
                }
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoice-email">Invoice email</Label>
              <Input
                id="invoice-email"
                type="email"
                value={billing.invoiceEmail ?? ''}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    invoiceEmail: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invoice-phone">Invoice phone</Label>
              <Input
                id="invoice-phone"
                value={billing.invoicePhone ?? ''}
                onChange={(event) =>
                  updateSection('billing', {
                    ...billing,
                    invoicePhone: event.target.value,
                  })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <Card>
        <CardHeader>
          <CardTitle>Appointment preference</CardTitle>
          <CardDescription>
            Keep the assisted path available. This step stays in scope as the customer
            escape route when extra help is needed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                key: 'schedule',
                label: 'Schedule a call',
                description: 'Keep the assisted path open and capture a preferred slot.',
              },
              {
                key: 'skip',
                label: 'Skip for now',
                description: 'Continue without booking and leave the route available later.',
              },
            ].map((option) => {
              const selected =
                option.key === 'schedule'
                  ? appointment.scheduled
                  : appointment.skipped;

              return (
                <label
                  key={option.key}
                  className={cn(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors',
                    selected ? 'border-primary bg-primary/5' : 'hover:bg-muted/40',
                  )}
                >
                  <input
                    type="radio"
                    name="appointment-choice"
                    className="mt-1"
                    checked={selected}
                    onChange={() =>
                      updateSection('appointment', {
                        scheduled: option.key === 'schedule',
                        skipped: option.key === 'skip',
                        slotId:
                          option.key === 'schedule'
                            ? appointment.slotId ?? ''
                            : null,
                      })
                    }
                  />
                  <div>
                    <div className="text-sm font-semibold">{option.label}</div>
                    <div className="text-muted-foreground text-sm">
                      {option.description}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {appointment.scheduled ? (
            <div className="space-y-2">
              <Label htmlFor="appointment-slot">Preferred slot or notes</Label>
              <Input
                id="appointment-slot"
                placeholder="e.g. Weekday mornings, Tuesday after 14:00"
                value={appointment.slotId ?? ''}
                onChange={(event) =>
                  updateSection('appointment', {
                    ...appointment,
                    slotId: event.target.value,
                  })
                }
              />
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  }

  const progressCount = Math.min(wizardState.currentStep, STEPS.length);
  const latestOrder = wizardState.latestOrder;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-start">
      <div className="space-y-6">
        {showDemoHelpers ? (
          <div className="rounded-xl border border-dashed px-4 py-3 text-sm">
            Mock audit mode is enabled in this environment. This wizard saves its draft in
            the current browser session for preview reliability.
          </div>
        ) : null}

        {error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-950">
            {error}
          </div>
        ) : null}

        {notice ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            {notice}
          </div>
        ) : null}

        {content}

        {!isComplete ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(wizardState.currentStep - 1)}
                disabled={wizardState.currentStep === 0 || isSaving}
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isSaving}>
                Reset draft
              </Button>
            </div>
            <Button onClick={handleContinue} disabled={isSaving}>
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              Continue
              <ArrowRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader>
            <CardTitle>Progress</CardTitle>
            <CardDescription>
              {isComplete
                ? 'Wizard shell complete for the saved audit draft.'
                : `Step ${wizardState.currentStep + 1} of ${STEPS.length}: ${getCurrentStepLabel(
                    wizardState.currentStep,
                  )}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {STEPS.map((step, index) => {
              const isCurrent = !isComplete && index === wizardState.currentStep;
              const isDone = index < progressCount || isComplete;

              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => {
                    if (index <= progressCount) {
                      setCurrentStep(index);
                    }
                  }}
                  disabled={index > progressCount}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm transition-colors',
                    isCurrent
                      ? 'border-primary bg-primary/5'
                      : isDone
                        ? 'hover:bg-muted/40'
                        : 'text-muted-foreground cursor-not-allowed opacity-60',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-full text-xs font-semibold',
                      isDone
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isDone ? <CheckCircle2 className="size-4" /> : index + 1}
                  </span>
                  <span>{step.label}</span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Journey state</CardTitle>
            <CardDescription>Local wizard state and server identifiers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Token</span>
              <span className="font-medium">{wizardState.token ?? 'Not issued yet'}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-medium">
                {wizardState.orderId ?? 'Created after contact save'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Preferred methods</span>
              <span className="max-w-[180px] text-right font-medium">
                {preferences.methods?.length ? preferences.methods.join(', ') : 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Trademark mode</span>
              <span className="font-medium">
                {tmStatus.status === 'new' ? 'New trademark' : 'Existing trademark'}
              </span>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={async () => {
                if (!wizardState.orderId) {
                  return;
                }

                setIsRefreshing(true);
                setError(null);

                try {
                  await refreshLatestOrder(wizardState.orderId);
                  setNotice('Order snapshot refreshed from the server.');
                } catch (requestError) {
                  setError(
                    requestError instanceof Error
                      ? requestError.message
                      : 'We could not refresh the audit order right now.',
                  );
                } finally {
                  setIsRefreshing(false);
                }
              }}
              disabled={!wizardState.orderId || isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCcw className="size-4" />
              )}
              Refresh order
            </Button>
          </CardFooter>
        </Card>

        {latestOrder ? (
          <Card>
            <CardHeader>
              <CardTitle>Server pricing</CardTitle>
              <CardDescription>
                This stays server-authoritative for the later summary and payment slices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="outline">{latestOrder.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">
                  {formatMoney(latestOrder.pricing.subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">VAT</span>
                <span className="font-medium">{formatMoney(latestOrder.pricing.vat)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-semibold">
                  {formatMoney(latestOrder.pricing.total)}
                </span>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {isComplete ? (
          <EmptyState
            title="Next audit slice"
            description="Summary, payment, and confirmation routes still need A12-A13. The underlying audit order state is now ready for that work."
            action={
              <Button variant="outline" asChild>
                <Link href="/renewal">Review the renewal reference flow</Link>
              </Button>
            }
          />
        ) : null}
      </div>
    </div>
  );
}
