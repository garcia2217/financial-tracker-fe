import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | FinTrack",
    default: "FinTrack – Personal Finance Tracker",
  },
  description:
    "Track your income, expenses, budgets, and debts in one beautiful dashboard.",
  keywords: ["finance", "budget", "expense tracker", "personal finance"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
