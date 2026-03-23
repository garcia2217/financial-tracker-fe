"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, ChevronLeft, ChevronRight, Target } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatMonthYear, getMonthKey, formatIDR } from "@/lib/utils";
import PageHeader from "@/features/layout/PageHeader";
import BudgetCard from "@/features/budget/BudgetCard";
import BudgetModal from "@/features/budget/BudgetModal";

export default function BudgetPage() {
  const activeMonth = useAppStore((s) => s.activeMonth);
  const setActiveMonth = useAppStore((s) => s.setActiveMonth);
  const openModal = useAppStore((s) => s.openModal);
  
  const getResolvedBudget = useAppStore((s) => s.getResolvedBudget);
  const getCategoryById = useAppStore((s) => s.getCategoryById);
  const getTransactionsByMonth = useAppStore((s) => s.getTransactionsByMonth);

  // ── Month navigation ───────────────────────────────────────────
  function changeMonth(direction: -1 | 1) {
    const [year, month] = activeMonth.split("-").map(Number);
    const d = new Date(year, month - 1 + direction, 1);
    setActiveMonth(getMonthKey(d));
  }

  const today = new Date();
  const isCurrentMonth = activeMonth === getMonthKey(today);

  // ── Compute budgeting stats for active month ───────────────────
  const transactions = getTransactionsByMonth(activeMonth);
  const resolvedBudget = getResolvedBudget(activeMonth);

  // Group expenses by category map: Map<CategoryId, TotalSpent>
  const expensesByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of transactions) {
      if (t.type === "expense") {
        map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
      }
    }
    return map;
  }, [transactions]);

  // Map budgets to include spent amount
  const budgetStats = useMemo(() => {
    return resolvedBudget.items.map((b) => {
      const amount = b.amount;
      const spent = expensesByCategory.get(b.categoryId) || 0;
      return {
        id: b.categoryId,
        categoryId: b.categoryId,
        budgetedAmount: amount,
        spentAmount: spent,
        category: getCategoryById(b.categoryId),
      };
    }).filter((b) => b.category !== undefined);
  }, [resolvedBudget, expensesByCategory, getCategoryById]);

  // Overall sums
  const totalBudgeted = budgetStats.reduce((sum, b) => sum + b.budgetedAmount, 0);
  const totalSpent = budgetStats.reduce((sum, b) => sum + b.spentAmount, 0);
  const overallRemaining = totalBudgeted - totalSpent;
  const isOverallOver = totalSpent > totalBudgeted;

  const setBudgetLabel = "Set Budget";

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* ── Header ──────────────────────────────────────────── */}
        <PageHeader
          title="Budgets"
          description="Keep your spending on track with category limits."
          action={
            <button
              className="btn btn-primary btn-md gap-2"
              onClick={() => openModal({ type: "add-budget" })}
              aria-label={setBudgetLabel}
            >
              <Plus size={16} aria-hidden="true" />
              {setBudgetLabel}
            </button>
          }
        />

        {/* ── Top Summary & Month Navigator ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="card p-5 space-y-5"
        >
          {/* Controls row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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

            <div className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
              {isOverallOver ? (
                <span style={{ color: "var(--color-expense)" }}>
                  Overbudget by {formatIDR(Math.abs(overallRemaining))}
                </span>
              ) : (
                <span>
                  <strong style={{ color: "var(--color-text-primary)" }}>{formatIDR(overallRemaining)}</strong> left perfectly
                </span>
              )}
            </div>
          </div>

          {/* Global Progress Bar */}
          <div className="pt-2">
            <div className="flex justify-between text-xs mb-2">
              <span style={{ color: "var(--color-text-secondary)" }}>
                Spent: <strong>{formatIDR(totalSpent)}</strong>
              </span>
              <span style={{ color: "var(--color-text-secondary)" }}>
                Total Budget: <strong>{formatIDR(totalBudgeted)}</strong>
              </span>
            </div>
            
            <div
              className="h-3 w-full rounded-full overflow-hidden"
              style={{ background: "var(--color-surface-3)" }}
              aria-hidden="true"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0, 100)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: isOverallOver ? "var(--color-expense)" : "var(--color-primary)" }}
              />
            </div>
          </div>
        </motion.div>

        {/* ── Budget Cards Grid ─────────────────────────────────── */}
        <section aria-label="Category Budgets">
          <AnimatePresence mode="wait">
            {budgetStats.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-state mt-4"
              >
                <Target
                  size={40}
                  style={{ color: "var(--color-text-muted)" }}
                  aria-hidden="true"
                />
                <p
                  className="text-sm font-medium mt-3"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  No category budgets set yet.
                </p>
                <button
                  className="btn btn-primary btn-sm mt-3"
                  onClick={() => openModal({ type: "add-budget" })}
                >
                  Create a Budget
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid gap-4 mt-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
              >
                {budgetStats.map((stat, i) => (
                  <BudgetCard
                    key={stat.id}
                    category={stat.category!}
                    budgeted={stat.budgetedAmount}
                    spent={stat.spentAmount}
                    delay={i * 0.05}
                    onEdit={() => openModal({ 
                      type: "edit-budget", 
                      payload: { categoryId: stat.categoryId, templateAmount: stat.budgetedAmount } 
                    })}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <BudgetModal />
    </>
  );
}
