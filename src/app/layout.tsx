import type { Metadata } from "next";
import { DM_Mono, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
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
      className={`h-full bg-[#f2f1ee] text-[#1f2933] antialiased ${sourceSerif.variable} ${dmMono.variable} ${plusJakartaSans.variable}`}
    >
      <body className="min-h-full bg-[#f2f1ee] text-[#1f2933]">
        {children}
      </body>
    </html>
  );
}
