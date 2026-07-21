import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holms — Your documents. Your island.",
  description: "Local-first personal document search and RAG assistant.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-sand min-h-screen font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
