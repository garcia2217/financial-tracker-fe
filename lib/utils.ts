import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as Indonesian Rupiah (IDR).
 * e.g. 1250000 → "Rp 1.250.000"
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format a date to a readable string in Indonesian locale.
 * e.g. 2024-03-15 → "15 Mar 2024"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

/**
 * Format a date to a month-year string.
 * e.g. 2024-03-15 → "Maret 2024"
 */
export function formatMonthYear(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(d);
}

/**
 * Get a month key string from a Date (YYYY-MM).
 */
export function getMonthKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * Calculate the percentage with a safe division-by-zero guard.
 */
export function safePercent(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return Math.min(100, Math.round((numerator / denominator) * 100));
}
