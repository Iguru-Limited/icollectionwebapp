"use client";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { data } from "@/data";
import { TopNavigation } from "@/components/ui/top-navigation";

// Utilities
function formatLongDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function isSameYMD(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isToday(date: Date) {
  return isSameYMD(date, new Date());
}

function parseDDMMYYYY(value: string): Date | null {
  // expected format: 13-08-2025
  const m = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
}

export default function VehicleReportPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const vehicleId = Number(params?.slug);

  const { vehicle, vehicleReports } = useMemo(() => {
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    const vehiclePlate = vehicle?.plateNumber;
    const vehicleReports = vehiclePlate
      ? data.reports.filter(r => r.vehicle === vehiclePlate)
      : [];
    return { vehicle, vehicleReports };
  }, [vehicleId]);

  // Filter reports for the selected date (mock data uses DD-MM-YYYY)
  const reportsForDay = useMemo(() => {
    return vehicleReports.filter((r) => {
      const d = parseDDMMYYYY(r.date);
      return d ? isSameYMD(d, selectedDate) : false;
    });
  }, [vehicleReports, selectedDate]);

  const totalAmount = reportsForDay.reduce((sum, report) => {
    const amount = parseInt(report.amount.replace(/[^\d]/g, ""));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const totalReceipts = reportsForDay.length;

  // Title shown in app bar (use plate if available, otherwise generic label)
  const appBarTitle = vehicle?.plateNumber ? `${vehicle.plateNumber} REPORT` : "REPORT";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#F5F5F7]"
    >
  {/* Top app bar */}
  <TopNavigation />
      <div className="sticky top-0 z-50 bg-purple-700 text-white">
        <div className="mx-auto px-4 py-3 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full p-2 h-auto"
                onClick={() => router.back()}
                aria-label="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </div>
            <div className="justify-self-center">
              <h1 className="text-sm font-semibold truncate">{appBarTitle}</h1>
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* Content */}
  <div className="mx-auto px-4 py-4 space-y-4 max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-4xl">
        {/* Select Date */}
        <Card className="rounded-2xl p-4 shadow-sm">
          <div className="text-xs font-semibold text-gray-600 flex items-center gap-2 mb-3">
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

            <div className="border-2 border-purple-600 rounded-xl px-4 py-3 min-w-[12rem] md:min-w-[18rem] flex items-center justify-between gap-4">
              <div>
                <div className="text-purple-700 text-sm font-semibold">
                  {isToday(selectedDate) ? "Today" : "Selected Date"}
                </div>
                <div className="text-gray-700 text-xs leading-tight">
                  {formatLongDate(selectedDate)}
                </div>
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

        {/* Collections Summary */}
        <Card className="rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-sm mb-3">
            <FileText className="w-4 h-4 text-purple-700" />
            Collections Summary
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2">
            <div className="px-2 py-4 text-center">
              <div className="text-[11px] tracking-wide text-gray-600">TOTAL RECEIPTS</div>
              <div className="text-2xl font-extrabold text-gray-900">{totalReceipts}</div>
            </div>
            <div className="px-2 py-4 text-center border-l">
              <div className="text-[11px] tracking-wide text-gray-600">TOTAL AMOUNT</div>
              <div className="text-2xl font-extrabold text-gray-900"><span className="font-semibold">Ksh</span> {totalAmount.toLocaleString()}</div>
            </div>
          </div>
        </Card>

        {/* Search */}
        <InputGroup className="rounded-full border-purple-400 shadow-sm">
          <InputGroupAddon>
            <Search className="text-purple-700" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search by receipt number or type..." />
        </InputGroup>

        {/* Placeholder icon circle */}
        <div className="py-10 flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border-2 border-dashed border-purple-300 flex items-center justify-center">
            <FileText className="w-10 h-10 text-purple-500" />
          </div>
        </div>

      </div>
    </motion.div>
  );
}
