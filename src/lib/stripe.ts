import Stripe from "stripe";

const apiKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key_for_development";

export const stripe = new Stripe(apiKey, {
  apiVersion: "2025-02-24.acacia" as unknown as Stripe.LatestApiVersion,
  typescript: true,
});

/**
 * List of Stripe zero-decimal currencies (where 1 unit = 1 integer amount in Stripe)
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF",
  "CLP",
  "DJF",
  "GNF",
  "JPY",
  "KMF",
  "KRW",
  "MGA",
  "PYG",
  "RWF",
  "UGX",
  "VND",
  "VUV",
  "XAF",
  "XOF",
  "XPF",
]);

/**
 * Convert minor integer units from database to Stripe amount
 * - IDR in Stripe: Stripe documentation treats IDR as a standard two-decimal currency in some contexts or integer in others.
 *   In standard Stripe API, IDR is 2 decimals (1 IDR = 100 minor subunits, or 50,000 IDR = 5,000,000 cents),
 *   while our database stores prices as full IDR integers (e.g. 50,000).
 * - If currency is zero-decimal: amount is sent directly.
 * - If currency is IDR: Stripe requires minimum amount or standard formatting.
 */
export function convertToStripeAmount(
  amountMinor: number,
  currencyCode: string = "IDR",
  decimals: number = 0
): number {
  const code = currencyCode.toUpperCase();

  if (ZERO_DECIMAL_CURRENCIES.has(code)) {
    return Math.round(amountMinor);
  }

  // If decimals configured in restaurant_settings is 0 (like IDR in standard Indonesian stores):
  // For Stripe checkout with IDR, Stripe's minimum charge is Rp 10.000, and Stripe expects nominal * 100 if decimalized,
  // or nominal directly if zero-decimal.
  if (decimals === 0 && code !== "USD" && code !== "EUR" && code !== "SGD") {
    // For IDR, Stripe expects value in subunits (e.g. Rp 50.000 -> 5000000) or direct integer depending on account mode.
    // In Stripe API standard, IDR has 2 decimals:
    return Math.round(amountMinor * 100);
  }

  return Math.round(amountMinor);
}
