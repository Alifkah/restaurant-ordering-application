import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format minor currency integer (e.g. 50000 -> "Rp 50.000")
 */
export function formatCurrency(
  minorAmount: number,
  currency: string = "IDR",
  currencySymbol: string = "Rp",
  decimals: number = 0
): string {
  const amount = decimals > 0 ? minorAmount / Math.pow(10, decimals) : minorAmount;

  if (currency.toUpperCase() === "IDR") {
    return `${currencySymbol} ${new Intl.NumberFormat("id-ID", {
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals,
    }).format(amount)}`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount);
}
