import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoemaForge",
  description: "Private multimodal capture and journal history for NoemaForge.",
};

export const viewport: Viewport = {
  themeColor: "#202526",
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
