"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { accountSchema, type AccountFormValues } from "@/lib/schemas";
import Modal from "@/components/ui/Modal";
import { cn } from "@/lib/utils";

// Map types to arbitrary icons/colors for the model
const typeMapping = {
  bank: { icon: "landmark", color: "#3b82f6" },
  cash: { icon: "wallet", color: "#10b981" },
  credit: { icon: "credit-card", color: "#ef4444" },
  investment: { icon: "pie-chart", color: "#8b5cf6" },
  other: { icon: "coins", color: "#f59e0b" },
};

export default function WalletModal() {
  const modal = useAppStore((s) => s.modal);
  const closeModal = useAppStore((s) => s.closeModal);
  const addAccount = useAppStore((s) => s.addAccount);
  const updateAccount = useAppStore((s) => s.updateAccount);

  const isOpen = modal.type === "add-account" || modal.type === "edit-account";
  const isEditing = modal.type === "edit-account";
  const editPayload = isEditing ? (modal.payload as AccountFormValues & { id: string }) : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "cash",
      balance: 0,
    },
  });

  useEffect(() => {
    if (isOpen && editPayload) {
      reset({
        name: editPayload.name,
        type: editPayload.type,
        balance: editPayload.balance,
      });
    } else if (isOpen) {
      reset({
        name: "",
        type: "cash",
        balance: 0,
      });
    }
  }, [isOpen, editPayload, reset]);

  function onSubmit(data: AccountFormValues) {
    const styling = typeMapping[data.type];
    
    if (isEditing && editPayload) {
      updateAccount(editPayload.id, {
        name: data.name,
        type: data.type,
        balance: data.balance,
        color: styling.color,
        icon: styling.icon,
      });
    } else {
      addAccount({
        name: data.name,
        type: data.type,
        balance: data.balance,
        color: styling.color,
        icon: styling.icon,
      });
    }
    closeModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title={isEditing ? "Edit Account" : "Add Account"}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        
        {/* ── Account Name ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="name" className="input-label">Account Name</label>
          <input
            id="name"
            type="text"
            className={cn("input", errors.name && "border-[var(--color-expense)]")}
            placeholder="E.g., BCA Savings, Main Wallet"
            {...register("name")}
          />
          {errors.name && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.name.message}
            </p>
          )}
        </div>

        {/* ── Type ─────────────────────────────────────────── */}
        <div>
          <label htmlFor="type" className="input-label">Account Type</label>
          <select
            id="type"
            className={cn("input select", errors.type && "border-[var(--color-expense)]")}
            {...register("type")}
          >
            <option value="cash">Cash</option>
            <option value="bank">Bank Account</option>
            <option value="credit">Credit Card</option>
            <option value="investment">Investment</option>
            <option value="other">Other</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.type.message}
            </p>
          )}
        </div>

        {/* ── Initial Balance ──────────────────────────────────────────── */}
        <div>
          <label htmlFor="balance" className="input-label">Initial Balance (IDR)</label>
          <input
            id="balance"
            type="number"
            min={0}
            step={100}
            className={cn("input", errors.balance && "border-[var(--color-expense)]")}
            placeholder="0"
            {...register("balance", { valueAsNumber: true })}
          />
          {errors.balance && (
            <p className="mt-1 text-xs" style={{ color: "var(--color-expense)" }}>
              {errors.balance.message}
            </p>
          )}
          {isEditing && (
            <p className="text-[11px] mt-1.5" style={{ color: "var(--color-warning)" }}>
              Note: Manually overriding the balance might desync it from your transaction history.
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
            {isEditing ? "Save Changes" : "Create Account"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
