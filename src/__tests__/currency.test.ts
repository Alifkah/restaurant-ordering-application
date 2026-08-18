import assert from "node:assert/strict";

const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "IDR", "JPY", "KMF", "KRW",
  "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF",
]);

export function isZeroDecimalCurrency(currency: string): boolean {
  return ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase());
}

export function toStripeAmount(amountMinor: number, currency: string): number {
  if (isZeroDecimalCurrency(currency)) {
    return Math.round(amountMinor);
  }
  return Math.round(amountMinor);
}

export function formatCurrencyTest(
  amountMinor: number,
  currency: string = "IDR",
  locale: string = "id-ID"
): string {
  const isZero = isZeroDecimalCurrency(currency);
  const majorAmount = isZero ? amountMinor : amountMinor / 100;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: isZero ? 0 : 2,
    maximumFractionDigits: isZero ? 0 : 2,
  }).format(majorAmount);
}

export async function runCurrencyTests() {
  console.log("▶ [TEST SUITE] Currency & Multi-Subunit Stripe Helpers");

  // Test 1: Zero decimal identification
  {
    assert.equal(isZeroDecimalCurrency("IDR"), true);
    assert.equal(isZeroDecimalCurrency("JPY"), true);
    assert.equal(isZeroDecimalCurrency("USD"), false);
    assert.equal(isZeroDecimalCurrency("EUR"), false);
    assert.equal(isZeroDecimalCurrency("SGD"), false);
    console.log("  ✔ isZeroDecimalCurrency: correctly identifies IDR/JPY vs USD/EUR/SGD");
  }

  // Test 2: Stripe unit amount conversions
  {
    const idrAmount = 150000; // 150,000 IDR
    assert.equal(toStripeAmount(idrAmount, "IDR"), 150000);

    const usdAmountInCents = 2550; // $25.50
    assert.equal(toStripeAmount(usdAmountInCents, "USD"), 2550);
    console.log("  ✔ toStripeAmount: handles IDR zero-decimal and USD 2-decimal cents");
  }

  // Test 3: Intl.NumberFormat localized output
  {
    const idrFormatted = formatCurrencyTest(95000, "IDR", "id-ID");
    assert.match(idrFormatted, /Rp\s*95\.000/);

    const usdFormatted = formatCurrencyTest(1999, "USD", "en-US");
    assert.match(usdFormatted, /\$19\.99/);
    console.log("  ✔ formatCurrencyTest: correctly produces formatted string with symbols");
  }
}
