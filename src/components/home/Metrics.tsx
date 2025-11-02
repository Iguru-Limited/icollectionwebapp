'use client';
import { Bus, DollarSign, Receipt, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { data } from '../../data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
    },
  },
};

export default function Metrics() {
  const router = useRouter();

  const handleCardClick = () => {
    router.push('/user/reports');
  };

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex md:flex-row flex-col md:items-center justify-between mb-6"
      >
        <h2 className="text-xl font-bold font-mono pb-3">SUMMARY</h2>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center space-x-3"
        >
          <Input type="date" defaultValue="2025-10-07" className="w-40 rounded-none" />
          <Input type="date" defaultValue="2025-10-07" className="w-40 rounded-none" />
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button className="text-white rounded-none">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={containerVariants} className="md:grid md:grid-cols-3 gap-6">
        {/* Vehicles Card */}
        <motion.div variants={cardVariants}>
          <Card className="border border-gray-200 rounded-none hidden md:block">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicles</p>
                    <p className="text-2xl font-bold font-mono">{data.metrics.vehicles}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Receipts Issued Card */}
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="border border-gray-200 rounded-none cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleCardClick}
          >
            <CardContent className="pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Receipt className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Receipts Issued</p>
                    <p className="text-2xl font-bold font-mono">{data.metrics.receiptsIssued}</p>
                  </div>
                </div>
              </div>
              <div className="flex pt-6">
                <Button variant="outline" size="sm" className="rounded-none w-full">
                  View All
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Collected Card */}
        <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Card
            className="border border-gray-200 rounded-none cursor-pointer hover:shadow-md transition-shadow"
            onClick={handleCardClick}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Collected</p>
                    <p className="text-2xl font-bold font-mono">{data.metrics.totalCollected}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
