import type { Metadata } from "next";
import { DM_Mono, Syne } from "next/font/google";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["800"],
  variable: "--font-display",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PitchPK",
  description:
    "A brutal AI investor panel for founders who need sharper answers before demo day.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark h-full bg-[#080808] text-[#F0EDE6] antialiased ${syne.variable} ${dmMono.variable}`}
    >
      <body className="min-h-full bg-[#080808] text-[#F0EDE6]">
        {children}
      </body>
    </html>
  );
}
