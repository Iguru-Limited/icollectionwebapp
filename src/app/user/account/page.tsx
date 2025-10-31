"use client";
import { useSession, signOut } from "next-auth/react";
import { motion } from "framer-motion";
import { User, LogOut, Receipt, Car, DollarSign, PiggyBank, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopNavigation } from "@/components/ui/top-navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { useCompanyTemplateStore } from "@/store/companyTemplateStore";
import { useEffect } from "react";

export default function AccountPage() {
  const { data: session } = useSession();
  const template = useCompanyTemplateStore((s) => s.template);
  const setTemplate = useCompanyTemplateStore((s) => s.setTemplate);
  const hasHydrated = useCompanyTemplateStore((s) => s._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!template && session?.company_template) {
      setTemplate(session.company_template);
    }
  }, [hasHydrated, template, session, setTemplate]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  // Get today's date
  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Demo summary data - in real app, this would come from API
  const summaryData = {
    receipts: 23,
    vehicles: template?.vehicles?.length || 0,
    loans: 45000,
    savings: 120000,
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

        {/* Transactions Summary */}
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-3 px-2">
            Transactions Summary
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Receipts */}
            <Card className="rounded-xl p-4 shadow-sm border-2 border-purple-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Receipts</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {summaryData.receipts}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            {/* Vehicles */}
            <Card className="rounded-xl p-4 shadow-sm border-2 border-blue-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vehicles</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {summaryData.vehicles}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Car className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            {/* Loans */}
            <Card className="rounded-xl p-4 shadow-sm border-2 border-orange-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Loans</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {summaryData.loans.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </Card>

            {/* Savings */}
            <Card className="rounded-xl p-4 shadow-sm border-2 border-green-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Savings</p>
                  <p className="text-3xl font-bold text-green-600">
                    {summaryData.savings.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Total */}
            <Card className="rounded-xl p-4 shadow-sm border-2 border-indigo-100 hover:shadow-md transition-all md:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {summaryData.total.toLocaleString()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Account Details */}
        <Card className="rounded-2xl shadow-md p-6">
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
        </Card>

        {/* Logout Button - Desktop */}
        <div className="hidden md:block">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full rounded-xl h-12 border-2 border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

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
