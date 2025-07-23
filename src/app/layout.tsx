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
  title: "SurveyMD",
  description:
    "Upload your Microsoft Form results from Excel files and convert them into clean markdown summaries, perfect for use with AI.",
  keywords: [
    "Microsoft Forms",
    "Excel to Markdown",
    "survey summary tool",
    "xlsx to markdown",
    "Markdown converter",
    "Survey to AI format",
  ],
  authors: [{ name: "Craig Shields", url: "https://craigashields.com" }],

  // Favicon and icons
  icons: {
    icon: "/favicon.ico", // default
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },

  // Open Graph (used by Facebook, LinkedIn)
  openGraph: {
    title: "SurveyMD",
    description:
      "Upload your Microsoft Forms Excel results and convert them to clean, structured markdown for AI tools.",
    siteName: "SurveyMD",
    type: "website",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
