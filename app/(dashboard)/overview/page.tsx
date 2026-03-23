"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { getMonthKey, safePercent } from "@/lib/utils";
import SummaryCards from "@/features/overview/SummaryCards";
import TransactionItem from "@/features/transactions/TransactionItem";
import PageHeader from "@/features/layout/PageHeader";

export default function OverviewPage() {
  const accounts = useAppStore((s) => s.accounts);
  const transactions = useAppStore((s) => s.transactions);
  const getAccountById = useAppStore((s) => s.getAccountById);
  const getCategoryById = useAppStore((s) => s.getCategoryById);
  const getTransactionsByMonth = useAppStore((s) => s.getTransactionsByMonth);

  const currentMonthKey = getMonthKey(new Date());

  // ── Derived metrics ───────────────────────────────────────────────
  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );

  const monthlyTxns = useMemo(
    () => getTransactionsByMonth(currentMonthKey),
    [getTransactionsByMonth, currentMonthKey]
  );

  const monthlyIncome = useMemo(
    () =>
      monthlyTxns
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTxns]
  );

  const monthlyExpenses = useMemo(
    () =>
      monthlyTxns
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0),
    [monthlyTxns]
  );

  const savingsRate = useMemo(
    () => safePercent(monthlyIncome - monthlyExpenses, monthlyIncome),
    [monthlyIncome, monthlyExpenses]
  );

  // ── Recent transactions (non-transfer, latest 8) ──────────────────
  const recentTransactions = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [transactions]
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title="Overview"
        description={`Financial health for ${new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`}
      />

      {/* ── Summary Cards ────────────────────────────────────────── */}
      <SummaryCards
        totalBalance={totalBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        savingsRate={savingsRate}
      />

      {/* ── Recent Transactions ──────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="card p-5"
        aria-labelledby="recent-txn-heading"
      >
        {/* Section header */}
        <div className="flex items-center justify-between mb-4">
          <h2
            id="recent-txn-heading"
            className="heading-3"
            style={{ color: "var(--color-text-primary)" }}
          >
            Recent Transactions
          </h2>
          <Link
            href="/transactions"
            className="btn btn-ghost btn-sm gap-1"
            style={{ color: "var(--color-primary)" }}
          >
            View all
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>

        {/* Transaction list */}
        {recentTransactions.length === 0 ? (
          <div className="empty-state">
            <p className="text-sm">No transactions yet.</p>
            <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
              Add your first transaction to get started.
            </p>
          </div>
        ) : (
          <div role="list" aria-label="Recent transactions">
            {recentTransactions.map((txn, i) => (
              <div key={txn.id} role="listitem">
                <TransactionItem
                  transaction={txn}
                  category={getCategoryById(txn.categoryId)}
                  account={getAccountById(txn.accountId)}
                  animationDelay={0.4 + i * 0.05}
                />
              </div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  );
}
