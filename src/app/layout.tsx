import type { Metadata } from "next";
import { PublicEnvScript } from "next-runtime-env";
import Script from "next/script";
import { PaddleInit } from "./paddle-init";
import "./globals.css";

export const metadata: Metadata = {
  title: "MergeWell",
  description: "AI-powered pull request reviews for React, Next.js, TypeScript & Node.js",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <PublicEnvScript />
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-DR21BXQC02"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-DR21BXQC02');
          `}
        </Script>
      </head>
      <body className="min-h-full">
        {children}
        <PaddleInit />
      </body>
    </html>
  );
}
