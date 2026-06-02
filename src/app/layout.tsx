import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rethread Studios",
  description: "Where thrift meets art. A marketplace for artists who transform secondhand clothing into one-of-one pieces.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-[#0a0a0a] text-white">{children}</body>
    </html>
  );
}
