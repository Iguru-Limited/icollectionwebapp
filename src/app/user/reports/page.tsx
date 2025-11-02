'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Receipt as ReceiptIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { TopNavigation } from '@/components/ui/top-navigation';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
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
      {/* Top navigation - hidden on small screens */}
      <div className="hidden md:block">
        <TopNavigation />
      </div>

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

          {/* Desktop Table View */}
          <Card className="hidden md:block rounded-2xl shadow-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-purple-50 hover:bg-purple-50">
                  <TableHead className="font-semibold text-purple-900 text-xl">#</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl">
                    Receipt Number
                  </TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl">Details</TableHead>
                  <TableHead className="font-semibold text-purple-900 text-xl">Date</TableHead>
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
                      <div className="w-10 h-10 rounded-full  flex items-center justify-center  font-semibold text-xl">
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-gray-800 text-2xl">
                      {receipt.receiptNumber}
                    </TableCell>
                    <TableCell className="text-gray-600 text-xl">{receipt.details}</TableCell>
                    <TableCell className="text-xl text-gray-600">{receipt.date}</TableCell>
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
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-xl">
                          <ReceiptIcon className="w-4 h-4 mr-1" />
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
                  {receipt.status === 'view details' ? 'View Details' : 'View'}
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold"
                >
                  <ReceiptIcon className="w-3 h-3 mr-1" />
                  {receipt.status === 'view receipt' ? 'View Receipt' : 'Receipt'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <div className="md:hidden">
        <BottomNavigation />
      </div>
    </motion.div>
  );
}
