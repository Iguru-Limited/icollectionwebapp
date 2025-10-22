"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2
    }
  }
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
};

export default function VehiclesTable() {
  const router = useRouter();
  const { data: session } = useSession();
  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);
  const tableSearch = useAppStore((s) => s.viewPreferences.tableSearch);
  const setViewPreferences = useAppStore((s) => s.setViewPreferences);
  const setSelectedVehicleId = useAppStore((s) => s.setSelectedVehicleId);

  // Hydrate store from session if store is empty
  useEffect(() => {
    if (!hasHydrated) return;
    
    if (!template && session?.company_template) {
      setTemplate(session.company_template);
    }
  }, [hasHydrated, template, session, setTemplate]);

  // Additional effect to try hydrating after a short delay if session loads later
  useEffect(() => {
    if (!hasHydrated || template) return;
    
    const timeout = setTimeout(() => {
      if (!template && session?.company_template) {
        setTemplate(session.company_template);
      }
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [hasHydrated, template, session, setTemplate]);

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
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
              placeholder="Quickly search vehicle...." 
              value={tableSearch}
              onChange={(e) => setViewPreferences({ tableSearch: e.target.value })}
              className="md:w-80 bg-gray-50 border-gray-200 rounded-none"
            />
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="text-white rounded-none">
              Search
            </Button>
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
              {!hasHydrated ? "Loading..." : "No vehicles data available"}
            </div>
          ) : null}
          <Table>
            <TableHeader>
              <TableRow className="">
                <TableHead className="text-grey-400 font-medium">#</TableHead>
                <TableHead className="text-grey-400 font-medium">Vehicle</TableHead>
                <TableHead className="flex text-grey-400 font-medium justify-end items-center">Action</TableHead>
              </TableRow>
            </TableHeader>
              <TableBody>
                {((template?.vehicles ?? [])
                  .filter((v) =>
                    tableSearch
                      ? v.number_plate.toLowerCase().includes(tableSearch.toLowerCase())
                      : true
                  )
                  .map((vehicle, index) => {
                    console.log(`🚗 Rendering vehicle ${index + 1}:`, vehicle.number_plate);
                    return (
                  <TableRow
                    key={`${vehicle.vehicle_id}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <TableCell className="font-mono">{vehicle.vehicle_id}</TableCell>
                    <TableCell className="font-mono">{vehicle.number_plate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2 justify-end">
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white rounded-none"
                          onClick={() => {
                            setSelectedVehicleId(vehicle.vehicle_id);
                            window.location.href = '/user/collection';
                          }}
                        >
                          Collect
                        </Button>
                      </motion.div>
                      <motion.div
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
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
                  }))}
            </TableBody>
          </Table>
        </Card>
      </motion.div>
    </motion.section>
  );
}
