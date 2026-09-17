import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nutri-Stacker",
  description: "Personalized meal plans from your goals, allergies, and macros.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
