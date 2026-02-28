import "./globals.css";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

export const metadata: Metadata = {
  title: "Orangeleaf CRM",
  description: "Sales CRM for Orangeleaf Consulting",
};

export const viewport: Viewport = {
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="bg-white dark:bg-gray-950 text-black dark:text-white"
    >
      <body className="min-h-[100dvh] bg-gray-50 font-sans">{children}</body>
    </html>
  );
}
