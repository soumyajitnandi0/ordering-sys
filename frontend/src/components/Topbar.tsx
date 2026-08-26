"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, User, Clock, ShieldCheck, LogOut } from "lucide-react";
import { useStore } from "@/store/useStore";

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useStore((state) => state.logout);
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getPageTitle = () => {
    switch (pathname) {
      case "/pos": return { title: "POS Terminal", subtitle: "Register Counter 01" };
      case "/kitchen": return { title: "Kitchen Display (KDS)", subtitle: "Live Preparation Monitor" };
      case "/sales": return { title: "Sales & Analytics", subtitle: "Real-time Operations Intelligence" };
      case "/orders": return { title: "Order History", subtitle: "Audit & Fulfillment Logs" };
      case "/menu": return { title: "Menu Catalog", subtitle: "Item Availability & Pricing" };
      case "/settings": return { title: "System Settings", subtitle: "Store Configuration & Devices" };
      default: return { title: "Dashboard", subtitle: "Waffle Circle OS" };
    }
  };

  const page = getPageTitle();

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/[0.08] bg-[#070709]/80 backdrop-blur-xl z-40 sticky top-0">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-amber-500 tracking-widest uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Store #01
          </span>
          <span className="text-[12px] text-muted-foreground">•</span>
          <span className="text-[12px] text-slate-400 font-medium">{page.subtitle}</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">{page.title}</h1>
      </div>

      {/* Right Action Icons & Profile */}
      <div className="flex items-center gap-5">
        {/* Live Clock Widget */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <Clock className="w-4 h-4 text-amber-400" />
          <div className="flex flex-col text-right">
            <span className="text-[13px] font-mono font-bold text-white tracking-wider leading-none">
              {time || "12:00:00 AM"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium mt-0.5">
              {date || "Today"}
            </span>
          </div>
        </div>

        {/* Notifications Button */}
        <button className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors flex items-center justify-center text-slate-300 hover:text-white group">
          <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(230,180,98,0.9)] animate-pulse"></span>
        </button>

        {/* Cashier Profile Badge */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/[0.08] pl-2 pr-4 py-1.5 rounded-full shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold shadow-sm shadow-amber-500/20">
            <User className="w-4 h-4 text-black" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[13px] font-semibold text-white leading-tight flex items-center gap-1">
              Cashier <ShieldCheck className="w-3 h-3 text-amber-400" />
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Station 01</span>
          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white flex items-center justify-center text-red-400 transition-colors shadow-sm"
          title="Logout"
        >
          <LogOut className="w-4 h-4 ml-0.5" />
        </button>
      </div>
    </header>
  );
}

