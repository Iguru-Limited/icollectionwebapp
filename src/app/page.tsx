"use client";
import { motion } from "framer-motion";
import Header from "@/components/home/Header";
import Metrics from "@/components/home/Metrics";
import VehiclesTable from "@/components/home/VehiclesTable";

export default function Home() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white"
    >
      <div className="sticky top-0 z-50 bg-white">
        <div className="container mx-auto max-w-4xl">
          <Header />
        </div>
      </div>
      
      <div className="container mx-auto max-w-4xl">
        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="px-6 py-8 space-y-8"
        >
          <Metrics />
          <VehiclesTable />
        </motion.main>
      </div>
    </motion.div>
  );
}
