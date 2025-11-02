'use client';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TransactionSummaryTable } from '@/components/ui/transaction-summary-table';
import { Button } from '@/components/ui/button';
import { TopNavigation } from '@/components/ui/top-navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useEffect, useState } from 'react';
import { DateSelector } from '@/components/ui/date-selector';

export default function AccountPage() {
  const { data: session } = useSession();
  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (!hasHydrated) return;
    if (!template && session?.company_template) {
      setTemplate(session.company_template);
    }
  }, [hasHydrated, template, session, setTemplate]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  // Demo summary data - in real app, this would come from API
  const summaryData = {
    receipts: 23,
    vehicles: template?.vehicles?.length || 0,
    loans: 45000,
    savings: 120000,
    Operations: 5000,
    total: 165000,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Top navigation - hidden on small screens */}
      <div className="hidden md:block">
        <TopNavigation />
      </div>

      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 max-w-screen-xl">
        {/* User Info Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  <span className="mx-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                  {session?.user?.username || 'User'}
                </h1>
                <p className="text-purple-100 text-sm">
                  <h1 className="text-2xl font-bold text-white">
                    {' '}
                    <span className="mx-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />{' '}
                    {session?.user?.company?.company_name || 'Company'}
                  </h1>
                </p>
                <p className="text-purple-200 text-xs mt-0.5">
                  <h1 className="text-2xl font-bold text-white">
                    {' '}
                    <span className="mx-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />{' '}
                    {session?.user?.stage?.stage_name || 'Stage'}{' '}
                  </h1>
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Date Selector */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Transactions Summary */}

        <TransactionSummaryTable
          title="Transactions Summary"
          data={[
            { label: 'Receipts', value: summaryData.receipts },
            { label: 'Vehicles', value: summaryData.vehicles },
            { label: 'Loans', value: summaryData.loans.toLocaleString() },
            { label: 'Savings', value: summaryData.savings.toLocaleString() },
            { label: 'Operations', value: summaryData.Operations.toLocaleString() },
            { label: 'Total', value: summaryData.total.toLocaleString() },
          ]}
        />

        {/* Account Details */}
        {/* <Card className="rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">
            Account Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Username</span>
              <span className="font-semibold text-gray-800">
                {session?.user?.username || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Stage</span>
              <span className="font-semibold text-gray-800">
                {session?.user?.stage?.stage_name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Company</span>
              <span className="font-semibold text-gray-800">
                {session?.user?.company?.company_name || "N/A"}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Total Vehicles</span>
              <span className="font-semibold text-gray-800">
                {summaryData.vehicles}
              </span>
            </div>
          </div>
        </Card> */}

        {/* Logout Button - Desktop */}
        {/* <div className="hidden md:block">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl h-12 border-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div> */}

        {/* Logout Button - Mobile */}
        <div className="md:hidden">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl h-12 border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  );
}
