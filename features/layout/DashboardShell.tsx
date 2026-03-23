"use client";

import { ReactNode } from "react";
import Sidebar from "@/features/layout/Sidebar";

interface DashboardShellProps {
  children: ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--color-background)" }}>
      <Sidebar />
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        role="main"
      >
        {children}
      </main>
    </div>
  );
}
