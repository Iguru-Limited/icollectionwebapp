'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import {
  WalletIcon,
  UsersIcon,
  TruckIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

type Tile = {
  title: string;
  href: string;
  icon: React.ReactNode;
  bgClass: string;
  rightName: string; // Maps to right_name from API
};

export default function HomeTiles() {
  const router = useRouter();
  const { data: session } = useSession();

  const totalCrew = session?.stats?.crew?.total_crew;
  const totalVehicles = session?.stats?.vehicles?.total_vehicles;
  const assignedVehicles = session?.stats?.vehicles?.assignment?.assigned;
  const unassignedVehicles = session?.stats?.vehicles?.assignment?.unassigned;

  const allTiles: Tile[] = [
    {
      title: 'Collection',
      href: '/user/collection?clear=1',
      icon: <WalletIcon className="w-6 h-6 text-white" />,
      bgClass: 'bg-purple-700',
      rightName: 'collection',
    },
    {
      title: 'Crew',
      href: '/user/crews',
      icon: <UsersIcon className="w-6 h-6 text-white" />,
      bgClass: 'bg-red-600',
      rightName: 'assign_crew', // Uses assign_crew right since it manages crew assignments
    },
    {
      title: 'Quick Assign',
      href: '/user/assign',
      icon: <BoltIcon className="w-6 h-6 text-white" />,
      bgClass: 'bg-green-600',
      rightName: 'assign_crew', // Same right - can assign vehicles to crew
    },
    {
      title: 'Vehicle',
      href: '/user/vehicles',
      icon: <TruckIcon className="w-6 h-6 text-white" />,
      bgClass: 'bg-yellow-500',
      rightName: 'view_vehicles',
    },
  ];

  // Filter tiles based on user rights
  const tiles = allTiles.filter((tile) => {
    const userRights = session?.user?.rights;
    // If no rights array exists, show all tiles (backward compatibility)
    if (!userRights || userRights.length === 0) return true;
    // Check if the user has the required right_name
    return userRights.some((right) => right.right_name === tile.rightName);
  });

  return (
    <section className="space-y-6"> 
      {/* Quick Actions tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {tiles.map((t) => (
          <Card
            key={t.title}
            role="button"
            tabIndex={0}
            onClick={() => router.push(t.href)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                router.push(t.href);
              }
            }}
            className="cursor-pointer transition-shadow hover:shadow-md rounded-2xl border-gray-200"
          >
            <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
              <div className={`w-12 h-12 ${t.bgClass} rounded-full flex items-center justify-center shadow-sm`}>
                {t.icon}
              </div>
              <div className="text-center text-gray-800 font-medium tracking-wide">{t.title}</div>
              {t.title === 'Crew' && typeof totalCrew === 'number' && (
                <div className="text-xl font-semibold text-gray-900">{totalCrew}</div>
              )}
              {t.title === 'Vehicle' && typeof totalVehicles === 'number' && (
                <div className="text-xl font-semibold text-gray-900">{totalVehicles}</div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {/* Assignment Status Cards */}
        <Card
          role="button"
          tabIndex={0}
          onClick={() => router.push('/user/assigned')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push('/user/assigned');
            }
          }}
          className="cursor-pointer transition-shadow hover:shadow-md rounded-2xl border-gray-200"
        >
          <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center text-gray-800 font-medium tracking-wide">Assigned</div>
            {typeof assignedVehicles === 'number' && (
              <div className="text-xl font-semibold text-gray-900">{assignedVehicles}</div>
            )}
          </CardContent>
        </Card>

        <Card
          role="button"
          tabIndex={0}
          onClick={() => router.push('/user/unassigned')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              router.push('/user/unassigned');
            }
          }}
          className="cursor-pointer transition-shadow hover:shadow-md rounded-2xl border-gray-200"
        >
          <CardContent className="p-5 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-center text-gray-800 font-medium tracking-wide">Pending</div>
            {typeof unassignedVehicles === 'number' && (
              <div className="text-xl font-semibold text-gray-900">{unassignedVehicles}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
