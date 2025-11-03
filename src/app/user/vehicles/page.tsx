'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Search, Car } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TopNavigation } from '@/components/ui/top-navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { Badge } from '@/components/ui/badge';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { VehicleTable } from '@/components/vehicles/VehicleTable';

export default function VehiclesPage() {
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

  const filteredVehicles = (template?.vehicles ?? []).filter((vehicle) =>
    searchQuery ? vehicle.number_plate.toLowerCase().includes(searchQuery.toLowerCase()) : true,
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Top navigation - hidden on small screens */}
      <div className="hidden md:block">
        <TopNavigation />
      </div>

      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 max-w-screen-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-black-600">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Vehicle Fleet</h1>
              <p className="text-xl md:text-2xl text-gray-500">Manage your vehicle fleet</p>
            </div>
          </div>
          <Badge variant="outline" className="hidden md:flex">
            {filteredVehicles.length} Vehicles
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search by plate ..."
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
    </motion.div>
  );
}
