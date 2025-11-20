'use client';
import { useSession} from 'next-auth/react';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useEffect } from 'react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { TopNavigation } from '@/components/ui/top-navigation';
import HomeTiles from '@/components/home/HomeTiles';

export default function UserPage() {
  const { data: session } = useSession();

  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!template && session?.company_template) {
      setTemplate(session.company_template);
    }
  }, [hasHydrated, template, session, setTemplate]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation - hidden on small screens */}
      <div className="hidden md:block">
        <TopNavigation />
      </div>

      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6 max-w-screen-xl">    

        {/* Quick Actions tiles */}
        <HomeTiles />
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
