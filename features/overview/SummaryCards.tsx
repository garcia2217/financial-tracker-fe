"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Percent,
} from "lucide-react";
import { formatIDR } from "@/lib/utils";

interface SummaryCardsProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  savingsRate: number; // percentage 0–100
}

interface CardConfig {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  accentVar: string;
  bgVar: string;
  positive?: boolean;
}

export default function SummaryCards({
  totalBalance,
  monthlyIncome,
  monthlyExpenses,
  savingsRate,
}: SummaryCardsProps) {
  const netFlow = monthlyIncome - monthlyExpenses;

  const cards: CardConfig[] = [
    {
      label: "Total Balance",
      value: formatIDR(totalBalance),
      sub: "Across all accounts",
      icon: Wallet,
      accentVar: "var(--color-primary)",
      bgVar: "var(--color-primary-bg)",
    },
    {
      label: "Monthly Income",
      value: formatIDR(monthlyIncome),
      sub: "This month",
      icon: TrendingUp,
      accentVar: "var(--color-income)",
      bgVar: "var(--color-income-bg)",
      positive: true,
    },
    {
      label: "Monthly Expenses",
      value: formatIDR(monthlyExpenses),
      sub: `Net flow: ${netFlow >= 0 ? "+" : ""}${formatIDR(netFlow)}`,
      icon: TrendingDown,
      accentVar: "var(--color-expense)",
      bgVar: "var(--color-expense-bg)",
      positive: false,
    },
    {
      label: "Savings Rate",
      value: `${savingsRate.toFixed(1)}%`,
      sub: savingsRate >= 20 ? "Great job! 🎉" : "Try to save more",
      icon: Percent,
      accentVar: savingsRate >= 20 ? "var(--color-income)" : "var(--color-warning)",
      bgVar: savingsRate >= 20 ? "var(--color-income-bg)" : "var(--color-warning-bg)",
    },
  ];

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}
    >
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: i * 0.08,
              ease: [0.4, 0, 0.2, 1],
            }}
            className="card card-hover p-5 flex flex-col gap-4"
          >
            {/* Icon + Label row */}
            <div className="flex items-center justify-between">
              <p
                className="label"
                style={{ color: "var(--color-text-muted)" }}
              >
                {card.label}
              </p>
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 36,
                  height: 36,
                  background: card.bgVar,
                }}
              >
                <Icon size={16} style={{ color: card.accentVar }} aria-hidden="true" />
              </div>
            </div>

            {/* Value */}
            <div>
              <p
                className="heading-2 leading-none"
                style={{ color: card.accentVar }}
              >
                {card.value}
              </p>
              <p
                className="mt-1.5 text-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                {card.sub}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
