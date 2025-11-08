import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Secure Digital Voting Platform",
  description: "A government-grade decentralized voting system ensuring transparency, security, and accessibility for all citizens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
