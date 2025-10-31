"use client";
import { useSession, signOut } from "next-auth/react";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LogOut } from "lucide-react";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { TopNavigation } from "@/components/ui/top-navigation";
import { VehicleTable } from "@/components/vehicles/VehicleTable";

export default function UserPage() {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");

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
    await signOut({ callbackUrl: "/login" });
  };

  const filteredVehicles = (template?.vehicles ?? []).filter((vehicle) =>
    searchQuery
      ? vehicle.number_plate.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navigation - Always visible */}
      <TopNavigation />
      
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 max-w-screen-xl">
        
        {/* Header Section - User info (hidden on mobile, shown on larger screens) */}
        <div className="hidden md:block">
          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span className="text-lg font-semibold">
                  {session?.user?.username ?? "Company"}
                </span>
                <span className="mx-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                <span className="text-sm opacity-90">
                  {session?.user?.stage?.stage_name ?? "Stage"}
                </span>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>

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

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <VehicleTable 
            vehicles={filteredVehicles}
            isLoading={!hasHydrated}
            variant="table"
          />
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden">
          <VehicleTable 
            vehicles={filteredVehicles}
            isLoading={!hasHydrated}
            variant="card"
          />
        </div>

        {/* Mobile logout button */}
        <div className="md:hidden mt-6">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <BottomNavigation />
    </div>
  );
}
