"use client";
import { motion } from "framer-motion";
import { IoMdHome } from "react-icons/io";
import { useRouter, usePathname } from "next/navigation";
import { FaChartPie } from "react-icons/fa";

const navItems = [
  { icon: IoMdHome, label: "Home", href: "/user" },
  { icon: FaChartPie, label: "Reports", href: "/user/reports" },
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-screen-md mx-auto md:hidden">
      <div className="flex justify-center items-center py-4 px-8">
        <div className="flex space-x-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`p-3 rounded-full transition-colors ${
                  isActive ? "text-orange-500 bg-orange-50" : "text-purple-500"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}