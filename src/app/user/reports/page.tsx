"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart2, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { TopNavigation } from "@/components/ui/top-navigation";
import { BottomNavigation } from "@/components/ui/bottom-navigation";

function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatLongDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white"
    >
      {/* Top navigation for md+ screens (since bottom nav hides) */}
      <TopNavigation />
  <div className="mx-auto px-4 pt-6 pb-24 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-indigo-100 text-indigo-600">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 leading-none">Vehicle Reports</h1>
              <p className="text-xs text-gray-500">Collection summary by vehicle</p>
            </div>
          </div>
          {/* <div className="flex items-center gap-1 px-3 py-1 rounded-full border border-blue-400 text-blue-500 text-xs font-semibold bg-white">
            <Circle className="w-3 h-3 fill-blue-400 text-blue-400" />
            Live
          </div> */}
        </div>

        {/* Select Date */}
  <Card className="rounded-2xl p-4 md:p-6 shadow-sm mb-8">
          <div className="text-xs font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <CalendarIcon className="w-4 h-4 text-purple-700" />
            SELECT DATE
          </div>

          <div className="flex items-center justify-between">
            <button
              className="rounded-full p-2 bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              onClick={() => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1))}
              aria-label="Previous day"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="rounded-xl px-4 py-3 min-w-[12rem] md:min-w-[18rem] flex items-center justify-between gap-4 bg-purple-100 border-2 border-purple-400">
              <div>
                <div className="text-purple-700 text-sm font-semibold">Today</div>
                <div className="text-gray-700 text-xs leading-tight">{formatLongDate(selectedDate)}</div>
              </div>
              <CalendarIcon className="w-5 h-5 text-purple-700" />
            </div>

            <button
              className="rounded-full p-2 bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
              onClick={() => setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1))}
              aria-label="Next day"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </Card>

        {/* Empty State */}
        <div className="flex flex-col items-center text-center mt-12 md:mt-16">
          <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center mb-6">
            {/* car icon substitute */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-purple-400"><path d="M5 11l1-3a3 3 0 012.83-2h6.34A3 3 0 0118 8l1 3h1a1 1 0 010 2h-1v3a2 2 0 01-2 2h-1a1 1 0 01-1-1v-1H9v1a1 1 0 01-1 1H7a2 2 0 01-2-2v-3H4a1 1 0 010-2h1zm3.17-3a1 1 0 00-.95.68L6.6 11h10.8l-.62-2.32a1 1 0 00-.95-.68H8.17zM7 15a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-2">No Vehicle Data</h3>
          <p className="text-xs text-gray-500 max-w-xs">
            No vehicle collection data available for {formatShortDate(selectedDate)}. Reports will appear here once vehicles record collections.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </motion.div>
  );
}
