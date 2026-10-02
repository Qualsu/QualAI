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
  themeColor: "#111315",
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
        className={`${inter.className} ${inter.variable} antialiased bg-[#111315] text-white selection:bg-[#76a4ff]/30 selection:text-white`}
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
                colorPrimary: "#76a4ff",
                colorBackground: "#17191c",
                colorText: "#ffffff",
                colorTextSecondary: "rgba(255, 255, 255, 0.65)",
                colorInputBackground: "rgba(255, 255, 255, 0.05)",
                colorInputText: "#ffffff",
                borderRadius: "1rem",
                fontFamily: "var(--font-inter), 'Inter', sans-serif",
              },
              elements: {
                modalBackdrop: "bg-black/75 backdrop-blur-md",
                card: "surface-panel bg-[#17191c]/95 border border-white/10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-3xl p-6 sm:p-8",
                headerTitle: "text-white font-bold text-xl",
                headerSubtitle: "text-white/60 text-sm",
                socialButtonsBlockButton: "surface-panel bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 text-white rounded-xl transition-all",
                socialButtonsBlockButtonText: "text-white font-medium",
                dividerLine: "bg-white/10",
                dividerText: "text-white/40 text-xs",
                formFieldLabel: "text-white/80 text-xs font-medium",
                formFieldInput: "bg-white/[0.04] border border-white/15 text-white rounded-xl focus:border-[#76a4ff] focus:ring-1 focus:ring-[#76a4ff]/50 transition-all",
                formButtonPrimary: "bg-gradient-to-r from-[#76a4ff] to-[#4f83f7] hover:from-[#8eb5ff] hover:to-[#6094ff] text-white font-medium rounded-xl shadow-[0_0_20px_rgba(118,164,255,0.35)] hover:shadow-[0_0_30px_rgba(118,164,255,0.55)] transition-all transform hover:-translate-y-0.5",
                footerActionLink: "text-[#76a4ff] hover:text-[#9ec0ff] font-medium",
                footer: "border-t border-white/10 bg-transparent",
                userButtonPopoverCard: "surface-panel bg-[#17191c]/95 border border-white/15 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-2xl",
                userPreviewMainIdentifier: "text-white font-medium",
                userPreviewSecondaryIdentifier: "text-white/60 text-xs",
                userButtonPopoverActionButton: "hover:bg-white/10 text-white/80 hover:text-white rounded-xl transition-colors",
                userButtonPopoverActionButtonIcon: "text-[#76a4ff]",
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
