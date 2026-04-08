import { redirect } from 'next/navigation';

export default function RenewPage() {
  redirect('/requests/new?requestType=renewal');
}
