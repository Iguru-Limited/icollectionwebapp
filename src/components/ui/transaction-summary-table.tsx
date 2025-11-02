import * as React from 'react';
import { Card } from './card';

export interface TransactionSummaryTableProps {
  data: Array<{ label: string; value: string | number }>;
  title?: string;
}

export function TransactionSummaryTable({ data, title }: TransactionSummaryTableProps) {
  return (
    <Card className="rounded-2xl shadow-md p-6">
      {title && <h2 className="text-2xl font-bold text-purple-700 mb-4">{title}</h2>}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-xl border text-xl">
          <thead>
            <tr className="bg-purple-50 text-black">
              <th className="py-3 px-4 text-left font-semibold">Metric</th>
              <th className="py-3 px-4 text-left font-semibold">Value</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.label}
                className={
                  idx === data.length - 1
                    ? 'bg-purple-100 text-black-800 font-bold text-2xl'
                    : 'border-b hover:bg-black-50 text-black-700'
                }
              >
                <td className="py-3 px-4 font-medium">{row.label}</td>
                <td className="py-3 px-4">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
