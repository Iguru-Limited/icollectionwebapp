"use client";
import { PageContainer, PageHeader } from '@/components/layout';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCrews } from '@/hooks/crew/useCrews';
import { useMemo, useState } from 'react';
import { MagnifyingGlassIcon, UserIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CrewAssignedListPage() {
  const { data: crewsData, isLoading, error } = useCrews();
  const [searchQuery, setSearchQuery] = useState('');
  const crews = useMemo(() => crewsData?.data || [], [crewsData?.data]);
  const assignedCrews = useMemo(() => crews.filter(c => c.vehicle_id), [crews]);

  // Filter by search
  const filteredCrews = useMemo(() => {
    if (!searchQuery.trim()) return assignedCrews;
    const q = searchQuery.toLowerCase();
    return assignedCrews.filter(c =>
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.employee_no?.toLowerCase().includes(q)
    );
  }, [assignedCrews, searchQuery]);

  // Stats
  const totalCount = assignedCrews.length;
  const activeCount = assignedCrews.filter(c => c.active === '1').length;
  const inactiveCount = assignedCrews.filter(c => c.active !== '1').length;

  const getBadgeExpiryStatus = (badgeExpiry: string | null) => {
    if (!badgeExpiry) return null;
    const expiryDate = new Date(badgeExpiry);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `Badge: ${Math.abs(diffDays)}d expired`, color: 'bg-red-100 text-red-700', icon: 'error' };
    } else if (diffDays <= 30) {
      return { text: `Badge: ${diffDays}d to expiry (${expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`, color: 'bg-red-100 text-red-700', icon: 'warning' };
    }
    return { text: `Badge: ${diffDays}d to expiry (${expiryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})`, color: 'bg-green-100 text-green-700', icon: 'success' };
  };

  return (
    <PageContainer>
      <PageHeader title="" backHref="/user/crews" />
      <main className="px-4 pb-24 max-w-md mx-auto">
        {/* Header */}
        <div className="bg-purple-50 rounded-2xl p-4 mb-4 flex items-start gap-3">
          <div className="bg-purple-600 rounded-full p-2.5 mt-1">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">Assigned Crew</h2>
            <p className="text-sm text-gray-600">{activeCount} active • {totalCount} total</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, or employee no..."
            className="pl-10 h-12 rounded-xl border-purple-200 focus:border-purple-400"
          />
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-gray-600" />
              <div>
                <div className="text-xl font-bold text-gray-900">{totalCount}</div>
                <div className="text-[10px] text-gray-500">Total</div>
              </div>
            </div>
          </Card>
          <Card className="p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-xl font-bold text-gray-900">{activeCount}</div>
                <div className="text-[10px] text-gray-500">Active</div>
              </div>
            </div>
          </Card>
          <Card className="p-3 rounded-xl">
            <div className="flex items-center gap-2">
              <XCircleIcon className="w-5 h-5 text-red-600" />
              <div>
                <div className="text-xl font-bold text-gray-900">{inactiveCount}</div>
                <div className="text-[10px] text-gray-500">Inactive</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Crew Count Label */}
        <div className="text-xs font-semibold text-gray-500 uppercase mb-3">
          {filteredCrews.length} CREW MEMBERS
        </div>

        {isLoading && (
          <div className="flex justify-center py-12"><Spinner className="w-6 h-6" /></div>
        )}
        {error && (
          <div className="text-center text-red-600 py-6">Failed to load crews</div>
        )}
        {!isLoading && !error && (
          <div className="space-y-3">
            {filteredCrews.map(crew => {
              const initials = crew.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'C';
              const badgeStatus = getBadgeExpiryStatus(crew.badge_expiry);
              const isActive = crew.active === '1';
              const isSuspended = crew.active === '0';
              const completionPercentage = crew.profile_completion_percentage ? parseInt(crew.profile_completion_percentage) : 0;

              return (
                <Card key={crew.crew_id} className="p-4 rounded-2xl bg-white shadow-sm">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 bg-red-600">
                        <AvatarFallback className="bg-red-600 text-white font-bold text-sm">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      {isActive && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 rounded-full w-4 h-4 border-2 border-white" />
                      )}
                      {/* Profile Completion Percentage */}
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 translate-y-full mt-0.5 text-[9px] font-bold text-gray-700 whitespace-nowrap">
                        {completionPercentage}%
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{crew.name}</h3>
                          <Badge className="mt-1 text-[10px] px-2 py-0.5 bg-purple-600 text-white hover:bg-purple-700">
                            {crew.role_name}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span>{crew.phone || '-'}</span>
                      </div>

                      {/* Vehicle Assignment */}
                      {crew.vehicle_plate ? (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>{crew.vehicle_plate}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-lg text-xs font-medium">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>No Vehicle Assigned</span>
                          </div>
                        </div>
                      )}

                      {/* Badge Expiry */}
                      {badgeStatus && (
                        <div className={`mt-2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${badgeStatus.color}`}>
                          {badgeStatus.icon === 'warning' && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          )}
                          {badgeStatus.icon === 'success' && (
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                          <span className="text-[10px]">{badgeStatus.text}</span>
                        </div>
                      )}

                      {/* Suspended Badge */}
                      {isSuspended && (
                        <Badge className="mt-2 text-[10px] px-2 py-0.5 bg-red-100 text-red-700 hover:bg-red-100">
                          Suspended
                        </Badge>
                      )}
                      {!isActive && !isSuspended && (
                        <Badge className="mt-2 text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 hover:bg-gray-100">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    {/* Manage Button */}
                    <Link href={`/user/crews/${crew.crew_id}`}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium">
                        <svg className="w-3.5 h-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Manage
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
            {filteredCrews.length === 0 && (
              <div className="text-center text-gray-500 py-12">No assigned crew found</div>
            )}
          </div>
        )}
      </main>
    </PageContainer>
  );
}
