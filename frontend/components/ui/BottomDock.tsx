"use client";

import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Database, CreditCard, User, LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";

const NAV_ITEMS = [
  { name: "Home", path: "/", icon: Home },
  { name: "Archive", path: "/records", icon: Database },
  { name: "Plans", path: "/pricing", icon: CreditCard },
];

export const BottomDock = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  const handleProfileClick = () => {
    if (user) {
      router.push("/profile");
    } else {
      router.push("/auth");
    }
  };

  // Hide the dock on the auth page to keep the split-screen clean
  if (pathname === "/auth") {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: "spring", damping: 20, stiffness: 200 }}
      className="fixed bottom-8 right-8 z-[100]"
    >
      <div className="relative flex items-center gap-1 p-1.5 bg-[#0C0A09]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
        {/* Noise Texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Nav Items */}
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item.path)}
              className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer group ${
                isActive ? "text-white" : "text-white/25 hover:text-white/60"
              }`}
              aria-label={`Navigate to ${item.name}`}
            >
              {isActive && (
                <motion.div
                  layoutId="dock-active-bg"
                  className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <item.icon
                className={`w-3.5 h-3.5 relative z-10 transition-all duration-300 group-hover:scale-110 ${
                  isActive ? "text-accent" : ""
                }`}
              />
              <span className="text-[8px] uppercase tracking-[0.25em] font-black font-mono whitespace-nowrap relative z-10">
                {item.name}
              </span>
            </button>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-6 bg-white/5 mx-1" />

        {/* Profile / Login Button */}
        <button
          onClick={handleProfileClick}
          className={`relative flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 cursor-pointer group ${
            pathname === "/profile" || pathname === "/auth"
              ? "text-white"
              : "text-white/25 hover:text-white/60"
          }`}
          aria-label={user ? "Go to profile" : "Log in"}
        >
          {(pathname === "/profile" || pathname === "/auth") && (
            <motion.div
              layoutId="dock-active-bg"
              className="absolute inset-0 bg-accent/10 border border-accent/20 rounded-xl"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          {user ? (
            <>
              <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 relative z-10">
                <User className="w-2.5 h-2.5 text-accent" />
              </div>
              <span className="text-[8px] uppercase tracking-[0.25em] font-black font-mono whitespace-nowrap relative z-10">
                Profile
              </span>
            </>
          ) : (
            <>
              <LogIn
                className={`w-3.5 h-3.5 relative z-10 transition-all duration-300 group-hover:scale-110`}
              />
              <span className="text-[8px] uppercase tracking-[0.25em] font-black font-mono whitespace-nowrap relative z-10">
                Login
              </span>
            </>
          )}
        </button>

        {/* Agentic Mode Indicator */}
        <div className="w-[1px] h-6 bg-white/5 mx-1" />
        <div className="flex items-center gap-3 px-3 py-1">
          <div className="relative">
            <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_10px_rgba(202,138,4,0.8)] animate-pulse" />
            <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-accent animate-ping opacity-20" />
          </div>
          <span className="text-[7px] uppercase tracking-[0.4em] font-black font-mono text-accent/40">
            Active
          </span>
        </div>
      </div>

      {/* Ambient Glow */}
      <div className="absolute -inset-4 bg-accent/5 blur-2xl -z-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};
