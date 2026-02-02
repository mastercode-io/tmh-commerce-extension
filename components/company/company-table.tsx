import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Company } from '@/lib/types';

export function CompanyTable({ items }: { items: Company[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Status</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Company Number</TableHead>
          <TableHead className="w-[1%] whitespace-nowrap text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((company) => (
          <TableRow key={company.id}>
            <TableCell>{company.status}</TableCell>
            <TableCell className="font-medium">{company.name}</TableCell>
            <TableCell className="font-mono text-xs">{company.companyNumber}</TableCell>
            <TableCell className="text-right">
              <Button asChild size="sm" variant="outline">
                <Link href={`/asset/${company.id}`}>View</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

