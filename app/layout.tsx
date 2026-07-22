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
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (("standalone" in window.navigator) && window.navigator.standalone) {
                document.addEventListener("click", function(e) {
                  let node = e.target;
                  while (node && node.nodeName !== "A" && node.nodeName !== "HTML") {
                    node = node.parentNode;
                  }
                  if (
                    node && 
                    node.nodeName === "A" && 
                    node.href && 
                    node.href.indexOf("http") !== -1 && 
                    node.href.indexOf(document.location.host) !== -1 &&
                    node.target !== "_blank"
                  ) {
                    e.preventDefault();
                    window.location.href = node.href;
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
