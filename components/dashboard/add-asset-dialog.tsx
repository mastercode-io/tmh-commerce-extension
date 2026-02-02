'use client';

import * as React from 'react';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Company, Trademark, TrademarkStatus } from '@/lib/types';
import { cn } from '@/lib/utils';

const jurisdictions = [
  { id: 'GB', name: 'United Kingdom' },
  { id: 'EU', name: 'European Union' },
  { id: 'US', name: 'United States' },
  { id: 'AU', name: 'Australia' },
  { id: 'DE', name: 'Germany' },
] as const;

const trademarkStatusOptions: { value: TrademarkStatus; label: string }[] = [
  { value: 'registered', label: 'Registered' },
  { value: 'pending', label: 'Pending' },
  { value: 'examination', label: 'Examination' },
  { value: 'published', label: 'Published' },
  { value: 'renewal_due', label: 'Renewal due' },
  { value: 'expired', label: 'Expired' },
  { value: 'refused', label: 'Refused' },
];

export function AddAssetDialog({
  open,
  onOpenChange,
  mode,
  onAddTrademark,
  onAddCompany,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'portfolio' | 'watchlist';
  onAddTrademark: (trademark: Trademark) => void;
  onAddCompany?: (company: Company) => void;
}) {
  const [assetType, setAssetType] = React.useState<'trademark' | 'company'>(
    mode === 'watchlist' ? 'trademark' : 'trademark'
  );
  const [jurisdiction, setJurisdiction] = React.useState('GB');
  const [number, setNumber] = React.useState('');
  const [name, setName] = React.useState('');
  const [ownerName, setOwnerName] = React.useState('');
  const [status, setStatus] = React.useState<TrademarkStatus>('pending');

  const canAddCompany = mode === 'portfolio' && Boolean(onAddCompany);

  React.useEffect(() => {
    if (!open) return;
    setAssetType('trademark');
    setJurisdiction('GB');
    setNumber('');
    setName('');
    setOwnerName('');
    setStatus('pending');
  }, [open]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (assetType === 'company') {
      if (!onAddCompany) return;
      const company: Company = {
        id: `co-${crypto.randomUUID()}`,
        companyNumber: number.trim() || '—',
        name: name.trim() || 'New company',
        status: 'Active',
        jurisdiction,
        incorporationDate: new Date().toISOString().slice(0, 10),
      };
      onAddCompany(company);
      onOpenChange(false);
      return;
    }

    const trademark: Trademark = {
      id: `tm-${crypto.randomUUID()}`,
      registrationNumber: number.trim() || '—',
      name: name.trim() || 'New trademark',
      status,
      jurisdiction,
      filingDate: new Date().toISOString().slice(0, 10),
      classes: [],
      ownerName: mode === 'watchlist' ? ownerName.trim() || 'Unknown owner' : 'Sarah Mitchell',
      representative: mode === 'watchlist' ? undefined : 'The Trademark Helpline',
    };
    onAddTrademark(trademark);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'watchlist' ? 'Watch an Asset' : 'Add Asset'}</DialogTitle>
          <DialogDescription>
            {mode === 'watchlist'
              ? 'Add an asset you want to monitor.'
              : 'Add a trademark or company to your portfolio.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="asset-type">Asset type</Label>
            <Select
              value={assetType}
              onValueChange={(value) => setAssetType(value as 'trademark' | 'company')}
              disabled={!canAddCompany}
            >
              <SelectTrigger id="asset-type" className={cn(!canAddCompany && 'w-full')}>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trademark">Trademark</SelectItem>
                <SelectItem value="company" disabled={!canAddCompany}>
                  Company (portfolio only)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="jurisdiction">Jurisdiction</Label>
            <Select value={jurisdiction} onValueChange={setJurisdiction}>
              <SelectTrigger id="jurisdiction" className="w-full">
                <SelectValue placeholder="Select jurisdiction" />
              </SelectTrigger>
              <SelectContent>
                {jurisdictions.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.name} ({j.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="number">
              {assetType === 'company' ? 'Company number' : 'Registration number'}
            </Label>
            <Input
              id="number"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder={assetType === 'company' ? 'e.g. 12345678' : 'e.g. UK00003520024'}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">{assetType === 'company' ? 'Company name' : 'Mark name'}</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={assetType === 'company' ? 'e.g. Mitchell Enterprises Ltd' : 'e.g. BRANDMASTER'}
              required
            />
          </div>

          {assetType === 'trademark' ? (
            <>
              {mode === 'watchlist' ? (
                <div className="grid gap-2">
                  <Label htmlFor="owner">Owner (watchlist)</Label>
                  <Input
                    id="owner"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="e.g. Competitor Inc."
                  />
                </div>
              ) : null}

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value) => setStatus(value as TrademarkStatus)}
                >
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {trademarkStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{mode === 'watchlist' ? 'Add to Watchlist' : 'Add'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
