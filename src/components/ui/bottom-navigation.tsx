'use client';
import { motion } from 'framer-motion';
import { Home, PieChart, Car, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { icon: Home, label: 'Home', href: '/user' },
  { icon: PieChart, label: 'Report', href: '/user/reports' },
  { icon: Car, label: 'Vehicle', href: '/user/vehicles' },
  { icon: User, label: 'Account', href: '/user/account' },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 md:hidden">
      <div className="flex justify-around items-center py-2 px-4 max-w-screen-md mx-auto">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || (item.label === 'Home' && pathname === '/user');
          const Icon = item.icon;

          return (
            <motion.button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all min-w-[60px] ${
                isActive ? 'text-purple-600 bg-purple-50' : 'text-gray-500'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
