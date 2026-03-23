"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Wallet, ShieldCheck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { formatIDR } from "@/lib/utils";
import PageHeader from "@/features/layout/PageHeader";
import WalletCard from "@/features/wallets/WalletCard";
import WalletModal from "@/features/wallets/WalletModal";

export default function WalletsPage() {
  const accounts = useAppStore((s) => s.accounts);
  const openModal = useAppStore((s) => s.openModal);

  // Grouping & Calculating Sums
  const { totalNetWorth, cashTotal, bankTotal, creditTotal } = useMemo(() => {
    let cash = 0, bank = 0, credit = 0;
    for (const acc of accounts) {
      if (acc.type === "cash") cash += acc.balance;
      else if (acc.type === "bank" || acc.type === "investment") bank += acc.balance;
      else if (acc.type === "credit") credit += acc.balance;
      else cash += acc.balance; // other
    }
    // Simplistic Net Worth computation (Assets minus Liabilities/Credit)
    const net = (cash + bank) - credit; 
    return { totalNetWorth: net, cashTotal: cash, bankTotal: bank, creditTotal: credit };
  }, [accounts]);

  return (
    <>
      <div className="p-6 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <PageHeader
          title="Wallets & Accounts"
          description="Manage your bank accounts, cash wallets, cards, and overall balances."
          action={
            <button
              className="btn btn-primary btn-md gap-2"
              onClick={() => openModal({ type: "add-account" })}
            >
              <Plus size={16} />
              Add Account
            </button>
          }
        />

        {/* ── Global Net Worth Summary ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="card overflow-hidden"
        >
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6" style={{ background: "linear-gradient(135deg, var(--color-surface), var(--color-surface-2))" }}>
            <div className="flex gap-4 items-center">
              <div className="rounded-full p-3 flex items-center justify-center" style={{ background: "color-mix(in srgb, var(--color-primary) 15%, transparent)" }}>
                <ShieldCheck size={32} style={{ color: "var(--color-primary)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--color-text-muted)" }}>
                  Total Net Worth
                </p>
                <p className="text-3xl sm:text-4xl font-bold mt-1 tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                  {formatIDR(totalNetWorth)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 divide-x border-t" style={{ borderColor: "var(--color-border-subtle)", background: "var(--color-surface)" }}>
            <div className="p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Cash</p>
              <p className="font-bold sm:text-lg" style={{ color: "var(--color-text-primary)" }}>{formatIDR(cashTotal)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Bank & Inv</p>
              <p className="font-bold sm:text-lg" style={{ color: "var(--color-text-primary)" }}>{formatIDR(bankTotal)}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--color-text-muted)" }}>Credit</p>
              <p className="font-bold sm:text-lg" style={{ color: "var(--color-expense)" }}>{formatIDR(creditTotal)}</p>
            </div>
          </div>
        </motion.div>

        {/* ── Wallets Grid ─────────────────────────────────── */}
        {accounts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="empty-state mt-4"
          >
            <Wallet size={40} style={{ color: "var(--color-text-muted)" }} />
            <p className="text-sm font-medium mt-3" style={{ color: "var(--color-text-secondary)" }}>
              No accounts created yet.
            </p>
            <button
              className="btn btn-outline btn-sm mt-3"
              onClick={() => openModal({ type: "add-account" })}
            >
              Add Account
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="show"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4"
          >
            {accounts.map((account, i) => (
              <WalletCard
                key={account.id}
                account={account}
                delay={i * 0.05}
                onEdit={() => openModal({ type: "edit-account", payload: account })}
              />
            ))}
          </motion.div>
        )}
      </div>

      <WalletModal />
    </>
  );
}
