import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DbHealthProvider } from "./components/providers/DbHealthProvider";
import { DbHealthBanner } from "./components/DbHealthBanner";
import { Toaster } from "react-hot-toast";
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
  title: "Ferme JN Beauchemin",
  description: "logiciel de gestion agricole ",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
        <DbHealthProvider>
          <DbHealthBanner />
          {children}
          <Toaster position="top-center" />
        </DbHealthProvider>
      </body>
    </html>
  );
}
