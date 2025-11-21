'use client';
import { useSession} from 'next-auth/react';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useEffect } from 'react';
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
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6 max-w-screen-xl">    
        {/* Quick Actions tiles */}
        <HomeTiles />
      </div>
    </div>
  );
}
