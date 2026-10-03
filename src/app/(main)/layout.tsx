import AppShell from "@/components/app-shell";
import { ModelProvider } from "@/lib/model-context";
import { LimitsProvider } from "@/lib/limits-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ModelProvider>
      <LimitsProvider>
        <AppShell>{children}</AppShell>
      </LimitsProvider>
    </ModelProvider>
  );
}