import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoemaForge",
  description: "Bootstrap scaffold for the NoemaForge journaling app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
