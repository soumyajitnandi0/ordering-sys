"use client";

import { usePathname } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import AuthGuard from '@/components/AuthGuard';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <AuthGuard>
      {isLoginPage ? (
        <main className="flex-1 overflow-auto bg-transparent relative">
          {children}
        </main>
      ) : (
        <>
          <Sidebar />
          <div className="flex-1 flex flex-col h-full overflow-hidden z-10 relative print:h-auto print:overflow-visible print:block">
            <Topbar />
            <main className="flex-1 overflow-auto bg-transparent relative print:h-auto print:overflow-visible print:block">
              {children}
            </main>
          </div>
        </>
      )}
    </AuthGuard>
  );
}
