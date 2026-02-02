export type TrademarkStatus =
  | 'registered'
  | 'pending'
  | 'examination'
  | 'published'
  | 'renewal_due'
  | 'expired'
  | 'refused';

export interface Trademark {
  id: string;
  registrationNumber: string;
  name: string;
  status: TrademarkStatus;
  jurisdiction: string; // 'GB', 'US', 'EU', etc.
  filingDate: string; // ISO date
  registrationDate?: string;
  renewalDate?: string;
  classes: number[];
  ownerName: string;
  representative?: string;
  imageUrl?: string;
}

export interface Company {
  id: string;
  companyNumber: string;
  name: string;
  status: string;
  jurisdiction: string;
  incorporationDate: string; // ISO date
  registeredAddress?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Organisation {
  id: string;
  name: string;
  type: 'individual' | 'company';
  primaryEmail: string;
  ipoClientIds: string[];
  chCompanyNumbers: string[];
}

export type Asset =
  | { kind: 'trademark'; data: Trademark }
  | { kind: 'company'; data: Company };

