"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Search, Car, FileText, SquarePen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TopNavigation } from "@/components/ui/top-navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { useAppStore } from "@/store/appStore";

export default function VehiclesPage() {
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

  const filteredVehicles = (template?.vehicles ?? []).filter((vehicle) =>
    searchQuery
      ? vehicle.number_plate.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      <TopNavigation />

      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 max-w-screen-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                Vehicle Fleet
              </h1>
              <p className="text-xs md:text-sm text-gray-500">
                Manage your vehicle fleet
              </p>
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

        {/* Desktop Table View */}
        <Card className="hidden md:block rounded-2xl shadow-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-purple-50 hover:bg-purple-50">
                <TableHead className="font-semibold text-purple-900">#</TableHead>
                <TableHead className="font-semibold text-purple-900">
                  Number Plate
                </TableHead>
                <TableHead className="font-semibold text-purple-900 text-center">
                  Seats
                </TableHead>
                <TableHead className="font-semibold text-purple-900 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasHydrated ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    <div className="animate-pulse">Loading vehicles...</div>
                  </TableCell>
                </TableRow>
              ) : filteredVehicles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                    No vehicles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredVehicles.map((vehicle, index) => (
                  <TableRow key={vehicle.vehicle_id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-600">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-purple-600" />
                        <span className="font-bold text-gray-800 uppercase">
                          {vehicle.number_plate}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-gray-700">
                      {vehicle.seats || 14}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            setSelectedVehicleId(vehicle.vehicle_id);
                            router.push("/user/collection");
                          }}
                        >
                          <SquarePen className="w-3 h-3 mr-1" />
                          Receipts
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-xs"
                          onClick={() =>
                            router.push(`/user/report/${vehicle.vehicle_id}`)
                          }
                        >
                          <FileText className="w-3 h-3 mr-1" />
                          Transactions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {!hasHydrated ? (
            <Card className="p-8 text-center text-gray-500">
              <div className="animate-pulse">Loading vehicles...</div>
            </Card>
          ) : filteredVehicles.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No vehicles found
            </Card>
          ) : (
            filteredVehicles.map((vehicle, index) => (
              <Card
                key={vehicle.vehicle_id}
                className="rounded-xl p-4 shadow-sm bg-white border-2 border-gray-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base uppercase">
                        {vehicle.number_plate}
                      </h4>
                      <p className="text-xs text-gray-500">{vehicle.seats || 14} seats</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-xs font-semibold h-9"
                    onClick={() => {
                      setSelectedVehicleId(vehicle.vehicle_id);
                      router.push("/user/collection");
                    }}
                  >
                    <SquarePen className="w-3 h-3 mr-1" />
                    Collect
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold h-9"
                    onClick={() =>
                      router.push(`/user/report/${vehicle.vehicle_id}`)
                    }
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Report
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNavigation />
    </motion.div>
  );
}
