"use client";

import { motion } from "framer-motion";
import { formatIDR } from "@/lib/utils";
import { Category } from "@/types";

interface BudgetCardProps {
  category: Category;
  spent: number;
  budgeted: number;
  delay?: number;
  onEdit?: () => void;
}

export default function BudgetCard({
  category,
  spent,
  budgeted,
  delay = 0,
  onEdit,
}: BudgetCardProps) {
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  // Cap visual percentage at 100% so the bar doesn't overflow visually
  const visualPercentage = Math.min(percentage, 100);
  const remaining = budgeted - spent;

  // Color coding
  // < 80% = safe (primary/income color)
  // 80 - 99% = warning
  // >= 100% = danger/expense
  let statusColor = "var(--color-primary)";
  let statusBg = "var(--color-primary-bg)";
  if (percentage >= 100) {
    statusColor = "var(--color-expense)";
    statusBg = "var(--color-expense-bg)";
  } else if (percentage >= 80) {
    statusColor = "var(--color-warning)";
    statusBg = "var(--color-warning-bg)";
  }

  const isOver = percentage >= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className="card p-5 group transition-colors"
      style={{
        border: `1px solid ${isOver ? "var(--color-expense-bg)" : "var(--color-border-muted)"}`,
        cursor: onEdit ? "pointer" : "default",
      }}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit?.();
        }
      }}
      aria-label={`${category.name} budget. ${formatIDR(spent)} spent of ${formatIDR(budgeted)} budgeted.`}
    >
      <div className="flex items-center justify-between mb-4">
        {/* Left: Icon & Label */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl font-bold"
            style={{
              width: 36,
              height: 36,
              background: `${category.color}1A`,
              color: category.color,
            }}
            aria-hidden="true"
          >
            {category.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
              {category.name}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {isOver ? (
                <span style={{ color: "var(--color-expense)" }}>
                  Over by {formatIDR(Math.abs(remaining))}
                </span>
              ) : (
                <span>{formatIDR(remaining)} left</span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Amounts */}
        <div className="text-right">
          <p className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
            {formatIDR(spent)}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
            of {formatIDR(budgeted)}
          </p>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div
        className="h-2.5 w-full rounded-full overflow-hidden"
        style={{ background: statusBg }}
        aria-hidden="true"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${visualPercentage}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: statusColor }}
        />
      </div>
    </motion.div>
  );
}
