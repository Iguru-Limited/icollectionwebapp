"use client";
import { useSession, signOut } from "next-auth/react";
import { useAppStore } from "@/store/appStore";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, FileText, SquarePen, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { TopNavigation } from "@/components/ui/top-navigation";
import { IoCar } from "react-icons/io5";

export default function UserPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);

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
    <div className="min-h-screen bg-white">
      {/* Top navigation mirrors bottom nav (visible on all routes) */}
      <TopNavigation />
      <div className="container mx-auto px-4 py-6 pb-24 space-y-6 max-w-md sm:max-w-lg md:max-w-3xl lg:max-w-5xl">
        
        {/* Modern Header (adapted from HeaderProfileModern) */}
        <Card className="bg-[#6A1B9A] rounded-2xl border-2 border-yellow-500 shadow-md p-5 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}  
              {/* User Info */}
              <div className="flex flex-col">                
              <div className="flex items-center mt-1 space-x-2">
                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                <p className="text-sm text-yellow-400 truncate">
                  {session?.user?.stage?.stage_name}
                </p>
              </div>
            </div>
          </div>            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
            </Button>
          </div>

          {/* Accent line */}
          <div className="w-1/3 h-1.5 bg-yellow-400 rounded-full mt-4"></div>
        </Card>

        {/* Vehicle Fleet Section */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <IoCar className="w-5 h-5 text-purple-700" />
            <h2 className="font-semibold text-gray-800 text-lg">Vehicle Fleet</h2>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by plate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 rounded-xl border border-gray-300 shadow-sm text-sm focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Vehicle Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {!hasHydrated ? (
              <Card className="p-6 text-center text-gray-500 sm:col-span-2 lg:col-span-3">Loading vehicles...</Card>
            ) : filteredVehicles.length === 0 ? (
              <Card className="p-6 text-center text-gray-500 sm:col-span-2 lg:col-span-3">No vehicles found</Card>
            ) : (
              filteredVehicles.map((vehicle) => (
                <Card
                  key={vehicle.vehicle_id}
                  className="rounded-xl border-2 border-red-400 p-4 shadow-sm"
                >
                  <div className="flex items-center space-x-3">
                    <IoCar className="text-red-600 w-5 h-5" />
                    <h3 className="text-lg font-semibold text-red-600 uppercase">
                      {vehicle.number_plate}
                    </h3>
                  </div>

                  <p className="text-gray-600 text-sm mt-2 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>
                      Capacity:{" "}
                      <span className="font-medium text-red-600">
                        {vehicle.seats || 5} seats
                      </span>
                    </span>
                  </p>

                  <div className="flex mt-4 space-x-3">
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                      onClick={() => {
                        setSelectedVehicleId(vehicle.vehicle_id);
                        router.push("/user/collection");
                      }}
                    >
                      
                      <SquarePen className="w-4 h-4" /> Manage
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2"
                      onClick={() =>
                        router.push(`/user/report/${vehicle.vehicle_id}`)
                      }
                    >
                      <FileText className="w-4 h-4" /> View Report
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
