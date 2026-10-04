import { auth } from "@clerk/nextjs/server";
import AppShell from "@/components/layout/app-shell";
import { ModelProvider } from "@/lib/model-context";
import { LimitsProvider } from "@/lib/limits-context";

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  return (
    <ModelProvider>
      <LimitsProvider>
        {userId ? <AppShell>{children}</AppShell> : children}
      </LimitsProvider>
    </ModelProvider>
  );
}