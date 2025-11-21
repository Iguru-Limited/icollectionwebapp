'use client';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  DocumentTextIcon,
  PrinterIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Spinner } from '@/components/ui/spinner';
import { useReportByVehicleDate } from '@/hooks/report/useReportByVehicleDate';
import { DateSelector } from '@/components/ui/date-selector';

// Utilities
function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateTime(dt: string): string {
  // expects "YYYY-MM-DD HH:mm:ss"
  const [datePart, timePart] = dt.split(' ');
  if (!datePart) return dt;
  const [y, m, d] = datePart.split('-').map(Number);
  let hours = 0,
    minutes = 0,
    seconds = 0;
  if (timePart) {
    const [hh, mm, ss] = timePart.split(':').map(Number);
    hours = hh ?? 0;
    minutes = mm ?? 0;
    seconds = ss ?? 0;
  }
  const date = new Date(y, (m || 1) - 1, d || 1, hours, minutes, seconds);
  if (isNaN(date.getTime())) return dt;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function VehicleReportPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});

  const vehicleId = Number(params?.slug);

  const { data: session, status } = useSession();
  const { fetchReport, data, isLoading, error, reset } = useReportByVehicleDate();

  // Fetch when vehicle/date changes
  useEffect(() => {
    if (!Number.isFinite(vehicleId)) return;
    if (status !== 'authenticated') return; // wait for session
    const companyId = session?.user?.company?.company_id;
    if (!companyId) return; // still not ready

    // clear any prior errors then fetch
    reset();
    fetchReport(vehicleId, toYMD(selectedDate));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, selectedDate, status, session?.user?.company?.company_id]);

  const rows = useMemo(() => data?.data?.rows ?? [], [data]);
  const appBarTitle = rows[0]?.number_plate ? `${rows[0].number_plate} REPORT` : 'REPORT';

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) => {
      const inReceipt = row.receipt_number?.toLowerCase().includes(q);
      const inSlugs = Object.keys(row.payload?.slugs ?? {}).some((k) =>
        k.toLowerCase().includes(q),
      );
      return inReceipt || inSlugs;
    });
  }, [rows, search]);

  const totalAmount = filteredRows.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);
  const totalReceipts = filteredRows.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#F5F5F7]"
    >
      <div className="hidden md:block sticky top-0 z-50 bg-purple-700 text-white">
        <div className="mx-auto px-4 py-3 max-w-screen-xl">
          <div className="grid grid-cols-3 items-center">
            <div className="justify-self-start">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full p-2 h-auto"
                onClick={() => router.back()}
                aria-label="Back"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="justify-self-center">
              <h1 className="text-2xl font-semibold truncate">{appBarTitle}</h1>
            </div>
            <div />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto px-4 py-4 space-y-4 max-w-screen-xl">
        {/* Select Date */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Collections Summary */}
        <Card className="rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-800 font-semibold text-xl mb-3">
            <DocumentTextIcon className="w-4 h-4 text-purple-700" />
            Collections Summary
          </div>
          <Separator className="my-2" />
          <div className="grid grid-cols-2">
            <div className="px-2 py-4 text-center">
              <div className="text-[15px] tracking-wide text-gray-600">TOTAL RECEIPTS</div>
              <div className="text-2xl  font-extrabold text-gray-900">{totalReceipts}</div>
            </div>
            <div className="px-2 py-4 text-center border-l">
              <div className="text-[15px] tracking-wide text-gray-600">TOTAL AMOUNT</div>
              <div className="text-2xl font-extrabold text-gray-900">
                <span className="font-semibold">Ksh</span> {totalAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </Card>

        {/* Search */}
          <InputGroup className="rounded-full border-purple-400 shadow-sm">
          <InputGroupAddon>
            <MagnifyingGlassIcon className="w-4 h-4 text-purple-700" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search by receipt number or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </InputGroup>

        {/* Count */}
        <div className="text-xs text-gray-600 font-medium px-1">{filteredRows.length} Receipts</div>

        {/* Loading / Error / List */}
        {status === 'loading' && (
          <div className="py-10 flex items-center justify-center">
            <Spinner className="size-6 text-purple-700" />
          </div>
        )}

        {isLoading && status === 'authenticated' && (
          <div className="py-10 flex items-center justify-center">
            <Spinner className="size-6 text-purple-700" />
          </div>
        )}

        {!isLoading && error && status === 'authenticated' && (
          <Card className="rounded-xl p-4 text-center text-sm text-red-600">{error}</Card>
        )}

        {/* Receipt List Table */}
        {!isLoading && !error && status === 'authenticated' && filteredRows.length > 0 && (
          <Card className="rounded-2xl shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50 text-xl">
                  <TableHead className="font-semibold text-purple-900">#</TableHead>
                  <TableHead className="font-semibold text-purple-900">Receipt Number</TableHead>
                  <TableHead className="font-semibold text-purple-900 hidden sm:table-cell">Vehicle</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-center hidden md:table-cell">
                    Collections
                  </TableHead>
                  <TableHead className="font-semibold text-purple-900 hidden lg:table-cell">Created</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className='text-xl'>
                {filteredRows.map((row, index) => {
                  const slugCount = Object.keys(row.payload?.slugs ?? {}).length;
                  const isOpen = !!expanded[row.id];
                  return (
                    <>
                      <TableRow key={row.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-gray-600">{index + 1}</TableCell>
                        <TableCell className="font-bold text-gray-800">
                          #{row.receipt_number}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                            {row.number_plate}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-bold text-gray-900">
                          Ksh {Number(row.total_amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center text-gray-700 hidden md:table-cell">{slugCount}</TableCell>
                        <TableCell className="text-gray-600 hidden lg:table-cell">
                          {formatDateTime(row.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"                              
                              onClick={() =>
                                setExpanded((prev) => ({ ...prev, [row.id]: !isOpen }))
                              }
                            >
                              {isOpen ? (
                                <ChevronUpIcon className="w-3 h-3 md:mr-1" />
                              ) : (
                                <ChevronDownIcon className="w-3 h-3 md:mr-1" />
                              )}
                              <span className="hidden md:inline">{isOpen ? 'Hide' : 'Details'}</span>
                            </Button>
                            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                              <PrinterIcon className="w-3 h-3 md:mr-1" />
                              <span className="hidden md:inline">Reprint</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isOpen && (
                        <TableRow key={`${row.id}-breakdown`} className="bg-purple-50/50">
                          <TableCell colSpan={7} className="py-3">
                            <div className="pl-8">
                              <p className="text-xs font-semibold text-purple-900 mb-2">
                                Breakdown:
                              </p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                                {Object.entries(row.payload?.slugs ?? {}).map(([label, amount]) => (
                                  <div
                                    key={label}
                                    className="flex items-center justify-between rounded-lg bg-white border border-purple-200 px-3 py-2"
                                  >
                                    <span className="text-sm font-medium text-gray-700">
                                      {label}
                                    </span>
                                    <span className="text-sm font-semibold text-purple-700">
                                      Ksh {Number(amount).toLocaleString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
