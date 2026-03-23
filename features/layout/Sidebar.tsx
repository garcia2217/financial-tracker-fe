"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  PiggyBank,
  HandCoins,
  Wallet,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/useAppStore";
import { formatIDR } from "@/lib/utils";

// ─── Navigation Items ──────────────────────────────────────────────────────────

const NAV_ITEMS = [
  {
    label: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
    description: "Financial health summary",
  },
  {
    label: "Transactions",
    href: "/transactions",
    icon: ArrowLeftRight,
    description: "Track income & expenses",
  },
  {
    label: "Budget",
    href: "/budget",
    icon: PiggyBank,
    description: "Plan your spending",
  },
  {
    label: "Debt & Credit",
    href: "/debts",
    icon: HandCoins,
    description: "Lend & borrow ledger",
  },
  {
    label: "Wallets",
    href: "/wallets",
    icon: Wallet,
    description: "Manage your accounts",
  },
] as const;

// ─── Component ─────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const accounts = useAppStore((s) => s.accounts);

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative flex flex-col shrink-0 overflow-hidden"
      style={{
        background: "var(--color-surface-1)",
        borderRight: "1px solid var(--color-border-muted)",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
      aria-label="Sidebar navigation"
    >
      {/* ── Logo / Brand ──────────────────────────────── */}
      <div
        className="flex items-center gap-3 px-4 pt-6 pb-5"
        style={{ borderBottom: "1px solid var(--color-border-muted)" }}
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-xl"
          style={{
            width: 40,
            height: 40,
            background:
              "linear-gradient(135deg, var(--color-primary), var(--color-income))",
          }}
        >
          <TrendingUp size={20} color="white" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p
                className="font-semibold leading-none"
                style={{
                  color: "var(--color-text-primary)",
                  fontSize: "0.9rem",
                }}
              >
                FinTrack
              </p>
              <p
                className="mt-0.5 text-xs leading-none"
                style={{ color: "var(--color-text-muted)" }}
              >
                Personal Finance
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Total Balance pill ─────────────────────────── */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-4 pb-2"
          >
            <div
              className="rounded-xl p-3"
              style={{ background: "var(--color-primary-bg)" }}
            >
              <p className="label" style={{ color: "var(--color-text-muted)" }}>
                Total Balance
              </p>
              <p
                className="mt-1 font-bold leading-none"
                style={{ color: "var(--color-primary)", fontSize: "1.1rem" }}
              >
                {formatIDR(totalBalance)}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation ─────────────────────────────────── */}
      <nav className="flex flex-col gap-1 px-2 py-3 flex-1" role="navigation">
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="label px-2 pb-2"
              style={{ color: "var(--color-text-muted)" }}
            >
              Menu
            </motion.p>
          )}
        </AnimatePresence>

        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 rounded-xl transition-all duration-150",
                collapsed ? "justify-center px-0 py-3" : "px-3 py-2.5",
                isActive ? "text-white" : "hover:bg-[var(--color-surface-2)]",
              )}
              style={
                isActive
                  ? {
                      background:
                        "linear-gradient(135deg, var(--color-primary), #4F46E5)",
                      boxShadow: "0 4px 16px rgba(99, 102, 241, 0.3)",
                    }
                  : { color: "var(--color-text-secondary)" }
              }
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                size={18}
                className="shrink-0 transition-transform duration-150 group-hover:scale-110"
                aria-hidden="true"
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    transition={{ duration: 0.18 }}
                    className="text-sm font-medium leading-none"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* ── Collapse toggle ─────────────────────────────── */}
      <div className="px-2 pb-6">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "btn btn-ghost btn-sm w-full",
            collapsed ? "justify-center" : "justify-between",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
