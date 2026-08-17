import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Suspense } from "react";
import { LoadingProvider } from "@/app/context/LoadingContext";
import PageNavigationLoader from "@/app/components/PageNavigationLoader";
import TransitionProvider from "@/app/components/TransitionProvider";
import { OfflineSyncProvider } from "@/app/components/OfflineSyncProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Face-off",
  description: "Face-off Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <LoadingProvider>
          <TransitionProvider>
            <OfflineSyncProvider>
              <Suspense fallback={null}>
                <PageNavigationLoader />
              </Suspense>
              {children}
            </OfflineSyncProvider>
          </TransitionProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}


