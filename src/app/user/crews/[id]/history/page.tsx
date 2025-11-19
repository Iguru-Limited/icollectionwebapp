"use client";
import { use } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { useCrew } from '@/hooks/crew';
import { useCrewHistory } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CrewHistoryPageProps { params: Promise<{ id: string }> }

export default function CrewHistoryPage({ params }: CrewHistoryPageProps) {
  const { id } = use(params);
  const { crew } = useCrew(id);
  const { data, isLoading, error } = useCrewHistory(id);

  return (
    <PageContainer>
      <PageHeader title="History" backHref={`/user/crews/${id}`} />
      <main className="px-4 pb-24 max-w-3xl mx-auto">
        {isLoading && (
          <div className="flex items-center justify-center h-64">
            <Spinner />
          </div>
        )}

        {error && (
          <Card className="p-6 text-red-600">{error.message}</Card>
        )}

        {!isLoading && !error && (
          <Card className="overflow-x-auto">
            <div className="p-4 text-sm text-gray-600">
              {crew && (
                <div>
                  <span className="font-medium">Crew:</span> {crew.name} ({crew.role_name})
                </div>
              )}
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">#</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Assigned At</TableHead>
                  <TableHead>Unassigned At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(data?.data ?? []).map((row, idx) => (
                  <TableRow key={row.history_id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{row.number_plate}</TableCell>
                    <TableCell>{row.assigned_at}</TableCell>
                    <TableCell>{row.unassigned_at ?? '-'}</TableCell>
                  </TableRow>
                ))}
                {(!data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      No history found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        )}
      </main>
    </PageContainer>
  );
}
