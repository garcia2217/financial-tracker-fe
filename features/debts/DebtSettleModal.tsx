"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { debtSettlementSchema, type DebtSettlementFormValues } from "@/lib/schemas";
import Modal from "@/components/ui/Modal";
import { cn, formatIDR } from "@/lib/utils";

export default function DebtSettleModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const settleDebt = useAppStore((s) => s.settleDebt);
  const debts = useAppStore((s) => s.debts);

  const isOpen = modal.type === "settle-debt";
  const debtId = isOpen ? (modal.payload as { id: string })?.id : null;
  
  const debt = debts.find((d) => d.id === debtId);
  const remaining = debt ? debt.originalAmount - debt.settledAmount : 0;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<DebtSettlementFormValues>({
    resolver: zodResolver(debtSettlementSchema),
    defaultValues: { amount: 0 },
  });

  useEffect(() => {
    if (isOpen) reset({ amount: 0 });
  }, [isOpen, reset]);

  function onSubmit(data: DebtSettlementFormValues) {
    if (debtId) {
      settleDebt(debtId, data.amount);
    }
    closeModal();
  }

  function handleSettleFull() {
    setValue("amount", remaining, { shouldValidate: true });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={"Settle Debt"}
    >
      <div className="mb-6">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          How much was paid for <strong style={{ color: "var(--color-text-primary)" }}>{debt?.personName}</strong>?
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          Remaining balance: <span className="font-semibold">{formatIDR(remaining)}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div>
          <label htmlFor="amount" className="input-label">Amount Paid</label>
          <div className="relative">
            <input
              id="amount"
              type="number"
              min={1}
              step={500}
              className={cn("input pr-16", errors.amount && "border-[var(--color-expense)]")}
              placeholder="0"
              {...register("amount", { valueAsNumber: true })}
              aria-invalid={errors.amount ? "true" : "false"}
            />
            <button
              type="button"
              onClick={handleSettleFull}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold px-2 py-1 rounded"
              style={{ background: "var(--color-surface-2)", color: "var(--color-primary)" }}
            >
              FULL
            </button>
          </div>
          {errors.amount && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div
          className="flex gap-3 pt-2 mt-2"
          style={{ borderTop: "1px solid var(--color-border-muted)" }}
        >
          <button
            type="button"
            onClick={closeModal}
            className="btn btn-outline btn-md flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-md flex-1"
          >
            Record Payment
          </button>
        </div>
      </form>
    </Modal>
  );
}
