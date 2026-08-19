import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Royal GGR | B2B iGaming API & Provider Platform",
  description: "Next-Gen B2B Game Aggregator, RGS Engine, and Developer Gateway.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
