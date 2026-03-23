"use client";

import { motion } from "framer-motion";
import { cn, formatIDR, formatDate } from "@/lib/utils";
import type { Transaction, Category, Account } from "@/types";

interface TransactionItemProps {
  transaction: Transaction;
  category: Category | undefined;
  account: Account | undefined;
  /** Delay for staggered entrance animation */
  animationDelay?: number;
}

export default function TransactionItem({
  transaction,
  category,
  account,
  animationDelay = 0,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  const isTransfer = transaction.type === "transfer";

  const amountColor = isTransfer
    ? "var(--color-transfer)"
    : isIncome
      ? "var(--color-income)"
      : "var(--color-expense)";

  const amountPrefix = isIncome ? "+" : isTransfer ? "" : "−";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: animationDelay, ease: [0.4, 0, 0.2, 1] }}
      className="flex items-center gap-3 py-3"
      style={{ borderBottom: "1px solid var(--color-border-muted)" }}
    >
      {/* Category icon bubble */}
      <div
        className="flex shrink-0 items-center justify-center rounded-xl text-sm font-semibold"
        style={{
          width: 40,
          height: 40,
          background: category?.color
            ? `${category.color}1A` // 10% opacity
            : "var(--color-surface-2)",
          color: category?.color ?? "var(--color-text-secondary)",
        }}
        aria-hidden="true"
      >
        {/* Emoji fallback based on type */}
        {isTransfer ? "↔" : isIncome ? "↑" : "↓"}
      </div>

      {/* Label + Account */}
      <div className="flex-1 min-w-0">
        <p
          className="truncate text-sm font-medium"
          style={{ color: "var(--color-text-primary)" }}
        >
          {transaction.note ?? category?.name ?? "Transaction"}
        </p>
        <p
          className="mt-0.5 truncate text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          {account?.name ?? "—"} · {formatDate(transaction.date)}
        </p>
      </div>

      {/* Amount + type badge */}
      <div className="shrink-0 text-right">
        <p
          className="text-sm font-semibold tabular-nums"
          style={{ color: amountColor }}
        >
          {amountPrefix}{formatIDR(transaction.amount)}
        </p>
        <span
          className={cn(
            "badge mt-0.5",
            isTransfer ? "badge-transfer" : isIncome ? "badge-income" : "badge-expense"
          )}
        >
          {transaction.type}
        </span>
      </div>
    </motion.div>
  );
}
