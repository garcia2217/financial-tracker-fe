"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import type {
  Account,
  Category,
  Transaction,
  BudgetTemplate,
  MonthlyBudgetOverride,
  DebtRecord,
  ModalState,
  ResolvedMonthlyBudget,
} from "@/types";
import {
  MOCK_ACCOUNTS,
  MOCK_CATEGORIES,
  MOCK_TRANSACTIONS,
  MOCK_BUDGET_TEMPLATE,
  MOCK_BUDGET_OVERRIDES,
  MOCK_DEBTS,
} from "@/lib/mock-data";
import { getMonthKey } from "@/lib/utils";

// ─── State shape ──────────────────────────────────────────────────────────────

interface AppState {
  // Data
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  budgetTemplate: BudgetTemplate;
  budgetOverrides: MonthlyBudgetOverride[];
  debts: DebtRecord[];

  // UI
  modal: ModalState;
  activeMonth: string; // YYYY-MM

  // ─── Selectors (computed from state) ───────────────────────────────────────
  getAccountById: (id: string) => Account | undefined;
  getCategoryById: (id: string) => Category | undefined;
  getTransactionsByMonth: (monthKey: string) => Transaction[];
  getResolvedBudget: (monthKey: string) => ResolvedMonthlyBudget;

  // ─── Mutations ─────────────────────────────────────────────────────────────

  // Transactions
  addTransaction: (t: Omit<Transaction, "id" | "createdAt" | "updatedAt">) => void;
  updateTransaction: (id: string, t: Partial<Omit<Transaction, "id" | "createdAt">>) => void;
  deleteTransaction: (id: string) => void;

  // Accounts
  addAccount: (a: Omit<Account, "id" | "createdAt">) => void;
  updateAccount: (id: string, a: Partial<Omit<Account, "id" | "createdAt">>) => void;
  deleteAccount: (id: string) => void;

  // Categories
  addCategory: (c: Omit<Category, "id" | "isDefault">) => void;
  updateCategory: (id: string, c: Partial<Omit<Category, "id">>) => void;
  deleteCategory: (id: string) => void;

  // Budget
  updateBudgetTemplate: (items: BudgetTemplate["items"]) => void;
  setMonthlyOverride: (monthKey: string, items: MonthlyBudgetOverride["items"]) => void;

  // Debts
  addDebt: (d: Omit<DebtRecord, "id" | "settledAmount" | "status" | "createdAt" | "updatedAt">) => void;
  updateDebt: (id: string, d: Partial<Omit<DebtRecord, "id" | "createdAt">>) => void;
  settleDebt: (id: string, amount: number) => void;
  deleteDebt: (id: string) => void;

