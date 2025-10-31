"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Receipt as ReceiptIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TopNavigation } from "@/components/ui/top-navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Demo data based on the sketch
const demoSummary = {
  Receipts: 41,
  Vehicles: 3,
  Total: 48873,
  Operations: 98873,
  Loans: 18830,
};

const demoReceipts = [
  {
    id: 1,
    receiptNumber: "RCE181",
    date: "2024-10-31",
    details: "Morning Collection",
    status: "view details",
    amount: 15200,
  },
  {
    id: 2,
    receiptNumber: "RCE142",
    date: "2024-10-31",
    details: "Evening Collection",
    status: "view receipt",
    amount: 18500,
  },
  {
    id: 3,
    receiptNumber: "RCE145",
    date: "2024-10-31",
    details: "Afternoon Collection",
    status: "view",
    amount: 9800,
  },
  {
    id: 4,
    receiptNumber: "RCE146",
    date: "2024-10-31",
    details: "Special Route",
    status: "view",
    amount: 5373,
  },
  {
    id: 5,
    receiptNumber: "RCE147",
    date: "2024-10-31",
    details: "Late Collection",
    status: "pending",
    amount: 0,
  },
];

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goToPreviousDay = () => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1));
  };

  const goToNextDay = () => {
    setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1));
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
        
        {/* Date Navigation - "Today" with arrows */}
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

        {/* Summary Card */}
        <Card className="rounded-2xl shadow-lg overflow-hidden border-0">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 p-6">
            <h3 className="text-base font-bold text-white mb-1">Daily Summary</h3>
            <p className="text-xs text-purple-100">Overview of today&apos;s collections</p>
          </div>
          
          <div className="p-6 bg-white">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Receipts */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                <p className="text-xs font-medium text-blue-700 mb-1">Receipts</p>
                <p className="text-3xl font-bold text-blue-900">{demoSummary.Receipts}</p>
                <p className="text-xs text-blue-600 mt-1">Total count</p>
              </div>

              {/* Vehicles */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                <p className="text-xs font-medium text-green-700 mb-1">Vehicles</p>
                <p className="text-3xl font-bold text-green-900">{demoSummary.Vehicles}</p>
                <p className="text-xs text-green-600 mt-1">Active today</p>
              </div>

              {/* Total */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                <p className="text-xs font-medium text-purple-700 mb-1">Total Collections</p>
                <p className="text-3xl font-bold text-purple-900">Ksh {demoSummary.Total.toLocaleString()}</p>
                <p className="text-xs text-purple-600 mt-1">Revenue</p>
              </div>

              {/* Operations */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                <p className="text-xs font-medium text-orange-700 mb-1">Operations</p>
                <p className="text-3xl font-bold text-orange-900">Ksh {demoSummary.Operations.toLocaleString()}</p>
                <p className="text-xs text-orange-600 mt-1">Expenses</p>
              </div>

              {/* Loans */}
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
                <p className="text-xs font-medium text-red-700 mb-1">Loans</p>
                <p className="text-3xl font-bold text-red-900">Ksh {demoSummary.Loans.toLocaleString()}</p>
                <p className="text-xs text-red-600 mt-1">Outstanding</p>
              </div>

              {/* Net Balance */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-1">Net Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  Ksh {(demoSummary.Total - demoSummary.Operations - demoSummary.Loans).toLocaleString()}
                </p>
                <p className="text-xs text-gray-600 mt-1">After deductions</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Receipts List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 px-2">Recent Receipts</h3>
          
          {/* Desktop Table View */}
          <Card className="hidden md:block rounded-2xl shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="font-semibold text-purple-900">#</TableHead>
                  <TableHead className="font-semibold text-purple-900">Receipt Number</TableHead>
                  <TableHead className="font-semibold text-purple-900">Details</TableHead>
                  <TableHead className="font-semibold text-purple-900">Date</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoReceipts.map((receipt, index) => (
                  <TableRow key={receipt.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-800">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {receipt.details}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {receipt.date}
                    </TableCell>
                    <TableCell className="text-right font-bold text-purple-600">
                      {receipt.amount > 0 ? `Ksh ${receipt.amount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </Button>
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-xs"
                        >
                          <ReceiptIcon className="w-3 h-3 mr-1" />
                          Receipt
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Mobile Card View */}
          {demoReceipts.map((receipt, index) => (
            <Card
              key={receipt.id}
              className="md:hidden rounded-xl p-4 shadow-sm bg-white border-2 border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{receipt.receiptNumber}</h4>
                    <p className="text-xs text-gray-500">{receipt.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-600">
                    {receipt.amount > 0 ? `${receipt.amount.toLocaleString()}` : '-'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-2 border-purple-600 text-purple-600 hover:bg-purple-50 text-xs font-semibold"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  {receipt.status === "view details" ? "View Details" : "View"}
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                >
                  <ReceiptIcon className="w-3 h-3 mr-1" />
                  {receipt.status === "view receipt" ? "View Receipt" : "Receipt"}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <BottomNavigation />
    </motion.div>
  );
}
