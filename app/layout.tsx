import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "XCP.FUN - Burn after minting",
  description: "10M hard cap • 4.2M soft cap • 0.1 XCP per mint • Max 35 mints per address • 1000 blocks • Supply locked • No Premine",
  metadataBase: new URL('https://xcp.fun'),
  openGraph: {
    title: 'XCP.FUN - Burn after minting',
    description: '10M hard cap • 4.2M soft cap • 0.1 XCP per mint • Max 35 mints per address • 1000 blocks • Supply locked • No Premine',
    url: 'https://xcp.fun',
    siteName: 'XCP.FUN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XCP.FUN - Burn after minting',
    description: '10M hard cap • 4.2M soft cap • Supply locked • No Premine',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        {children}
      </body>
    </html>
  );
}
