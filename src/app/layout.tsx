import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ThemeProvider } from "@/components/theme-provider";
import PWARegister from "@/components/pwa-register";
import { APP_NAME } from "@/config";
import { images, pages } from "@/config";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  themeColor: "#130f14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_NAME,
  manifest: images.MANIFEST,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: APP_NAME,
  },
  icons: {
    icon: images.ICON,
    apple: images.ICON,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" style={{ colorScheme: "dark" }}>
      <head>
        <link rel="manifest" href={images.MANIFEST} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${inter.className} ${inter.variable} antialiased bg-[#130f14] text-white selection:bg-purple-500/30 selection:text-white`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            forcedTheme="dark"
            enableSystem={false}
            disableTransitionOnChange
        >
          <ClerkProvider
            signInUrl={pages.AUTH.SIGN_IN}
            signUpUrl={pages.AUTH.SIGN_UP}
            appearance={{
              baseTheme: dark,
              variables: {
                colorPrimary: "#9333ea",
                colorBackground: "#161118",
                colorText: "#ffffff",
                colorTextSecondary: "rgba(255, 255, 255, 0.65)",
                colorInputBackground: "rgba(255, 255, 255, 0.05)",
                colorInputText: "#ffffff",
                borderRadius: "1rem",
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
              },
              elements: {
                modalBackdrop: "bg-black/75 backdrop-blur-md",
                card: "surface-panel bg-[#161118]/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8",
                headerTitle: "text-white font-bold text-xl",
                headerSubtitle: "text-white/60 text-sm",
                socialButtonsBlockButton: "surface-panel bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white rounded-xl transition-all",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-white/10",
                dividerText: "text-white/40 text-xs",
                formFieldLabel: "text-white/80 text-xs font-medium",
                formFieldInput: "bg-white/[0.04] border border-white/15 text-white rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.35)] hover:shadow-[0_0_30px_rgba(168,85,247,0.55)] transition-all transform hover:-translate-y-0.5",
                footerActionLink: "text-purple-400 hover:text-purple-300 font-medium",
                footer: "border-t border-white/10 bg-transparent",
                userButtonPopoverCard: "surface-panel bg-[#161118]/95 border border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl",
                userPreviewMainIdentifier: "text-white font-medium",
                userPreviewSecondaryIdentifier: "text-white/60 text-xs",
                userButtonPopoverActionButton: "hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition-colors",
                userButtonPopoverActionButtonIcon: "text-purple-400",
                userButtonPopoverFooter: "hidden",
              },
            }}
          >
            <PWARegister />
            {children}
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
