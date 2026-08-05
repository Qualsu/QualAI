import AppShell from "@/components/app-shell";
import { ModelProvider } from "@/lib/model-context";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ModelProvider>
      <AppShell>{children}</AppShell>
    </ModelProvider>
  );
}