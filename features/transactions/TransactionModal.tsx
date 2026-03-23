"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { transactionSchema, type TransactionFormValues } from "@/lib/schemas";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

type TransactionType = "income" | "expense" | "transfer";

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: "income", label: "Income", color: "var(--color-income)" },
  { value: "expense", label: "Expense", color: "var(--color-expense)" },
  { value: "transfer", label: "Transfer", color: "var(--color-transfer)" },
];

export default function TransactionModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addTransaction = useAppStore((s) => s.addTransaction);
  const updateTransaction = useAppStore((s) => s.updateTransaction);
  const accounts = useAppStore((s) => s.accounts);
  const categories = useAppStore((s) => s.categories);

  const isOpen =
    modal.type === "add-transaction" || modal.type === "edit-transaction";
  const isEditing = modal.type === "edit-transaction";
  const editPayload = isEditing ? (modal.payload as TransactionFormValues & { id: string }) : null;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "expense",
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      categoryId: "",
      accountId: "",
      toAccountId: "",
      note: "",
    },
  });

  const selectedType = watch("type");

  // Populate form when editing
  useEffect(() => {
    if (isOpen && editPayload) {
      reset(editPayload);
    } else if (isOpen) {
      reset({
        type: "expense",
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        categoryId: "",
        accountId: "",
        toAccountId: "",
        note: "",
      });
    }
  }, [isOpen, editPayload, reset]);

  const filteredCategories = categories.filter(
    (c) => c.type === selectedType || c.type === "both"
  );

  function onSubmit(data: TransactionFormValues) {
    if (isEditing && editPayload) {
      updateTransaction(editPayload.id, data);
    } else {
      addTransaction({
        ...data,
        toAccountId: data.type === "transfer" ? data.toAccountId : undefined,
      });
    }
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Transaction" : "Add Transaction"}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">

        {/* ── Type selector ─────────────────────────────────── */}
        <div>
          <label className="input-label">Type</label>
          <div className="flex gap-2">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  setValue("type", opt.value, { shouldValidate: true });
                  setValue("categoryId", "");
                }}
                className={cn(
                  "flex-1 rounded-xl py-2 text-sm font-medium transition-all duration-150",
                  selectedType === opt.value
                    ? "text-white"
                    : "text-[var(--color-text-muted)] bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)]"
                )}
                style={
                  selectedType === opt.value
                    ? { background: opt.color, boxShadow: `0 0 0 1px ${opt.color}` }
                    : {}
                }
                aria-pressed={selectedType === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Amount ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="amount" className="input-label">Amount (IDR)</label>
          <input
            id="amount"
            type="number"
            min={0}
            step={1000}
            className={cn("input", errors.amount && "border-[var(--color-expense)]")}
            placeholder="0"
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.amount.message}
            </p>
          )}
        </div>

        {/* ── Date ────────────────────────────────────────────── */}
        <div>
          <label htmlFor="date" className="input-label">Date</label>
          <input
            id="date"
            type="date"
            className={cn("input", errors.date && "border-[var(--color-expense)]")}
            {...register("date")}
          />
          {errors.date && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.date.message}
            </p>
          )}
        </div>

        {/* ── Category ────────────────────────────────────────── */}
        <div>
          <label htmlFor="categoryId" className="input-label">Category</label>
          <select
            id="categoryId"
            className={cn("input select", errors.categoryId && "border-[var(--color-expense)]")}
            {...register("categoryId")}
          >
            <option value="">Select category…</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* ── Account ─────────────────────────────────────────── */}
        <div>
          <label htmlFor="accountId" className="input-label">
            {selectedType === "transfer" ? "From Account" : "Account"}
          </label>
          <select
            id="accountId"
            className={cn("input select", errors.accountId && "border-[var(--color-expense)]")}
            {...register("accountId")}
          >
            <option value="">Select account…</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
          {errors.accountId && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.accountId.message}
            </p>
          )}
        </div>

        {/* ── To Account (Transfer only) ───────────────────────── */}
        {selectedType === "transfer" && (
          <div>
            <label htmlFor="toAccountId" className="input-label">To Account</label>
            <select
              id="toAccountId"
              className={cn("input select", errors.toAccountId && "border-[var(--color-expense)]")}
              {...register("toAccountId")}
            >
              <option value="">Select destination…</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
            {errors.toAccountId && (
              <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
                {errors.toAccountId.message}
              </p>
            )}
          </div>
        )}

        {/* ── Note ─────────────────────────────────────────────── */}
        <div>
          <label htmlFor="note" className="input-label">Note (optional)</label>
          <input
            id="note"
            type="text"
            className="input"
            placeholder="e.g. Lunch with client"
            {...register("note")}
          />
        </div>

        {/* ── Actions ──────────────────────────────────────────── */}
        <div
          className="flex gap-3 pt-2"
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
            {isEditing ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
