"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Menu } from "lucide-react";
import Image from "next/image";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <Navbar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <main
        className={`h-dvh overflow-hidden transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center gap-3 bg-neutral-900 px-4 py-3 shadow">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="text-neutral-300 hover:text-white"
            aria-label="Открыть меню"
          >
            <Menu size={22} />
          </button>
          <Image src="/logo.png" width={120} height={28} alt="Qual AI" className="object-contain" />
        </div>

        <div className="h-full pt-12 md:pt-0">
          {children}
        </div>
      </main>
    </>
  );
}
