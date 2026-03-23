import { z } from "zod";

// ─── Transaction ─────────────────────────────────────────────────────────────

export const transactionSchema = z
  .object({
    type: z.enum(["income", "expense", "transfer"]),
    amount: z.number().positive("Amount must be a positive number"),
    date: z.string().min(1, "Date is required"),
    categoryId: z.string().min(1, "Category is required"),
    accountId: z.string().min(1, "Account is required"),
    toAccountId: z.string().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "transfer") {
        return !!data.toAccountId && data.toAccountId !== data.accountId;
      }
      return true;
    },
    {
      message: "Transfer requires a different destination account",
      path: ["toAccountId"],
    }
  );

export type TransactionFormValues = z.infer<typeof transactionSchema>;

// ─── Account ─────────────────────────────────────────────────────────────────

export const accountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(50),
  type: z.enum(["bank", "cash", "ewallet", "investment"]),
  balance: z.number().nonnegative("Balance cannot be negative"),
  color: z.string().min(1),
  icon: z.string().min(1),
});

export type AccountFormValues = z.infer<typeof accountSchema>;

// ─── Category ────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(40),
  type: z.enum(["income", "expense", "transfer", "both"]),
  icon: z.string().min(1),
  color: z.string().min(1),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

// ─── Budget ───────────────────────────────────────────────────────────────────

export const budgetItemSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().nonnegative(),
});

export const budgetTemplateSchema = z.object({
  items: z.array(budgetItemSchema),
});

export type BudgetTemplateFormValues = z.infer<typeof budgetTemplateSchema>;

// ─── Debt ─────────────────────────────────────────────────────────────────────

export const debtSchema = z.object({
  direction: z.enum(["lent", "borrowed"]),
  personName: z.string().min(1, "Person name is required").max(100),
  originalAmount: z.number().positive("Amount must be positive"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
});

export type DebtFormValues = z.infer<typeof debtSchema>;

export const debtSettlementSchema = z.object({
  amount: z.number().positive("Settlement amount must be positive"),
});

export type DebtSettlementFormValues = z.infer<typeof debtSettlementSchema>;
