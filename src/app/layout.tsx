import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "smartkhaata - WhatsApp-first CRM for Micro Businesses",
  description: "Replace Excel + WhatsApp chaos with simple deal tracking, follow-up reminders, and invoice syncing. Built for 1-5 person teams.",
  keywords: ["CRM", "WhatsApp", "small business", "micro business", "invoicing", "deal tracking"],
  authors: [{ name: "FlowDesk" }],
  openGraph: {
    title: "smartkhaata - WhatsApp-first CRM",
    description: "Simple CRM for micro-businesses. Track deals, send invoices, never miss a follow-up.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
