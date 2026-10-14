import "./globals.css";

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpeakGround",
  description: "A daily English set built for your level.",
};

export const viewport: Viewport = {
  themeColor: "#1f8a76",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={pretendard.variable}>
      <body className="min-h-dvh font-sans">{children}</body>
    </html>
  );
}
