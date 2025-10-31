"use client";
import { motion } from "framer-motion";
import { Home, PieChart, Car, User, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function TopNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Home", href: "/user" },
    { icon: PieChart, label: "Report", href: "/user/reports" },
    { icon: Car, label: "Vehicle", href: "/user/vehicles" },
    { icon: User, label: "Account", href: "/user" },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center py-3 px-4 md:px-6">
          <div className="flex justify-around items-center flex-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.label === "Home" && pathname === "/user");
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px] md:min-w-[80px] ${
                    isActive 
                      ? "text-purple-600 bg-purple-50" 
                      : "text-gray-500 hover:text-purple-600 hover:bg-purple-50"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="text-xs md:text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
          
          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all text-red-600 hover:text-red-700 hover:bg-red-50 ml-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut className="w-5 h-5 md:w-6 md:h-6" />
            <span className="text-xs md:text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
