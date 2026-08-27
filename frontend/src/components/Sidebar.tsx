"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  SquareTerminal, 
  ChefHat, 
  BarChart3,
  ListOrdered,
  BookOpen,
  Settings,
  Sparkles,
  Receipt,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

const mainNavItems = [
  { name: "POS Terminal", href: "/pos", icon: SquareTerminal, badge: "Live" },
  { name: "Kitchen Display", href: "/kitchen", icon: ChefHat, badge: "KDS" },
  { name: "Sales & Analytics", href: "/sales", icon: BarChart3 },
  { name: "Order History", href: "/orders", icon: ListOrdered },
  { name: "Invoice Generator", href: "/invoice", icon: Receipt },
];

const managementNavItems = [
  { name: "Menu Catalog", href: "/menu", icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { settings } = useStore();

  return (
    <aside 
      className={cn(
        "print:hidden h-screen flex flex-col bg-[#08080c]/90 backdrop-blur-2xl border-r border-white/[0.08] transition-all duration-300 z-50 select-none relative",
        isExpanded ? "w-[240px]" : "w-[80px]"
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />

      {/* Logo Area */}
      <div className="h-24 flex items-center px-[18px] border-b border-white/[0.06] relative">
        <Link href="/pos" className="flex items-center gap-3 overflow-hidden whitespace-nowrap group">
          <div className="relative flex-shrink-0 w-11 h-11 rounded-full overflow-hidden shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform duration-300 border border-amber-300/20 bg-[#Fdf6ed]">
            <img 
              src="/logo.jpeg" 
              alt="Waffle Circle Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col overflow-hidden"
              >
                <span className="text-white font-bold text-[15px] tracking-wider leading-tight text-gold-gradient whitespace-nowrap overflow-hidden text-ellipsis max-w-[130px]">
                  {settings.storeName.toUpperCase()}
                </span>
                <span className="text-[10px] text-amber-500/80 font-semibold tracking-widest uppercase flex items-center gap-1 whitespace-nowrap">
                  <Sparkles className="w-2.5 h-2.5 inline flex-shrink-0" /> Operational OS
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 flex flex-col gap-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        
        {/* Main Section */}
        <div className="flex flex-col gap-1.5 px-4">
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3.5 mb-1 whitespace-nowrap">
                  Core Operations
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 shadow-sm shadow-amber-500/5" 
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon 
                  className={cn(
                    "w-[20px] h-[20px] flex-shrink-0 transition-all duration-200",
                    isActive ? "text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(230,180,98,0.5)]" : "text-muted-foreground group-hover:text-white group-hover:scale-105"
                  )} 
                />
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className={cn("text-[14px] whitespace-nowrap overflow-hidden transition-colors", isActive ? "text-amber-300 font-semibold" : "text-slate-300 group-hover:text-white")}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge if available */}
                <AnimatePresence>
                  {isExpanded && item.badge && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="ml-auto overflow-hidden"
                    >
                      <span className="text-[10px] font-extrabold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider whitespace-nowrap flex">
                        {item.badge}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Active Indicator Glow Strip */}
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-7 bg-amber-400 rounded-r-full shadow-[0_0_12px_rgba(230,180,98,0.8)]" 
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Management Section */}
        <div className="flex flex-col gap-1.5 px-4">
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="overflow-hidden"
              >
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3.5 mb-1 whitespace-nowrap">
                  Catalog & Inventory
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          {managementNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20 shadow-sm shadow-amber-500/5" 
                    : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
                )}
              >
                <Icon 
                  className={cn(
                    "w-[20px] h-[20px] flex-shrink-0 transition-all duration-200",
                    isActive ? "text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(230,180,98,0.5)]" : "text-muted-foreground group-hover:text-white group-hover:scale-105"
                  )} 
                />
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className={cn("text-[14px] whitespace-nowrap overflow-hidden transition-colors", isActive ? "text-amber-300 font-semibold" : "text-slate-300 group-hover:text-white")}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                
                {isActive && (
                  <motion.div 
                    layoutId="activeNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-7 bg-amber-400 rounded-r-full shadow-[0_0_12px_rgba(230,180,98,0.8)]" 
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Settings & Status */}
      <div className="flex flex-col border-t border-white/[0.06] p-4 bg-[#050508]/60">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative",
            pathname === "/settings" 
              ? "bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20" 
              : "text-muted-foreground hover:text-white hover:bg-white/[0.04]"
          )}
        >
          <Settings className={cn("w-[20px] h-[20px] flex-shrink-0 transition-transform duration-300 group-hover:rotate-45", pathname === "/settings" ? "text-amber-400" : "text-muted-foreground group-hover:text-white")} />
          <AnimatePresence>
            {isExpanded && (
              <motion.span 
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className={cn("text-[14px] whitespace-nowrap overflow-hidden", pathname === "/settings" ? "text-amber-300 font-semibold" : "text-slate-300 group-hover:text-white")}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
          {pathname === "/settings" && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3.5px] h-7 bg-amber-400 rounded-r-full shadow-[0_0_12px_rgba(230,180,98,0.8)]" />
          )}
        </Link>
        
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 12 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                <div className="relative flex h-2.5 w-2.5 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                </div>
                <div className="flex flex-col min-w-0 whitespace-nowrap">
                  <span className="text-[12px] text-white font-semibold truncate">Counter 01</span>
                  <span className="text-[10px] text-slate-400 font-mono tracking-tight">Syncing • Online</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </aside>
  );
}

