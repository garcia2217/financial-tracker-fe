"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { debtSchema, type DebtFormValues } from "@/lib/schemas";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

export default function DebtModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addDebt = useAppStore((s) => s.addDebt);
  const updateDebt = useAppStore((s) => s.updateDebt);

  const isOpen = modal.type === "add-debt" || modal.type === "edit-debt";
  const isEditing = modal.type === "edit-debt";
  const editPayload = isEditing ? (modal.payload as DebtFormValues & { id: string }) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DebtFormValues>({
    resolver: zodResolver(debtSchema),
    defaultValues: {
      direction: "lent",
      personName: "",
      originalAmount: 0,
      description: "",
      dueDate: "",
    },
  });

  useEffect(() => {
    if (isOpen && editPayload) {
      reset({
        direction: editPayload.direction,
        personName: editPayload.personName,
        originalAmount: editPayload.originalAmount,
        description: editPayload.description || "",
        dueDate: editPayload.dueDate ? editPayload.dueDate.split("T")[0] : "",
      });
    } else if (isOpen) {
      reset({
        direction: "lent",
        personName: "",
        originalAmount: 0,
        description: "",
        dueDate: "",
      });
    }
  }, [isOpen, editPayload, reset]);

  function onSubmit(data: DebtFormValues) {
    // Format date properly if provided (or undefined if empty)
    const formattedData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : undefined,
    };

    if (isEditing && editPayload) {
      updateDebt(editPayload.id, formattedData);
    } else {
      addDebt(formattedData);
    }
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Debt Record" : "Add Debt Record"}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        
        {/* ── Direction ─────────────────────────────────────────── */}
        <div>
          <label htmlFor="direction" className="input-label">Type</label>
          <select
            id="direction"
            className={cn("input select", errors.direction && "border-[var(--color-expense)]")}
            {...register("direction")}
            aria-invalid={errors.direction ? "true" : "false"}
            disabled={isEditing}
          >
            <option value="lent">I lent money (Receivable)</option>
            <option value="borrowed">I borrowed money (Payable)</option>
          </select>
          {errors.direction && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.direction.message}
            </p>
          )}
        </div>

        {/* ── Person Name ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="personName" className="input-label">Person / Entity Name</label>
          <input
            id="personName"
            type="text"
            className={cn("input", errors.personName && "border-[var(--color-expense)]")}
            placeholder="E.g., John Doe"
            {...register("personName")}
            aria-invalid={errors.personName ? "true" : "false"}
          />
          {errors.personName && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.personName.message}
            </p>
          )}
        </div>

        {/* ── Amount ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="originalAmount" className="input-label">Amount (IDR)</label>
          <input
            id="originalAmount"
            type="number"
            min={0}
            step={1000}
            className={cn("input", errors.originalAmount && "border-[var(--color-expense)]")}
            placeholder="0"
            {...register("originalAmount", { valueAsNumber: true })}
            aria-invalid={errors.originalAmount ? "true" : "false"}
          />
          {errors.originalAmount && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.originalAmount.message}
            </p>
          )}
        </div>

        {/* ── Optional: Due Date & Description ────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="dueDate" className="input-label">Due Date (Optional)</label>
            <input
              id="dueDate"
              type="date"
              className="input"
              {...register("dueDate")}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="input-label">Description (Optional)</label>
          <input
            id="description"
            type="text"
            className="input"
            placeholder="Dinner split, repair cost, etc."
            {...register("description")}
          />
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
            {isEditing ? "Save Changes" : "Save Record"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
