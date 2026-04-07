import { redirect } from 'next/navigation';

export default function WelcomePage() {
  redirect('/account');
}
