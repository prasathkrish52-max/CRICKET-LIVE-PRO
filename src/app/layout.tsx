import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cricket Live Pro | Professional Live Scoring & Tournament Management",
  description: "The ultimate platform for cricket league management, ball-by-ball live scoring, and real-time tournament analytics.",
};

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { AppWrapper } from "@/components/ui/AppWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased`}
      >
        <AuthProvider>
          {!isSupabaseConfigured && <SetupNotice />}
          <AppWrapper>{children}</AppWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}