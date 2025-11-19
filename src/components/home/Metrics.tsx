'use client';
import { Bus, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { useDashboardStats } from '@/hooks/dashboard/useDashboardStats';

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
  const { data: stats, isLoading, error } = useDashboardStats();

  return (
    <motion.section initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h2 className="text-xl font-bold font-mono pb-3">SUMMARY</h2>
        {error && (
          <p className="text-sm text-red-600">Failed to load dashboard stats.</p>
        )}
      </motion.div>

      {/* Metric Cards */}
      <motion.div variants={containerVariants} className="md:grid md:grid-cols-3 gap-6">
        {/* Vehicles Card (from API) */}
        <motion.div variants={cardVariants}>
          <Card className="border border-gray-200 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                    <Bus className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Vehicles</p>
                    <p className="text-2xl font-bold font-mono">
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2 text-gray-400 text-base"><Spinner className="w-4 h-4" /> Loading</span>
                      ) : (
                        stats?.data?.vehicles?.total_vehicles ?? 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crew Total Card (from API) */}
        <motion.div variants={cardVariants}>
          <Card className="border border-gray-200 rounded-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Crew</p>
                    <p className="text-2xl font-bold font-mono">
                      {isLoading ? (
                        <span className="inline-flex items-center gap-2 text-gray-400 text-base"><Spinner className="w-4 h-4" /> Loading</span>
                      ) : (
                        stats?.data?.crew?.total_crew ?? 0
                      )}
                    </p>
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
