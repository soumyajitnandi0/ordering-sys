"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useStore((state) => state.isAuthenticated);
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logout = useStore((state) => state.logout);

  useEffect(() => {
    if (mounted && !isAuthenticated && pathname !== '/login') {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, pathname, router]);

  // Inactivity Auto-Logout Timer (15 minutes)
  useEffect(() => {
    if (!isAuthenticated || pathname === '/login') return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timeoutId);
      // 15 minutes = 15 * 60 * 1000 = 900,000 ms
      timeoutId = setTimeout(() => {
        logout();
        router.push('/login');
      }, 900000);
    };

    // Initialize timer
    resetTimer();

    // Events that count as "activity"
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      window.addEventListener(event, resetTimer, { passive: true });
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [isAuthenticated, pathname, logout, router]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  // If not authenticated and trying to access protected route, render nothing while redirecting
  if (!isAuthenticated && pathname !== '/login') {
    return (
      <div className="h-screen w-screen bg-[#070709] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return <>{children}</>;
}
