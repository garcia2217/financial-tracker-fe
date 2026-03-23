"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMonthYear, getMonthKey } from "@/lib/utils";
import PageHeader from "@/features/layout/PageHeader";
import TransactionItem from "@/features/transactions/TransactionItem";
import TransactionModal from "@/features/transactions/TransactionModal";

export default function TransactionsPage() {
  const activeMonth = useAppStore((s) => s.activeMonth);
  const setActiveMonth = useAppStore((s) => s.setActiveMonth);
  const openModal = useAppStore((s) => s.openModal);
  const getTransactionsByMonth = useAppStore((s) => s.getTransactionsByMonth);
  const getCategoryById = useAppStore((s) => s.getCategoryById);
  const getAccountById = useAppStore((s) => s.getAccountById);

  // ── Month navigation ───────────────────────────────────────────
  function changeMonth(direction: -1 | 1) {
    const [year, month] = activeMonth.split("-").map(Number);
    const d = new Date(year, month - 1 + direction, 1);
    setActiveMonth(getMonthKey(d));
  }

  const today = new Date();
  const isCurrentMonth = activeMonth === getMonthKey(today);

  // ── Transactions for the active month, sorted newest first ─────
  const transactions = useMemo(
    () =>
      getTransactionsByMonth(activeMonth).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [getTransactionsByMonth, activeMonth]
  );

  // ── Monthly summary ────────────────────────────────────────────
  const summary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const t of transactions) {
      if (t.type === "income") income += t.amount;
      else if (t.type === "expense") expenses += t.amount;
    }
    return { income, expenses, net: income - expenses };
  }, [transactions]);

  const addTransactionLabel = "Add Transaction";

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* ── Header ──────────────────────────────────────────── */}
        <PageHeader
          title="Transactions"
          description="Track every income, expense, and transfer."
          action={
            <button
              id="add-transaction-btn"
              className="btn btn-primary btn-md gap-2"
              onClick={() => openModal({ type: "add-transaction" })}
              aria-label={addTransactionLabel}
            >
              <Plus size={16} aria-hidden="true" />
              {addTransactionLabel}
            </button>
          }
        />

        {/* ── Month Selector + Summary ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          {/* Month navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => changeMonth(-1)}
              className="btn btn-ghost btn-sm"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <p
              className="min-w-[140px] text-center text-sm font-semibold"
              style={{ color: "var(--color-text-primary)" }}
              aria-live="polite"
            >
              {formatMonthYear(new Date(activeMonth + "-01"))}
            </p>
            <button
              onClick={() => changeMonth(1)}
              className="btn btn-ghost btn-sm"
              aria-label="Next month"
              disabled={isCurrentMonth}
              aria-disabled={isCurrentMonth}
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Mini summary pills */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <StatPill
              label="In"
              value={summary.income}
              color="var(--color-income)"
              bg="var(--color-income-bg)"
            />
            <StatPill
              label="Out"
              value={summary.expenses}
              color="var(--color-expense)"
              bg="var(--color-expense-bg)"
            />
            <StatPill
              label="Net"
              value={summary.net}
              color={summary.net >= 0 ? "var(--color-income)" : "var(--color-expense)"}
              bg={summary.net >= 0 ? "var(--color-income-bg)" : "var(--color-expense-bg)"}
              showSign
            />
          </div>
        </motion.div>

        {/* ── Transaction List ─────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16 }}
          className="card p-5"
          aria-label="Transaction list"
        >
          <AnimatePresence mode="wait">
            {transactions.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-state"
              >
                <ReceiptText
                  size={40}
                  style={{ color: "var(--color-text-muted)" }}
                  aria-hidden="true"
                />
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  No transactions in{" "}
                  {formatMonthYear(new Date(activeMonth + "-01"))}
                </p>
                <button
                  className="btn btn-primary btn-sm mt-2"
                  onClick={() => openModal({ type: "add-transaction" })}
                >
                  Add one now
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                role="list"
                aria-label={`Transactions for ${formatMonthYear(new Date(activeMonth + "-01"))}`}
              >
                {transactions.map((txn, i) => (
                  <div key={txn.id} role="listitem">
                    <TransactionItem
                      transaction={txn}
                      category={getCategoryById(txn.categoryId)}
                      account={getAccountById(txn.accountId)}
                      animationDelay={i * 0.04}
                    />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </div>

      {/* Modal — mounted outside the page scroll container */}
      <TransactionModal />
    </>
  );
}

// ── Mini Stat Pill ─────────────────────────────────────────────────────────────

interface StatPillProps {
  label: string;
  value: number;
  color: string;
  bg: string;
  showSign?: boolean;
}

function StatPill({ label, value, color, bg, showSign }: StatPillProps) {
  const sign = showSign ? (value >= 0 ? "+" : "−") : "";
  const absValue = Math.abs(value);
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(absValue);

  return (
    <div
      className="flex items-center gap-1.5 rounded-full px-3 py-1"
      style={{ background: bg }}
    >
      <span style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span style={{ color }}>{sign}{formatted}</span>
    </div>
  );
}
