'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import {
  WalletIcon,
  UsersIcon,
  TruckIcon,
  BookOpenIcon,
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

  const allTiles: Tile[] = [
    {
      title: 'Collection',
      href: '/user/collection',
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
      title: 'Assign Vehicle',
      href: '/user/assign',
      icon: <BookOpenIcon className="w-6 h-6 text-white" />,
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
    <section>
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
      </div>
    </section>
  );
}
