"use client";
import { motion } from "framer-motion";
import { Home, PieChart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/user" },
    { icon: PieChart, label: "Reports", href: "/user/reports" },
  ];

  return (
    <div className="hidden lg:block sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-200">
      <div className="max-w-screen-md lg:max-w-screen-lg xl:max-w-screen-xl mx-auto">
        <div className="flex justify-center items-center py-3 px-6">
          <div className="flex space-x-6">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`p-3 rounded-full transition-colors ${
                    isActive ? "text-orange-500 bg-orange-50" : "text-gray-400"
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
    </div>
  );
}
