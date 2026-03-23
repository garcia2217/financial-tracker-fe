"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Users } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatIDR } from "@/lib/utils";
import PageHeader from "@/features/layout/PageHeader";
import DebtItem from "@/features/debts/DebtItem";
import DebtModal from "@/features/debts/DebtModal";
import DebtSettleModal from "@/features/debts/DebtSettleModal";

type ActiveTab = "receivables" | "payables";

export default function DebtsPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("receivables");
  const openModal = useAppStore((s) => s.openModal);
  const debts = useAppStore((s) => s.debts);

  const receivables = useMemo(() => debts.filter(d => d.direction === "lent"), [debts]);
  const payables = useMemo(() => debts.filter(d => d.direction === "borrowed"), [debts]);

  const calculateRemaining = (list: typeof debts) => 
    list.reduce((sum, d) => sum + (d.originalAmount - d.settledAmount), 0);

  const totalReceivables = calculateRemaining(receivables);
  const totalPayables = calculateRemaining(payables);
  const netWorthImpact = totalReceivables - totalPayables;

  const currentList = activeTab === "receivables" ? receivables : payables;

  // Render list visually grouping active and settled
  const activeDebts = currentList.filter(d => d.status !== "settled");
  const settledDebts = currentList.filter(d => d.status === "settled");

  return (
    <>
      <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
        <PageHeader
          title="Debt & Credit"
          description="Keep track of who owes you, and who you owe."
          action={
            <button
              className="btn btn-primary btn-md gap-2"
              onClick={() => openModal({ type: "add-debt" })}
              aria-label="Add Debt Record"
            >
              <Plus size={16} aria-hidden="true" />
              Add Record
            </button>
          }
        />

        {/* ── Global Summary Card ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="card p-5 grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              To Receive
            </span>
            <span className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>
              {formatIDR(totalReceivables)}
            </span>
          </div>

          <div className="flex flex-col gap-1 border-l pl-4" style={{ borderColor: "var(--color-border-subtle)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              To Pay
            </span>
            <span className="text-lg font-bold" style={{ color: "var(--color-warning)" }}>
              {formatIDR(totalPayables)}
            </span>
          </div>

          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l pt-3 sm:pt-0 sm:pl-4 mt-1 sm:mt-0" style={{ borderColor: "var(--color-border-subtle)" }}>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
              Net Impact
            </span>
            <span className="text-lg font-bold" style={{ color: netWorthImpact < 0 ? "var(--color-expense)" : "var(--color-text-primary)" }}>
              {netWorthImpact > 0 ? "+" : ""}{formatIDR(netWorthImpact)}
            </span>
          </div>
        </motion.div>

        {/* ── Segmented Control Tabs ──────────────────────── */}
        <div className="flex rounded-lg overflow-hidden border p-1" style={{ borderColor: "var(--color-border-muted)", background: "var(--color-surface-2)" }}>
          <button
            onClick={() => setActiveTab("receivables")}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${activeTab === 'receivables' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeTab === 'receivables' ? "var(--color-surface)" : "transparent",
              color: activeTab === 'receivables' ? "var(--color-text-primary)" : "var(--color-text-muted)"
            }}
          >
            Receivables ({receivables.length})
          </button>
          <button
            onClick={() => setActiveTab("payables")}
            className={`flex-1 text-sm font-medium py-2 rounded-md transition-all ${activeTab === 'payables' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeTab === 'payables' ? "var(--color-surface)" : "transparent",
              color: activeTab === 'payables' ? "var(--color-text-primary)" : "var(--color-text-muted)"
            }}
          >
            Payables ({payables.length})
          </button>
        </div>

        {/* ── Debts List ─────────────────────────────────── */}
        <section aria-label={`${activeTab} list`}>
          <AnimatePresence mode="wait">
            {currentList.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="empty-state mt-4"
              >
                <Users
                  size={40}
                  style={{ color: "var(--color-text-muted)" }}
                  aria-hidden="true"
                />
                <p
                  className="text-sm font-medium mt-3"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  No {activeTab} defined.
                </p>
                <button
                  className="btn btn-outline btn-sm mt-3"
                  onClick={() => openModal({ type: "add-debt" })}
                >
                  Add a Record
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial="hidden"
                animate="show"
                exit="hidden"
                className="grid gap-4 mt-4"
                style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}
              >
                {activeDebts.map((debt, i) => (
                  <DebtItem
                    key={debt.id}
                    debt={debt}
                    delay={i * 0.05}
                    onEdit={() => openModal({ type: "edit-debt", payload: debt })}
                    onSettle={() => openModal({ type: "settle-debt", payload: { id: debt.id } })}
                  />
                ))}
                
                {/* Visual Separator for Settled items */}
                {settledDebts.length > 0 && activeDebts.length > 0 && (
                  <div className="col-span-full mt-4 mb-2 flex items-center gap-3">
                    <hr className="flex-1" style={{ borderColor: 'var(--color-border-subtle)' }} />
                    <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-text-muted)' }}>Settled</span>
                    <hr className="flex-1" style={{ borderColor: 'var(--color-border-subtle)' }} />
                  </div>
                )}

                {settledDebts.map((debt, i) => (
                  <DebtItem
                    key={debt.id}
                    debt={debt}
                    delay={i * 0.05}
                    onEdit={() => openModal({ type: "edit-debt", payload: debt })}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <DebtModal />
      <DebtSettleModal />
    </>
  );
}