  // UI
  openModal: (modal: ModalState) => void;
  closeModal: () => void;
  setActiveMonth: (monthKey: string) => void;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  devtools(
    immer((set, get) => ({
      // ── Initial Data ──────────────────────────────────────────────────────
      accounts: MOCK_ACCOUNTS,
      categories: MOCK_CATEGORIES,
      transactions: MOCK_TRANSACTIONS,
      budgetTemplate: MOCK_BUDGET_TEMPLATE,
      budgetOverrides: MOCK_BUDGET_OVERRIDES,
      debts: MOCK_DEBTS,

      // ── UI ────────────────────────────────────────────────────────────────
      modal: { type: null },
      activeMonth: getMonthKey(new Date()),

      // ── Selectors ─────────────────────────────────────────────────────────

      getAccountById: (id) => get().accounts.find((a) => a.id === id),

      getCategoryById: (id) => get().categories.find((c) => c.id === id),

      getTransactionsByMonth: (monthKey) =>
        get().transactions.filter((t) => t.date.startsWith(monthKey)),

      getResolvedBudget: (monthKey): ResolvedMonthlyBudget => {
        const template = get().budgetTemplate;
        const override = get().budgetOverrides.find((o) => o.monthKey === monthKey);

        if (!override) {
          return { monthKey, items: template.items };
        }

        // Merge: override items take precedence over template
        const merged = [...template.items];
        for (const overrideItem of override.items) {
          const idx = merged.findIndex((i) => i.categoryId === overrideItem.categoryId);
          if (idx >= 0) {
            merged[idx] = overrideItem;
          } else {
            merged.push(overrideItem);
          }
        }
        return { monthKey, items: merged };
      },

      // ── Transaction Mutations ─────────────────────────────────────────────

      addTransaction: (t) => {
        set((state) => {
          const newTxn: Transaction = {
            ...t,
            id: generateId("txn"),
            createdAt: nowISO(),
            updatedAt: nowISO(),
          };
          state.transactions.unshift(newTxn);

          // Adjust account balances
          const account = state.accounts.find((a) => a.id === t.accountId);
          if (account) {
            if (t.type === "income") account.balance += t.amount;
            else if (t.type === "expense") account.balance -= t.amount;
            else if (t.type === "transfer") {
              account.balance -= t.amount;
              const toAccount = state.accounts.find((a) => a.id === t.toAccountId);
              if (toAccount) toAccount.balance += t.amount;
            }
          }
        });
      },

      updateTransaction: (id, updates) => {
        set((state) => {
          const idx = state.transactions.findIndex((t) => t.id === id);
          if (idx >= 0) {
            state.transactions[idx] = {
              ...state.transactions[idx],
              ...updates,
              updatedAt: nowISO(),
            };
          }
        });
      },

      deleteTransaction: (id) => {
        set((state) => {
          state.transactions = state.transactions.filter((t) => t.id !== id);
        });
      },

      // ── Account Mutations ─────────────────────────────────────────────────

      addAccount: (a) => {
        set((state) => {
          state.accounts.push({
            ...a,
            id: generateId("acc"),
            createdAt: nowISO(),
          });
        });
      },

      updateAccount: (id, updates) => {
        set((state) => {
          const idx = state.accounts.findIndex((a) => a.id === id);
          if (idx >= 0) {
            state.accounts[idx] = { ...state.accounts[idx], ...updates };
          }
        });
      },

      deleteAccount: (id) => {
        set((state) => {
          state.accounts = state.accounts.filter((a) => a.id !== id);
        });
      },

      // ── Category Mutations ────────────────────────────────────────────────

      addCategory: (c) => {
        set((state) => {
          state.categories.push({
            ...c,
            id: generateId("cat"),
            isDefault: false,
          });
        });
      },

      updateCategory: (id, updates) => {
        set((state) => {
          const idx = state.categories.findIndex((c) => c.id === id);
          if (idx >= 0) {
            state.categories[idx] = { ...state.categories[idx], ...updates };
          }
        });
      },

      deleteCategory: (id) => {
        set((state) => {
          state.categories = state.categories.filter((c) => c.id !== id);
        });
      },

      // ── Budget Mutations ──────────────────────────────────────────────────

      updateBudgetTemplate: (items) => {
        set((state) => {
          state.budgetTemplate.items = items;
          state.budgetTemplate.updatedAt = nowISO();
        });
      },

      setMonthlyOverride: (monthKey, items) => {
        set((state) => {
          const idx = state.budgetOverrides.findIndex((o) => o.monthKey === monthKey);
          if (idx >= 0) {
            state.budgetOverrides[idx].items = items;
            state.budgetOverrides[idx].updatedAt = nowISO();
          } else {
            state.budgetOverrides.push({
              id: generateId("mbo"),
              monthKey,
              items,
              updatedAt: nowISO(),
            });
          }
        });
      },

      // ── Debt Mutations ────────────────────────────────────────────────────

      addDebt: (d) => {
        set((state) => {
          state.debts.push({
            ...d,
            id: generateId("debt"),
            settledAmount: 0,
            status: "active",
            createdAt: nowISO(),
            updatedAt: nowISO(),
          });
        });
      },

      updateDebt: (id, updates) => {
        set((state) => {
          const idx = state.debts.findIndex((d) => d.id === id);
          if (idx >= 0) {
            state.debts[idx] = { ...state.debts[idx], ...updates, updatedAt: nowISO() };
            // Auto re-evaluate status in case amount was changed
            if (state.debts[idx].settledAmount >= state.debts[idx].originalAmount) {
              state.debts[idx].status = "settled";
            } else if (state.debts[idx].settledAmount > 0) {
              state.debts[idx].status = "partially_settled";
            } else {
              state.debts[idx].status = "active";
            }
          }
        });
      },

      settleDebt: (id, amount) => {
        set((state) => {
          const debt = state.debts.find((d) => d.id === id);
          if (debt) {
            debt.settledAmount = Math.min(
              debt.originalAmount,
              debt.settledAmount + amount
            );
            if (debt.settledAmount >= debt.originalAmount) {
              debt.status = "settled";
            } else {
              debt.status = "partially_settled";
            }
            debt.updatedAt = nowISO();
          }
        });
      },

      deleteDebt: (id) => {
        set((state) => {
          state.debts = state.debts.filter((d) => d.id !== id);
        });
      },

      // ── UI Mutations ──────────────────────────────────────────────────────

      openModal: (modal) => set({ modal }),
      closeModal: () => set({ modal: { type: null } }),
      setActiveMonth: (monthKey) => set({ activeMonth: monthKey }),
    })),
    { name: "FinancialTrackerStore" }
  )
);
