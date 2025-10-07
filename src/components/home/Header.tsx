"use client";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="border-b border-gray-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center space-x-3"
        >
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-8 h-8 bg-black rounded"
          />
          <h1 className="text-xl font-bold font-outfit hidden md:block">icollections</h1>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 max-w-md mx-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search receipts..." 
              className="pl-10 bg-gray-50 border-gray-200 rounded-none"
            />
          </div>
        </motion.div>

        {/* User Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center space-x-3"
        >
          <span className="text-sm font-medium hidden md:block">Hey, Joe</span>
          <motion.div 
            whileHover={{ scale: 1.1 }}
            className="relative"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-800 text-white text-xs">
                J
              </AvatarFallback>
            </Avatar>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            >
              <Badge className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
}
