'use client';

import LandingNavbar from "@/components/landing/navbar";
import LandingHeader from "@/components/landing/header";
import LandingFeatures from "@/components/landing/features";
import LandingModels from "@/components/landing/models";
import LandingFooter from "@/components/landing/footer";
import type { LandingPageProps } from "@/config/types";

export default function LandingPage({ className }: LandingPageProps) {
  return (
    <div className={`min-h-screen bg-[#111315] text-white flex flex-col selection:bg-[#76a4ff]/30 selection:text-white ${className || ""}`}>
      <LandingNavbar />
      <LandingHeader />
      <LandingFeatures />
      <LandingModels />
      <LandingFooter />
    </div>
  );
}
