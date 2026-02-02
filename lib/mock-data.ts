import type { Asset, Company, Trademark, User } from '@/lib/types';

export const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Mitchell',
  email: 'sarah@example.com',
};

export const mockTrademarks: Trademark[] = [
  {
    id: 'tm-1',
    registrationNumber: 'UK00003520024',
    name: 'BRANDMASTER',
    status: 'renewal_due',
    jurisdiction: 'GB',
    filingDate: '2020-03-15',
    registrationDate: '2020-09-22',
    renewalDate: '2030-03-15',
    classes: [9, 35, 42],
    ownerName: 'Sarah Mitchell',
    representative: 'The Trademark Helpline',
  },
  {
    id: 'tm-2',
    registrationNumber: 'UK00003845123',
    name: 'INNOVATE',
    status: 'examination',
    jurisdiction: 'GB',
    filingDate: '2024-01-10',
    classes: [35, 41],
    ownerName: 'Sarah Mitchell',
  },
  {
    id: 'tm-3',
    registrationNumber: 'UK00002987654',
    name: 'LOGOX',
    status: 'registered',
    jurisdiction: 'GB',
    filingDate: '2018-06-01',
    registrationDate: '2018-12-15',
    renewalDate: '2028-06-01',
    classes: [25],
    ownerName: 'Sarah Mitchell',
    imageUrl: '/file.svg',
  },
  {
    id: 'tm-4',
    registrationNumber: 'EU018234567',
    name: 'EUROMARK',
    status: 'registered',
    jurisdiction: 'EU',
    filingDate: '2022-05-20',
    registrationDate: '2022-11-30',
    renewalDate: '2032-05-20',
    classes: [9, 42],
    ownerName: 'Sarah Mitchell',
  },
];

export const mockCompanies: Company[] = [
  {
    id: 'co-1',
    companyNumber: '12345678',
    name: 'Mitchell Enterprises Ltd',
    status: 'Active',
    jurisdiction: 'GB',
    incorporationDate: '2019-01-15',
    registeredAddress: '123 Business Street, London, EC1A 1BB',
  },
  {
    id: 'co-2',
    companyNumber: '87654321',
    name: 'Innovate Holdings Ltd',
    status: 'Active',
    jurisdiction: 'GB',
    incorporationDate: '2023-06-01',
  },
];

export const mockWatchlist: Trademark[] = [
  {
    id: 'tm-wl-1',
    registrationNumber: 'UK00003999888',
    name: 'COMPETITOR BRAND',
    status: 'registered',
    jurisdiction: 'GB',
    filingDate: '2023-02-14',
    registrationDate: '2023-08-20',
    renewalDate: '2033-02-14',
    classes: [35],
    ownerName: 'Competitor Inc.',
  },
];

export function findTrademarkById(id: string): Trademark | undefined {
  return [...mockTrademarks, ...mockWatchlist].find((t) => t.id === id);
}

export function findCompanyById(id: string): Company | undefined {
  return mockCompanies.find((c) => c.id === id);
}

export function findAssetById(id: string): Asset | null {
  const trademark = findTrademarkById(id);
  if (trademark) return { kind: 'trademark', data: trademark };

  const company = findCompanyById(id);
  if (company) return { kind: 'company', data: company };

  return null;
}
