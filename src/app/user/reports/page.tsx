"use client";
import { motion } from "framer-motion";
import { Download, Filter, ArrowLeft } from "lucide-react";
import Header from "@/components/home/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { generateCollectionReportPDFWithLogo } from "@/lib/utils/reportPDF";
import { data } from "@/data";

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

export default function Reports() {
  const isMobile = useIsMobile();
  
  const totalAmount = data.reports.reduce((sum, report) => {
    const amount = parseInt(report.amount.replace(/[^\d]/g, ''));
    return sum + amount;
  }, 0);

  const handleDownloadPDF = async () => {
    try {
      await generateCollectionReportPDFWithLogo(data.reports);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

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
        {/* Report Controls */}
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
            <h2 className="text-xl font-bold font-mono pb-3">COLLECTION REPORTS</h2>
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
          </motion.div>

          {/* Search and Download */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4"
          >
            <div className="flex-1 max-w-md">
              <Input 
                placeholder="Quickly search vehicle...." 
                className="bg-gray-50 border-gray-200 rounded-none"
              />
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                className="text-white rounded-none w-full md:w-auto"
                onClick={handleDownloadPDF}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Reports Table */}
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
                    <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Vehicle</TableHead>
                    <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Receipt</TableHead>
                    <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Amount</TableHead>
                    <TableHead className={`text-white font-bold uppercase ${isMobile ? 'text-xs' : 'text-sm'}`}>Collection</TableHead>
                    <TableHead className={`text-white font-bold uppercase text-center ${isMobile ? 'text-xs' : 'text-sm'}`}>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.reports.map((report, index) => (
                    <motion.tr
                      key={report.id}
                      variants={rowVariants}
                      whileHover={{ 
                        backgroundColor: "rgba(249, 250, 251, 0.8)",
                        transition: { duration: 0.2 }
                      }}
                      className="hover:bg-gray-50"
                    >
                      <TableCell className={`text-center font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{index + 1}</TableCell>
                      <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.vehicle}</TableCell>
                      <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.receipt}</TableCell>
                      <TableCell className={`font-mono ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.amount}</TableCell>
                      <TableCell className={`font-mono uppercase ${isMobile ? 'text-xs py-2' : 'text-sm'}`}>{report.collection}</TableCell>
                      <TableCell className={`text-center ${isMobile ? 'py-2' : ''}`}>
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button 
                            variant="outline" 
                            size={isMobile ? "sm" : "sm"}
                            className={`rounded-none border-gray-300 text-gray-700 hover:bg-gray-50 ${isMobile ? 'text-xs px-2 py-1' : ''}`}
                          >
                            Reprint
                          </Button>
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Total Row */}
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

        {/* Back Button */}
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
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </motion.main>
      </div>
    </motion.div>
  );
}
