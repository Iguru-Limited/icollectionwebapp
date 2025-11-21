import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/utils/auth';
import { TopNavigation } from '@/components/ui/top-navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

export default async function UserLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <>
      <TopNavigation />
      {children}
      <BottomNavigation />
    </>
  );
}
