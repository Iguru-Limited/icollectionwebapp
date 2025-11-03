'use client';
import { useSession, signOut } from 'next-auth/react';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, LogOut } from 'lucide-react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { TopNavigation } from '@/components/ui/top-navigation';
import { VehicleTable } from '@/components/vehicles/VehicleTable';

export default function UserPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');

  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!template && session?.company_template) {
      setTemplate(session.company_template);
    }
  }, [hasHydrated, template, session, setTemplate]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const filteredVehicles = (template?.vehicles ?? []).filter((vehicle) =>
    searchQuery ? vehicle.number_plate.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation - hidden on small screens */}
      <div className="hidden md:block">
        <TopNavigation />
      </div>

      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 max-w-screen-xl">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 pr-4 h-12 rounded-full border-2 border-gray-200 bg-white shadow-sm text-base focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
          />
        </div>

        {/* Vehicle List */}
        <VehicleTable vehicles={filteredVehicles} isLoading={!hasHydrated} />

       
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </div>
  );
}
