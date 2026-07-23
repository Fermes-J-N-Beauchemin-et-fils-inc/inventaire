import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FAF8F5",
};

export const metadata: Metadata = {
  title: "Ferme JN Beauchemin",
  description: "logiciel de gestion agricole",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JN Beauchemin",
  },
  icons: {
    icon: "/images/logo.png",
    apple: "/apple-touch-icon.png",
  },
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
      <head>
      </head>
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
