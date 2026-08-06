"use client";

import { useState } from "react";
import Navbar from "@/components/navbar";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { APP_NAME, images, pages } from "@/config";

import ModelSelector from "@/components/model-selector";

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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
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
        className={`h-dvh overflow-hidden relative transition-all duration-300 ${
          isCollapsed ? "md:ml-20" : "md:ml-72"
        }`}
      >
        {/* Mobile top bar */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between bg-[#161118]/95 backdrop-blur-2xl px-3 sm:px-4 py-2 border-b border-white/10 shadow-lg">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="text-white/80 hover:text-white p-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.1] transition-all shrink-0"
              aria-label="Открыть меню"
            >
              <Menu size={20} />
            </button>
            <Link
              href={pages.ROOT}
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new Event("new-chat"));
                }
              }}
              className="flex items-center shrink-0"
            >
              <Image src={images.LOGO} width={95} height={22} alt={APP_NAME} className="object-contain" />
            </Link>
          </div>

          <div className="flex items-center">
            <ModelSelector />
          </div>
        </div>

        <div className="h-full pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </>
  );
}
