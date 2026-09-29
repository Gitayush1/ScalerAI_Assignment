import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meetly — Video Conferencing",
  description: "Simple, reliable video conferencing for teams.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
