'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { EyeIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransactionSummaryTable } from '@/components/ui/transaction-summary-table';
import { DateSelector } from '@/components/ui/date-selector';

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
    receiptNumber: 'RCE181',
    date: '2024-10-31',
    details: 'Morning Collection',
    status: 'view details',
    amount: 15200,
  },
  {
    id: 2,
    receiptNumber: 'RCE142',
    date: '2024-10-31',
    details: 'Evening Collection',
    status: 'view receipt',
    amount: 18500,
  },
  {
    id: 3,
    receiptNumber: 'RCE145',
    date: '2024-10-31',
    details: 'Afternoon Collection',
    status: 'view',
    amount: 9800,
  },
  {
    id: 4,
    receiptNumber: 'RCE146',
    date: '2024-10-31',
    details: 'Special Route',
    status: 'view',
    amount: 5373,
  },
  {
    id: 5,
    receiptNumber: 'RCE147',
    date: '2024-10-31',
    details: 'Late Collection',
    status: 'pending',
    amount: 0,
  },
];

export default function Reports() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-4 pb-20 md:pb-6 space-y-4 max-w-screen-xl">
        {/* Date Navigation */}
        <DateSelector selectedDate={selectedDate} onDateChange={setSelectedDate} />

        {/* Summary Card */}
        <TransactionSummaryTable
          title="Daily Summary"
          data={[
            { label: 'Receipts', value: demoSummary.Receipts },
            { label: 'Vehicles', value: demoSummary.Vehicles },
            { label: 'Operations', value: `Ksh ${demoSummary.Operations.toLocaleString()}` },
            { label: 'Loans', value: `Ksh ${demoSummary.Loans.toLocaleString()}` },
            { label: 'Total', value: `Ksh ${demoSummary.Total.toLocaleString()}` },
          ]}
        />

        {/* Receipts List */}
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-gray-700 px-2">Recent Receipts</h3>

          {/* Receipts Table */}
          <Card className="rounded-2xl shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="font-semibold text-purple-900 text-xl">#</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl">
                    Receipt Number
                  </TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl hidden sm:table-cell">Details</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl hidden md:table-cell">Date</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right text-xl">
                    Amount
                  </TableHead>
                  <TableHead className="font-semibold text-purple-900 text-right text-xl">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoReceipts.map((receipt, index) => (
                  <TableRow key={receipt.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-gray-600">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-xl">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-800 text-2xl">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xl hidden sm:table-cell">{receipt.details}</TableCell>
                    <TableCell className="text-xl text-gray-600 hidden md:table-cell">{receipt.date}</TableCell>
                    <TableCell className="text-right font-bold text-black text-2xl">
                      {receipt.amount > 0 ? `Ksh ${receipt.amount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xl"
                        >
                          <EyeIcon className="w-4 h-4 md:mr-1" />
                          <span className="hidden md:inline">View</span>
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xl">
                          <ReceiptPercentIcon className="w-4 h-4 md:mr-1" />
                          <span className="hidden md:inline">Receipt</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
