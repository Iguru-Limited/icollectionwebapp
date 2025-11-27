"use client";
import { use, useState } from 'react';
import { PageContainer, PageHeader } from '@/components/layout';
import { CrewDetailHeader, CrewBioData } from '@/components/crews';
import { useCrew, useCrewHistory } from '@/hooks/crew';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AssignVehicleDialog } from '@/components/assign/AssignVehicleDialog';
import { AssignmentConflictDialog } from '@/components/assign/AssignmentConflictDialog';
import { useCompanyTemplateStore } from '@/store/companyTemplateStore';
import { useAssignVehicle } from '@/hooks/crew/useAssignVehicle';
import { useConfirmAssignment, useCancelAssignment } from '@/hooks/crew/useConfirmAssignment';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface CrewProfilePageProps { params: Promise<{ id: string }> }

export default function CrewProfilePage({ params }: CrewProfilePageProps) {
  const { id } = use(params);
  const { crew, isLoading, error } = useCrew(id);
  const [activeSection, setActiveSection] = useState<'bio' | 'actions' | 'history'>('bio');
  const { data: historyData, isLoading: historyLoading, refetch: refetchHistory } = useCrewHistory(id, activeSection === 'history');
  
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const template = useCompanyTemplateStore((s) => s.template);
  const vehicles = template?.vehicles || [];
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [conflictDialog, setConflictDialog] = useState<{
    open: boolean;
    error: string;
    message: string;
    pendingIds: string[];
  }>({ open: false, error: '', message: '', pendingIds: [] });

  const confirmMutation = useConfirmAssignment({
    onSuccess: (data) => {
      toast?.success?.(data.message || 'Vehicle crew has been successfully reassigned');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
      setAssignDialogOpen(false);
      const companyId = session?.user?.company?.company_id;
      queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
    },
    onError: (error) => {
      toast?.error?.(error.message || 'Failed to confirm assignment');
    },
  });

  const cancelMutation = useCancelAssignment({
    onSuccess: (data) => {
      toast?.success?.(data.message || 'Pending assignment request(s) cancelled successfully');
      setConflictDialog({ open: false, error: '', message: '', pendingIds: [] });
    },
    onError: (error) => {
      toast?.error?.(error.message || 'Failed to cancel assignment');
    },
  });

  const { mutate: assignVehicle, isPending: assignPending } = useAssignVehicle({
    onSuccess: (data) => {
      if (data.pending_assignment_ids && data.pending_assignment_ids.length > 0) {
        setConflictDialog({
          open: true,
          error: data.error || '',
          message: data.message || '',
          pendingIds: data.pending_assignment_ids,
        });
      } else {
        toast?.success?.('Vehicle assigned successfully');
        setAssignDialogOpen(false);
        const companyId = session?.user?.company?.company_id;
        queryClient.invalidateQueries({ queryKey: ['crews', companyId] });
      }
    },
    onError: (err) => {
      toast?.error?.(err.message || 'Failed to assign vehicle');
    },
  });

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
      <PageHeader 
        title="" 
        backHref="/user/crews"
      />
      <main className="pb-24">
        <CrewDetailHeader
          crew={crew}
          active={activeSection}
          onSelect={(key) => {
            // Show sections inline on this page
            setActiveSection(key);
            if (key === 'history') {
              // Force a fresh fetch every click, even if already active
              refetchHistory();
            }
          }}
        />

        <div className="mt-6 px-4 max-w-2xl mx-auto">
          {activeSection === 'bio' && <CrewBioData crew={crew} />}
          {activeSection === 'actions' && (
            <div className="space-y-3">
              <Card className="p-4">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start"
                  onClick={() => setAssignDialogOpen(true)}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                  Assign Vehicle
                </Button>
              </Card>

              <Card className="p-4">
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white justify-start"
                  onClick={() => {/* TODO: Implement report incident */}}
                  disabled
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="flex-1 text-left">Report Incident</span>
                  <span className="text-xs opacity-75">Dev in progress</span>
                </Button>
              </Card>

              <Card className="p-4">
                <Button 
                  className="w-full bg-red-600 hover:bg-red-700 text-white justify-start"
                  onClick={() => {/* TODO: Implement add fine */}}
                  disabled
                >
                  <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="flex-1 text-left">Add Fine</span>
                  <span className="text-xs opacity-75">Dev in progress</span>
                </Button>
              </Card>
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

      <AssignVehicleDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        crew={crew}
        vehicles={vehicles}
        selectedVehicleId={selectedVehicleId}
        onVehicleChange={setSelectedVehicleId}
        loading={assignPending}
        onConfirm={() => {
          if (!crew || !selectedVehicleId) return;
          assignVehicle({
            vehicle_id: Number(selectedVehicleId),
            crew_id: Number(crew.crew_id),
          });
        }}
      />

      <AssignmentConflictDialog
        open={conflictDialog.open}
        errorMessage={conflictDialog.error}
        message={conflictDialog.message}
        onConfirm={() => {
          const pendingIds = conflictDialog.pendingIds.map(id => Number(id));
          confirmMutation.mutate({ assignment_ids: pendingIds });
        }}
        onCancel={() => {
          const pendingIds = conflictDialog.pendingIds.map(id => Number(id));
          cancelMutation.mutate({ assignment_ids: pendingIds });
        }}
        isLoading={confirmMutation.isPending || cancelMutation.isPending}
      />
    </PageContainer>
  );
}
