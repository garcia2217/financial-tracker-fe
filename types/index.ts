// ─── Enums / Discriminated Unions ────────────────────────────────────────────

export type TransactionType = "income" | "expense" | "transfer";

export type DebtDirection = "lent" | "borrowed"; // lent = receivable, borrowed = payable

export type AccountType = "bank" | "cash" | "ewallet" | "investment";

export type DebtStatus = "active" | "settled" | "partially_settled";

// ─── Account (Wallet) ─────────────────────────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  /** Current balance in IDR (derived from initial + all transactions) */
  balance: number;
  /** Color accent for UI (hex or tailwind color name) */
  color: string;
  /** Icon name from lucide-react */
  icon: string;
  createdAt: string; // ISO 8601
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  type: TransactionType | "both"; // 'both' = usable for income & expense
  /** Lucide icon name */
  icon: string;
  color: string;
  isDefault: boolean;
}

// ─── Transaction ─────────────────────────────────────────────────────────────

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number; // IDR, always positive
  date: string; // ISO 8601
  categoryId: string;
  accountId: string;
  /** For transfers: the destination account ID */
  toAccountId?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetItem {
  categoryId: string;
  amount: number; // IDR
}

/** The global template that repeats each month */
export interface BudgetTemplate {
  id: string;
  items: BudgetItem[];
  updatedAt: string;
}

/** A per-month override — only the categories that differ from the template */
export interface MonthlyBudgetOverride {
  id: string;
  /** Format: YYYY-MM */
  monthKey: string;
  items: BudgetItem[];
  updatedAt: string;
}

/** Resolved budget for a specific month (template merged with override) */
export interface ResolvedMonthlyBudget {
  monthKey: string;
  items: BudgetItem[];
}

// ─── Debt / Credit ────────────────────────────────────────────────────────────

export interface DebtRecord {
  id: string;
  direction: DebtDirection;
  personName: string;
  originalAmount: number; // IDR
  settledAmount: number; // IDR (cumulative payments)
  status: DebtStatus;
  description?: string;
  dueDate?: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

// ─── Aggregate / Derived Types ────────────────────────────────────────────────

export interface AccountSummary {
  totalAssets: number;
  totalLiabilities: number; // outstanding debts (borrowed)
  totalReceivables: number; // outstanding debts lent to others
  netWorth: number; // assets + receivables - liabilities
}

export interface MonthlySummary {
  monthKey: string;
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number; // percentage
  netFlow: number; // income - expenses
}

export interface BudgetProgress {
  categoryId: string;
  budgeted: number;
  actual: number;
  percentage: number;
  remaining: number;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export type ModalType =
  | "add-transaction"
  | "edit-transaction"
  | "add-debt"
  | "edit-debt"
  | "add-account"
  | "edit-account"
  | "edit-budget"
  | null;

export interface ModalState {
  type: ModalType;
  payload?: unknown;
}
