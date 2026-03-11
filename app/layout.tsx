import "./globals.css";

import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";

import { Toaster } from "react-hot-toast";

import { Header, Providers } from "@/components";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Next.js Chess",
  description:
    "A modern chess application built with Next.js and React Chessboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="bg-bg-light text-fg-light antialiased dark:bg-bg-dark dark:text-fg-dark">
        <Providers>
          <Header />
          <main>{children}</main>
          <Toaster position="bottom-right" />
        </Providers>
      </body>
    </html>
  );
}
