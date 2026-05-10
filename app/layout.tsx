import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PwaInstaller from "@/app/components/PwaInstaller";
import SidebarLegacyBridge from "@/app/components/SidebarLegacyBridge";
import UserProfileBadge from "@/app/components/UserProfileBadge";
import { LanguageProvider } from "@/app/components/useLegalLanguage";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WellFit",
  description: "WellFit Mobile Test-App für Missionen, Buddy, Analyse und AR.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "WellFit",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  themeColor: "#00aabe",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <PwaInstaller />
          <SidebarLegacyBridge />
          <UserProfileBadge />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
