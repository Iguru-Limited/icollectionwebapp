"use client";
import { use, useState } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewDetailHeader } from '@/components/crews';
import { useCrew, useCrewHistory } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface CrewProfilePageProps { params: Promise<{ id: string }> }

export default function CrewProfilePage({ params }: CrewProfilePageProps) {
  const { id } = use(params);
  const { crew, isLoading, error } = useCrew(id);
  const [activeSection, setActiveSection] = useState<'bio' | 'actions' | 'history'>('bio');
  const { data: historyData, isLoading: historyLoading } = useCrewHistory(id, activeSection === 'history');

  if (isLoading) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96">
          <Spinner />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96 text-red-600">
          Error loading crew: {error.message}
        </div>
      </PageContainer>
    );
  }

  if (!crew) {
    return (
      <PageContainer>
        <PageHeader title="Crew Profile" backHref="/user/crews" />
        <div className="flex items-center justify-center h-96 text-gray-500">
          Crew member not found
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader title="" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-2xl mx-auto">
        <CrewDetailHeader
          crew={crew}
          active={activeSection}
          onSelect={(key) => {
            if (key === 'bio') {
              window.location.href = `/user/crews/${crew.crew_id}/bio`;
            } else {
              setActiveSection(key);
            }
          }}
        />

        <div className="mt-6">
          {activeSection === 'bio' && (
            <div className="text-center text-gray-500 py-10">
              Click Bio data button to view full details
            </div>
          )}
          {activeSection === 'actions' && (
            <div className="text-center text-gray-500 py-10">
              Actions will appear here
            </div>
          )}
          {activeSection === 'history' && (
            <Card className="overflow-x-auto">
              {historyLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Spinner />
                </div>
              ) : (
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
                    {(historyData?.data ?? []).map((row, idx) => (
                      <TableRow key={row.history_id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{row.number_plate}</TableCell>
                        <TableCell className="text-sm">{row.assigned_at}</TableCell>
                        <TableCell className="text-sm">{row.unassigned_at ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                    {(!historyData || historyData.data.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                          No history found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}
        </div>
      </main>
    </PageContainer>
  );
}
