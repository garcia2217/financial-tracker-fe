"use client";

import { motion } from "framer-motion";
import { formatIDR } from "@/lib/utils";
import { DebtRecord } from "@/types";
import { CheckCircle2, ChevronRight, PenLine, CreditCard } from "lucide-react";

interface DebtItemProps {
  debt: DebtRecord;
  delay?: number;
  onEdit?: () => void;
  onSettle?: () => void;
}

export default function DebtItem({ debt, delay = 0, onEdit, onSettle }: DebtItemProps) {
  const isLent = debt.direction === "lent";
  const remaining = debt.originalAmount - debt.settledAmount;
  const percentage = Math.min((debt.settledAmount / debt.originalAmount) * 100, 100);
  const isSettled = debt.status === "settled";

  // Color schemes
  const barColor = isSettled 
    ? "var(--color-primary)" 
    : (isLent ? "var(--color-primary)" : "var(--color-warning)");
  
  const bgColor = isSettled 
    ? "var(--color-primary-bg)" 
    : (isLent ? "var(--color-primary-bg)" : "var(--color-warning-bg)");

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className={`card p-5 group transition-colors flex flex-col gap-4 ${isSettled ? 'opacity-80 grayscale-[0.2]' : ''}`}
      style={{
        border: `1px solid ${isSettled ? 'var(--color-border-muted)' : (isLent ? 'var(--color-primary-bg)' : 'var(--color-warning-bg)')}`
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl font-bold"
            style={{
              width: 40,
              height: 40,
              background: bgColor,
              color: barColor,
            }}
            aria-hidden="true"
          >
            {debt.personName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
              {debt.personName}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {isLent ? "You lent them" : "You borrowed"} 
              {debt.description && <span className="opacity-70"> • {debt.description}</span>}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {!isSettled && onSettle && (
            <button 
              onClick={onSettle}
              className="btn btn-primary btn-sm px-3 flex items-center gap-1.5"
            >
              <CreditCard size={14} />
              <span className="hidden sm:inline">Pay</span>
            </button>
          )}
          {onEdit && (
            <button 
              onClick={onEdit}
              className="btn btn-ghost btn-sm p-2"
              aria-label="Edit Debt"
            >
              <PenLine size={16} />
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>
            {isSettled ? "Fully settled" : `${formatIDR(remaining)} left to pay`}
          </p>
          {debt.dueDate && !isSettled && (
            <p className="text-[11px] mt-1" style={{ color: "var(--color-text-muted)" }}>
              Due: {new Date(debt.dueDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-sm" style={{ color: "var(--color-text-primary)" }}>
            {formatIDR(debt.originalAmount)}
          </p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            {isSettled && <CheckCircle2 size={12} style={{ color: "var(--color-primary)" }} />}
            <p className="text-[11px] font-medium" style={{ color: isSettled ? "var(--color-primary)" : "var(--color-text-muted)" }}>
              {Math.round(percentage)}% settled
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div
        className="h-1.5 w-full rounded-full overflow-hidden mt-1"
        style={{ background: "var(--color-surface-3)" }}
        aria-hidden="true"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, delay: delay + 0.1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: barColor }}
        />
      </div>
    </motion.div>
  );
}
