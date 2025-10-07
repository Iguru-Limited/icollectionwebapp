"use client";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/home/Header";
import RecentReceipts from "@/components/collection/RecentReceipts";
import CollectionForm from "@/components/collection/CollectionForm";
import { data } from "../../data";

export default function CollectionPage() {
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
        className="px-6 py-8"
      >
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-none"
              onClick={() => window.location.href = '/'}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="md:text-2xl font-bold font-mono"
          >
            Collection for {data.currentVehicle.plateNumber}
          </motion.h1>
        </motion.div>

        {/* Content Sections */}
        <div className="space-y-8">
          <RecentReceipts />
          <CollectionForm />
        </div>
      </motion.main>
    </motion.div>
  );
}
