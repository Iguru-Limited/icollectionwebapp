'use client';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import HomeTiles from '@/components/home/HomeTiles';

export default function UserPage() {
  const template = useCompanyTemplateStore((s) => s.template);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 pb-20 md:pb-6 space-y-6 max-w-screen-xl">
        {/* Quick Actions tiles */}
        <HomeTiles />
        {!template && (
          <p className="text-sm text-gray-500">Company template not loaded yet. Please login again if data does not appear.</p>
        )}
      </div>
    </div>
  );
}
