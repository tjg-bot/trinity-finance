import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "@trinity/ui/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Trinity Finance - Commercial Lending Platform",
    template: "%s | Trinity Finance",
  },
  description:
    "Trinity Finance - AI-driven commercial lending. Equipment financing, SBA loans, lines of credit, MCA, invoice factoring and more. Portsmouth, Ohio.",
  keywords: ["commercial lending", "small business loans", "SBA", "equipment financing", "MCA"],
  robots: {
    // No indexing of portal pages - only landing
    index: false,
    follow: false,
  },
  metadataBase: new URL(
    process.env["NEXT_PUBLIC_APP_URL"] ?? "https://trinityfinance.com"
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={inter.variable}>
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600&display=swap"
            rel="stylesheet"
          />
        </head>
        <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
