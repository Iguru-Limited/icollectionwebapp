"use client";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { User, LogOut, Receipt, Car, DollarSign, PiggyBank, TrendingUp, Wallet, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopNavigation } from "@/components/ui/top-navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { useEffect, useState } from "react";

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
    await signOut({ callbackUrl: "/login" });
  };

  const goToPreviousDay = () => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  };

  const goToNextDay = () => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Demo summary data - in real app, this would come from API
  const summaryData = {
    receipts: 23,
    vehicles: template?.vehicles?.length || 0,
    loans: 45000,
    savings: 120000,
    Operations:5000,
    total: 165000,
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      <TopNavigation />

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
                  {session?.user?.username || "User"}
                </h1>
                <p className="text-purple-100 text-sm">
                <span className="mx-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                  {session?.user?.company?.company_name || "Company"}
                </p>
                <p className="text-purple-200 text-xs mt-0.5">
                <span className="mx-1 w-1.5 h-1.5 rounded-full bg-yellow-400 inline-block" />
                  {session?.user?.stage?.stage_name || "Stage"}
                </p>
              </div>
            </div>
           
          </div>         
        </Card>

        {/* Date Selector */}
        <Card className="rounded-2xl p-4 shadow-sm bg-white">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-50"
              onClick={goToPreviousDay}
            >
              <ChevronLeft className="w-5 h-5 text-purple-600" />
            </Button>
            
            <div className="flex-1 text-center">
              <h2 className="text-lg md:text-xl font-bold text-gray-800">Today</h2>
              <p className="text-xs md:text-sm text-gray-500">{formatDate(selectedDate)}</p>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-purple-50"
              onClick={goToNextDay}
            >
              <ChevronRight className="w-5 h-5 text-purple-600" />
            </Button>
          </div>
        </Card>

        {/* Transactions Summary */}

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 px-2">
            Transactions Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow border text-sm">
              <thead>
                <tr className="bg-purple-50 text-purple-900">
                  <th className="py-3 px-4 text-left font-semibold">Metric</th>
                  <th className="py-3 px-4 text-left font-semibold">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-purple-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Receipts</td>
                  <td className="py-3 px-4 text-purple-600 text-xl font-bold">{summaryData.receipts}</td>
                </tr>
                <tr className="border-b hover:bg-blue-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Vehicles</td>
                  <td className="py-3 px-4 text-blue-600 text-xl font-bold">{summaryData.vehicles}</td>
                </tr>
                <tr className="border-b hover:bg-orange-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Loans</td>
                  <td className="py-3 px-4 text-orange-600 text-xl font-bold">{summaryData.loans.toLocaleString()}</td>
                </tr>
                <tr className="border-b hover:bg-green-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Savings</td>
                  <td className="py-3 px-4 text-green-600 text-xl font-bold">{summaryData.savings.toLocaleString()}</td>
                </tr>
                <tr className="border-b hover:bg-red-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Operations</td>
                  <td className="py-3 px-4 text-red-600 text-xl font-bold">{summaryData.Operations.toLocaleString()}</td>
                </tr>
                <tr className="hover:bg-indigo-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Total</td>
                  <td className="py-3 px-4 text-indigo-600 text-xl font-bold">{summaryData.total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

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

      <BottomNavigation />
    </motion.div>
  );
}
