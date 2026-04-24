import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoemaForge",
  description: "Private multimodal capture and journal history for NoemaForge.",
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
