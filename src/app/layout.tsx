import type { Metadata } from "next";
import { PublicEnvScript } from "next-runtime-env";
import { PaddleInit } from "./paddle-init";
import "./globals.css";

export const metadata: Metadata = {
  title: "MergeWell",
  description: "AI-powered pull request reviews for React, Next.js, TypeScript & Node.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <PublicEnvScript />
      </head>
      <body className="min-h-full">
        {children}
        <PaddleInit />
      </body>
    </html>
  );
}
