'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, Users, Car,  BookOpenCheck } from 'lucide-react';

type Tile = {
  title: string;
  href: string;
  icon: React.ReactNode;
  bgClass: string; // Tailwind background color for the icon circle
};

export default function HomeTiles() {
  const router = useRouter();

  const tiles: Tile[] = [
    {
      title: 'Collection',
      href: '/user/collection',
      icon: <Wallet className="w-6 h-6 text-white" />,
      bgClass: 'bg-purple-700', // project uses purple accents
    },
    {
      title: 'Crew',
      href: '/user/crews',
      icon: <Users className="w-6 h-6 text-white" />,
      bgClass: 'bg-red-600',
    },
    {
      title: 'Assign Vehicle',
      href: '/user/assign',
      icon: <BookOpenCheck className="w-6 h-6 text-white" />,
      bgClass: 'bg-green-600',
    },
    {
      title: 'Vehicle',
      href: '/user/vehicles',
      icon: <Car className="w-6 h-6 text-white" />,
      bgClass: 'bg-yellow-500',
    },
  ];

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
            <CardContent className="p-5 flex flex-col items-center justify-center gap-3">
              <div className={`w-12 h-12 ${t.bgClass} rounded-full flex items-center justify-center shadow-sm`}>
                {t.icon}
              </div>
              <div className="text-center text-gray-800 font-medium tracking-wide">{t.title}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
