"use client";

import { motion } from "framer-motion";
import { formatIDR } from "@/lib/utils";
import { Account } from "@/types";
import { PenLine, Landmark, Wallet, CreditCard, PieChart, Coins } from "lucide-react";

interface WalletCardProps {
  account: Account;
  delay?: number;
  onEdit?: () => void;
}

const typeConfig = {
  bank: { icon: Landmark, color: "var(--color-primary)" },
  cash: { icon: Wallet, color: "var(--color-income)" },
  credit: { icon: CreditCard, color: "var(--color-expense)" },
  investment: { icon: PieChart, color: "var(--color-accent-purple, #8b5cf6)" },
  other: { icon: Coins, color: "var(--color-warning)" },
};

export default function WalletCard({ account, delay = 0, onEdit }: WalletCardProps) {
  const IconRender = typeConfig[account.type]?.icon || Coins;
  const colorRender = typeConfig[account.type]?.color || "var(--color-primary)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.4, 0, 0.2, 1] }}
      className="card p-5 group transition-all hover:border-[var(--color-border-hover)]"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div
            className="flex items-center justify-center rounded-2xl"
            style={{ width: 48, height: 48, background: `color-mix(in srgb, ${colorRender} 15%, transparent)` }}
          >
            <IconRender size={24} style={{ color: colorRender }} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
              {account.name}
            </h3>
            <p className="text-xs uppercase tracking-wider font-medium mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {account.type}
            </p>
          </div>
        </div>
        
        {onEdit && (
          <button
            onClick={onEdit}
            className="btn btn-ghost btn-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Edit Account"
          >
            <PenLine size={16} />
          </button>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>Current Balance</p>
        <p className="text-2xl font-bold mt-1 tracking-tight" style={{ color: "var(--color-text-primary)" }}>
          {formatIDR(account.balance)}
        </p>
      </div>
    </motion.div>
  );
}
