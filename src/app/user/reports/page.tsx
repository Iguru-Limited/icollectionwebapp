"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye, Receipt as ReceiptIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TopNavigation } from "@/components/ui/top-navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";
import { Button } from "@/components/ui/button";

// Demo data based on the sketch
const demoSummary = {
  receiptCount: 41,
  vehicles: 3,
  total: 48873,
  openths: 98873,
  loan: 18830,
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
        <Card className="rounded-2xl p-5 shadow-md bg-gradient-to-br from-purple-600 to-purple-700 text-white">
          <h3 className="text-sm font-semibold mb-4 opacity-90">Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs opacity-80">Receipt #</p>
              <p className="text-2xl font-bold">{demoSummary.receiptCount}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Vehicles</p>
              <p className="text-2xl font-bold">{demoSummary.vehicles}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Total</p>
              <p className="text-2xl font-bold">{demoSummary.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs opacity-80">Openths</p>
              <p className="text-2xl font-bold">{demoSummary.openths.toLocaleString()}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs opacity-80">Loan</p>
              <p className="text-2xl font-bold">{demoSummary.loan.toLocaleString()}</p>
            </div>
          </div>
        </Card>

        {/* Receipts List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 px-2">Recent Receipts</h3>
          
          {demoReceipts.map((receipt, index) => (
            <Card
              key={receipt.id}
              className="rounded-xl p-4 shadow-sm bg-white border-2 border-gray-200 hover:shadow-md transition-all"
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
