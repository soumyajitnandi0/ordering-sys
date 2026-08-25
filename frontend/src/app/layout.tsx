import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Waffle Circle — Luxury Operational OS",
  description: "Waffle Circle Luxury POS & Kitchen System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${plusJakartaSans.className} bg-[#070709] text-foreground antialiased h-screen flex overflow-hidden selection:bg-amber-500/30 selection:text-amber-200 relative`}>
        {/* Ambient background glows */}
        <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none z-0" />
        <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[160px] pointer-events-none z-0" />

        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden z-10 relative">
          <Topbar />
          <main className="flex-1 overflow-auto bg-transparent relative">
            {children}
          </main>
        </div>
        <Toaster theme="dark" richColors />
      </body>
    </html>
  );
}

