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
      className="container min-h-screen bg-white mx-auto max-w-4xl"
    >
      <Header />
      
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="px-6 py-8 space-y-8"
      >
  <Metrics />
  {/* Client component reads from session and hydrates store */}
  <VehiclesTable />
      </motion.main>
    </motion.div>
  );
}
