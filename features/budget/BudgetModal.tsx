"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { budgetItemSchema, type BudgetItemFormValues } from "@/lib/schemas";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export default function BudgetModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const budgetTemplate = useAppStore((s) => s.budgetTemplate);
  const updateBudgetTemplate = useAppStore((s) => s.updateBudgetTemplate);
  const categories = useAppStore((s) => s.categories);

  const isOpen = modal.type === "add-budget" || modal.type === "edit-budget";
  const isEditing = modal.type === "edit-budget";
  const editPayload = isEditing ? (modal.payload as BudgetItemFormValues) : null;

  // We only budget for expense categories
  const expenseCategories = categories.filter((c) => c.type === "expense" || c.type === "both");

  // Disable categories that already have a budget (unless editing that budget)
  const budgetedCategoryIds = budgetTemplate.items.map((b) => b.categoryId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      categoryId: "",
      amount: 0,
    },
  });

  useEffect(() => {
    if (isOpen && editPayload) {
      reset(editPayload);
    } else if (isOpen) {
      reset({ categoryId: "", amount: 0 });
    }
  }, [isOpen, editPayload, reset]);

  function onSubmit(data: BudgetItemFormValues) {
    const newItems = [...budgetTemplate.items];
    const existingIdx = newItems.findIndex((i) => i.categoryId === data.categoryId);
    
    if (existingIdx >= 0) {
      newItems[existingIdx] = { categoryId: data.categoryId, amount: data.amount };
    } else {
      newItems.push({ categoryId: data.categoryId, amount: data.amount });
    }
    
    updateBudgetTemplate(newItems);
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Budget" : "Set Budget"}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        
        {/* ── Category Select ─────────────────────────────────── */}
        <div>
          <label htmlFor="categoryId" className="input-label">Category</label>
          <select
            id="categoryId"
            className={cn("input select", errors.categoryId && "border-[var(--color-expense)]")}
            {...register("categoryId")}
            disabled={isEditing} // Cannot change category of an existing budget easily
            aria-invalid={errors.categoryId ? "true" : "false"}
          >
            <option value="">Select category…</option>
            {expenseCategories.map((cat) => {
              const isAlreadyBudgeted = budgetedCategoryIds.includes(cat.id);
              const disabled = isAlreadyBudgeted && (!isEditing || editPayload?.categoryId !== cat.id);
              
              return (
                <option key={cat.id} value={cat.id} disabled={disabled}>
                  {cat.name} {disabled ? "(Already budgeted)" : ""}
                </option>
              );
            })}
          </select>
          {errors.categoryId && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.categoryId.message}
            </p>
          )}
        </div>

        {/* ── Amount ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="amount" className="input-label">Monthly Limit (IDR)</label>
          <input
            id="amount"
            type="number"
            min={0}
            step={1000}
            className={cn("input", errors.amount && "border-[var(--color-expense)]")}
            placeholder="0"
            {...register("amount", { valueAsNumber: true })}
            aria-invalid={errors.amount ? "true" : "false"}
          />
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
            {isEditing ? "Save Changes" : "Save Budget"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
