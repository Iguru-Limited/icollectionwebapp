"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function PendingDriversPage() {
  const router = useRouter();
  const { data: crewsData, isLoading } = useCrews();

  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Filter unassigned crews (crews without a vehicle)
  const unassignedCrews = useMemo(() => {
    return crews.filter(c => !c.vehicle_id);
  }, [crews]);

  const unassignedDrivers = useMemo(() => {
    return unassignedCrews.filter(c => c.crew_role_id === '3' || c.role_name?.toUpperCase() === 'DRIVER');
  }, [unassignedCrews]);

  return (
    <PageContainer>
      <PageHeader title="Pending Drivers" backHref="/user/unassigned" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Badge No.</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedDrivers.map((driver) => (
                  <TableRow key={driver.crew_id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>
                      <Avatar className="w-10 h-10 bg-purple-100 text-purple-700 font-semibold">
                        {driver.name.charAt(0).toUpperCase()}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{driver.name}</TableCell>
                    <TableCell className="text-sm font-mono">{driver.badge_number || '-'}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-purple-700 hover:bg-purple-800"
                        onClick={() => router.push(`/user/crews/${driver.crew_id}`)}
                      >
                        Assign
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {unassignedDrivers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                      No pending drivers found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </PageContainer>
  );
}
