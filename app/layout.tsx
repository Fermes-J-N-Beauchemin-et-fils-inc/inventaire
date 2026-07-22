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
};

export const metadata: Metadata = {
  title: "Ferme JN Beauchemin",
  description: "logiciel de gestion agricole",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JN Beauchemin",
  },
  icons: {
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (window.navigator.standalone === true) {
                document.addEventListener('click', function(event) {
                  let target = event.target;
                  while (target && target.tagName !== 'A') {
                    target = target.parentNode;
                  }
                  if (target && target.href && target.origin === window.location.origin && !target.hasAttribute('data-external')) {
                    event.preventDefault();
                    window.location.href = target.href;
                  }
                }, false);
              }
            `
          }}
        />
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
