import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AnonCookie } from "./components/AnonCookie";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ColdCall Pro — Practice cold calls with AI prospects",
  description:
    "The flight simulator for sales. Speak with realistic AI prospects, handle real objections, and get coaching feedback — all before your first real call.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${geistMono.variable} ${syne.variable} ${jetbrainsMono.variable} antialiased bg-[#F8F6F3] text-[#0F0E0C]`}>
        <AnonCookie />
        {children}
      </body>
    </html>
  );
}
