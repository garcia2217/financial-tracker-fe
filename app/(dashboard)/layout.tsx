import DashboardShell from "@/features/layout/DashboardShell";
import { ReactNode } from "react";

// This layout wraps all dashboard routes: /overview, /transactions, /budget, /debt, /wallets
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
