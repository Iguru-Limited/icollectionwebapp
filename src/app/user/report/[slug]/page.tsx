"use client";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Filter } from "lucide-react";
import Header from "@/components/home/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { data } from "@/data";
import { useParams, useRouter } from "next/navigation";
import { useMemo } from "react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
};

export default function VehicleReportPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const isMobile = useIsMobile();

  const vehicleId = Number(params?.slug);

  const { vehicle, vehicleReports } = useMemo(() => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    const vehiclePlate = vehicle?.plateNumber;
    const vehicleReports = vehiclePlate
      ? data.reports.filter(r => r.vehicle === vehiclePlate)
      : [];
    return { vehicle, vehicleReports };
  }, [vehicleId]);

  const totalAmount = vehicleReports.reduce((sum, report) => {
    const amount = parseInt(report.amount.replace(/[^\d]/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  if (!vehicle) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen bg-white"
      >
        <div className="sticky top-0 z-50 bg-white">
          <div className="container mx-auto max-w-6xl">
            <Header />
          </div>
        </div>
        <div className="container mx-auto max-w-6xl px-6 py-12">
          <Card className="p-8 rounded-none text-center">
            <h2 className="text-xl font-bold mb-2">Vehicle not found</h2>
            <p className="text-gray-600 mb-6">We couldn’t find a vehicle for id {params?.slug}.</p>
            <Button variant="outline" className="rounded-none" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <div className="sticky top-0 z-50 bg-white">
        <div className="container mx-auto max-w-6xl">
          <Header />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-6 py-8 space-y-8"
        >
          <motion.div
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
              <h2 className="text-xl font-bold font-mono pb-3">
                COLLECTION REPORT: {vehicle.plateNumber}
              </h2>
              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <Input
                    type="date"
                    defaultValue="2025-10-07"
                    className="w-40 rounded-none"
                  />
                  <Input
                    type="date"
                    defaultValue="2025-10-07"
                    className="w-40 rounded-none"
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button className="text-white rounded-none">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </motion.div>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button className="text-white rounded-none">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="rounded-none">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-700 hover:bg-green-700">
                      <TableHead className={`text-white font-bold uppercase text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>#</TableHead>
                      <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Receipt</TableHead>
                      <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Amount</TableHead>
                      <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Collection</TableHead>
                      <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Date</TableHead>
                      <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicleReports.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-600">
                          No receipts found for this vehicle.
                        </TableCell>
                      </TableRow>
                    ) : (
                      vehicleReports.map((report, index) => (
                        <motion.tr
                          key={`${report.receipt}-${index}`}
                          variants={rowVariants}
                          whileHover={{ 
                            backgroundColor: "rgba(249, 250, 251, 0.8)",
                            transition: { duration: 0.2 }
                          }}
                          className="hover:bg-gray-50"
                        >
                          <TableCell className={`text-center font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{index + 1}</TableCell>
                          <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.receipt}</TableCell>
                          <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.amount}</TableCell>
                          <TableCell className={`font-mono uppercase ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.collection}</TableCell>
                          <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.date}</TableCell>
                          <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.time}</TableCell>
                        </motion.tr>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-between items-center py-4 px-6 border-t border-gray-200 bg-gray-50"
            >
              <span className={`font-bold font-mono ${isMobile ? 'text-sm' : 'text-lg'}`}>TOTAL</span>
              <span className={`font-bold font-mono ${isMobile ? 'text-sm' : 'text-lg'}`}>KES {totalAmount.toLocaleString()}</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex justify-start"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                className="rounded-none border-gray-300"
                onClick={() => router.back()}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </motion.div>
  );
}
