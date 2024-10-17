import type { Metadata } from "next";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/react"
import { ScenarioProvider } from "@/context/ScenarioContext";
import "./globals.css";

const robotoSlab = localFont({
  src: "./fonts/Roboto_Slab/RobotoSlab-VariableFont_wght.ttf",
  variable: "--font-roboto-slab",
  weight: "100 900",
});

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
    <html lang="en">
      <body
        className={`${robotoSlab.variable} antialiased bg-white`}
      >
        <ScenarioProvider>
          {children}
          <Analytics />
        </ScenarioProvider>
      </body>
    </html>
  );
}
