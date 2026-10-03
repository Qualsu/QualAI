import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { pages } from "@/config";
import LandingPage from "@/components/landing/landing-page";

export default async function LandingRoutePage() {
  const { userId } = await auth();

  if (userId) {
    redirect(pages.ROOT);
  }

  return <LandingPage />;
}
