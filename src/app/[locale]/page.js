import { redirect } from 'next/navigation';

export default function LocalePage({ params }) {
  // Redirect to the home page for the current locale
  redirect(`/${params.locale}/home`);
} 