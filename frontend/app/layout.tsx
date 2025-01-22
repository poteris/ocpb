import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react"
import { ScenarioProvider } from "@/context/ScenarioContext";
import { robotoSlab } from './fonts';
import "./globals.css";

export const metadata: Metadata = {
  title: "Union Training Bot",
  description: "Training scenarios for union representatives",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${robotoSlab.variable} font-sans`}>
      <body className="antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <ScenarioProvider>
          {children}
          <Analytics />
        </ScenarioProvider>
      </body>
    </html>
  );
}
