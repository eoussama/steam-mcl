import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ViewTransitions } from "next-view-transitions";

import "./globals.css";
import { ClientWrapper } from "@/app/components/ClientWrapper";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Steam Missing Content Lookup",
  description: "Easily lookup up missing DLC, Sequels, Prequel, Spin-Offs... etc from your Steam library.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </body>
      </html>
    </ViewTransitions>
  );
}