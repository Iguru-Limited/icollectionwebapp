"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { useRouter } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo } from 'react';
import { Spinner } from '@/components/ui/spinner';
import type { Crew } from '@/types/crew';

export default function PendingConductorsPage() {
  const router = useRouter();
  const { data: crewsData, isLoading } = useCrews();

  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);

  // Filter unassigned crews (crews without a vehicle)
  const unassignedCrews = useMemo(() => {
    return crews.filter((c: Crew) => !c.vehicle_id);
  }, [crews]);

  const unassignedConductors = useMemo(() => {
    return unassignedCrews.filter((c: Crew) => c.crew_role_id === '12' || c.role_name?.toUpperCase() === 'CONDUCTOR');
  }, [unassignedCrews]);

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'C';
  };

  const getBadgeExpiryDisplay = (badgeExpiry: string | null) => {
    if (!badgeExpiry) return { text: '-', className: '' };
    
    const expiryDate = new Date(badgeExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const daysAgo = Math.abs(diffDays);
      return {
        text: `Expired ${daysAgo}d ago`,
        className: 'text-red-600 font-semibold'
      };
    } else if (diffDays === 0) {
      return {
        text: 'Expires today',
        className: 'text-red-600 font-semibold'
      };
    } else {
      return {
        text: `${diffDays}d left`,
        className: ''
      };
    }
  };

  return (
    <PageContainer>
      <PageHeader title="Pending Conductors" backHref="/user/unassigned" />
      <main className="px-4 pb-24 max-w-4xl mx-auto">
        {isLoading && (
          <div className="flex justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        )}

        {!isLoading && (
          <div className="rounded-lg border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Avatar</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Badge No.</TableHead>
                  <TableHead>Badge Expiry</TableHead>
                  <TableHead className="w-[100px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unassignedConductors.map((conductor) => (
                  <TableRow
                    key={conductor.crew_id}
                    className="cursor-pointer hover:bg-gray-50"
                    onClick={() => router.push(`/user/crews/${conductor.crew_id}`)}
                  >
                    <TableCell>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                          {getInitials(conductor.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{conductor.name}</TableCell>
                    <TableCell>{conductor.role_name ? conductor.role_name.charAt(0) + conductor.role_name.slice(1).toLowerCase() : '-'}</TableCell>
                    <TableCell className="font-mono text-sm">{conductor.badge_number || '-'}</TableCell>
                    <TableCell className="text-sm">
                      <span className={getBadgeExpiryDisplay(conductor.badge_expiry).className}>
                        {getBadgeExpiryDisplay(conductor.badge_expiry).text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        className="bg-purple-700 hover:bg-purple-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/user/crews/${conductor.crew_id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {unassignedConductors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No pending conductors found
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
