'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useDeferredValue } from 'react';
import { useAppStore } from '@/store/appStore';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useVehicles } from '@/hooks/vehicle/useVehicles';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

export default function VehiclesTable() {
  const router = useRouter();
  const template = useCompanyTemplateStore((s) => s.template);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);
  const { data: vehiclesApi, isLoading: vehiclesLoading } = useVehicles();
  const tableSearch = useAppStore((s) => s.viewPreferences.tableSearch);
  const deferredSearch = useDeferredValue(tableSearch.trim().toLowerCase());
  const setViewPreferences = useAppStore((s) => s.setViewPreferences);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);
  // Template is already persisted from login in Zustand + localStorage

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-6"
      >
        <h2 className="text-xl font-bold font-mono pb-3">VEHICLES</h2>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center space-x-4"
        >
          <div className="relative">
            <Input
              placeholder="Search by plate, fleet number, or crew..."
              value={tableSearch}
              onChange={(e) => setViewPreferences({ tableSearch: e.target.value })}
              className="md:w-80 bg-gray-50 border-gray-200 rounded-none"
            />
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="text-white rounded-none">Search</Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Vehicles Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Card className="rounded-none">
          {!hasHydrated || !template ? (
            <div className="p-4 text-sm text-gray-500">
              {!hasHydrated ? 'Loading...' : 'No vehicles data available'}
            </div>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="text-grey-400 font-medium">#</TableHead>
                <TableHead className="text-grey-400 font-medium">Fleet Number</TableHead>
                <TableHead className="text-grey-400 font-medium">Vehicle</TableHead>
                <TableHead className="text-grey-400 font-medium">Driver</TableHead>
                <TableHead className="text-grey-400 font-medium">Conductor</TableHead>
                <TableHead className="flex text-grey-400 font-medium justify-end items-center">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                const apiVehicles = vehiclesApi?.data || [];
                const hasCrewInfo = apiVehicles.length > 0 && apiVehicles.some(v => v.crew && v.crew.length > 0);
                // Choose source: prefer API (has crew), else template fallback.
                const source = hasCrewInfo ? apiVehicles : (template?.vehicles || []).map(v => ({
                  vehicle_id: String(v.vehicle_id),
                  number_plate: v.number_plate,
                  crew: [] as { crew_id: string; name: string; phone: string; crew_role_id: string }[],
                }));
                const filtered = source.filter(v => {
                  if (!deferredSearch) return true;
                  const plate = v.number_plate.toLowerCase();
                  const fleetNumber = (('fleet_number' in v ? v.fleet_number : null) || '') as string;
                  const driverName = v.crew?.find(c => c.crew_role_id === '3')?.name?.toLowerCase() || '';
                  const conductorName = v.crew?.find(c => c.crew_role_id === '12')?.name?.toLowerCase() || '';
                  return plate.includes(deferredSearch) || fleetNumber.toLowerCase().includes(deferredSearch) || driverName.includes(deferredSearch) || conductorName.includes(deferredSearch);
                });
                if (filtered.length === 0 && deferredSearch) {
                  return (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-sm text-gray-500">
                        No vehicles match &ldquo;{tableSearch}&rdquo; (searched fleet number, plate, driver, conductor)
                      </TableCell>
                    </TableRow>
                  );
                }
                return filtered.map((vehicle, index) => {
                    const driver = vehicle.crew?.find(c => c.crew_role_id === '3')?.name || '-';
                    const conductor = vehicle.crew?.find(c => c.crew_role_id === '12')?.name || '-';
                    const fleetNum = (('fleet_number' in vehicle ? vehicle.fleet_number : null) || '-') as string;
                    return (
                      <TableRow key={`${vehicle.vehicle_id}-${index}`} className="hover:bg-gray-50">
                        <TableCell className="font-mono">{vehicle.vehicle_id}</TableCell>
                        <TableCell className="font-mono">{fleetNum}</TableCell>
                        <TableCell className="font-mono">{vehicle.number_plate}</TableCell>
                        <TableCell className="font-mono">{driver}</TableCell>
                        <TableCell className="font-mono">{conductor}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2 justify-end">
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                                onClick={() => {
                                  setSelectedVehicleId(Number(vehicle.vehicle_id));
                                  window.location.href = '/user/collection';
                                }}
                              >
                                Collect
                              </Button>
                            </motion.div>
                            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/user/report/${vehicle.vehicle_id}`)}
                                className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-none"
                              >
                                Reports
                              </Button>
                            </motion.div>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  });
              })()}
              {vehiclesLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500">Loading vehicles...</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </motion.section>
  );
}
