import assert from "node:assert/strict";

/**
 * Pure Calculation logic mirror of domain/order-calculator.ts
 */
export function calculateOrderTotals(
  items: Array<{
    unitPriceMinor: number;
    quantity: number;
    options?: Array<{ priceDeltaMinor: number }>;
  }>,
  taxRatePercent: number = 10,
  discountMinor: number = 0
) {
  let subtotalMinor = 0;

  for (const item of items) {
    let itemPrice = item.unitPriceMinor;
    if (item.options) {
      for (const opt of item.options) {
        itemPrice += opt.priceDeltaMinor;
      }
    }
    subtotalMinor += itemPrice * item.quantity;
  }

  const netSubtotal = Math.max(0, subtotalMinor - discountMinor);
  const taxMinor = Math.round((netSubtotal * taxRatePercent) / 100);
  const totalMinor = netSubtotal + taxMinor;

  return {
    subtotalMinor,
    discountMinor,
    taxMinor,
    totalMinor,
  };
}

export async function runOrderCalculatorTests() {
  console.log("▶ [TEST SUITE] Domain Order Calculator & Price Engine");

  // Test 1: Single item without options
  {
    const result = calculateOrderTotals([
      { unitPriceMinor: 50000, quantity: 2 },
    ]);
    assert.equal(result.subtotalMinor, 100000, "Subtotal should be 100,000 IDR");
    assert.equal(result.taxMinor, 10000, "PB1 Tax (10%) should be 10,000 IDR");
    assert.equal(result.totalMinor, 110000, "Total should be 110,000 IDR");
    console.log("  ✔ calculateOrderTotals: Simple item without options");
  }

  // Test 2: Items with modifiers & options price deltas
  {
    const result = calculateOrderTotals([
      {
        unitPriceMinor: 95000, // Rendang Wagyu
        quantity: 2,
        options: [
          { priceDeltaMinor: 5000 }, // Extra spicy
          { priceDeltaMinor: 10000 }, // Extra gravy
        ],
      },
      {
        unitPriceMinor: 25000, // Es Cendol
        quantity: 1,
        options: [{ priceDeltaMinor: 3000 }], // Extra durian
      },
    ]);

    // Item 1: (95,000 + 5,000 + 10,000) * 2 = 220,000
    // Item 2: (25,000 + 3,000) * 1 = 28,000
    // Subtotal = 248,000
    // Tax = 24,800
    // Total = 272,800
    assert.equal(result.subtotalMinor, 248000);
    assert.equal(result.taxMinor, 24800);
    assert.equal(result.totalMinor, 272800);
    console.log("  ✔ calculateOrderTotals: Multi-item with option deltas");
  }

  // Test 3: Discount deduction with rounding
  {
    const result = calculateOrderTotals(
      [{ unitPriceMinor: 100000, quantity: 1 }],
      10, // 10% tax
      20000 // 20,000 discount voucher
    );
    // Subtotal: 100,000
    // Net: 80,000
    // Tax: 8,000
    // Total: 88,000
    assert.equal(result.subtotalMinor, 100000);
    assert.equal(result.discountMinor, 20000);
    assert.equal(result.taxMinor, 8000);
    assert.equal(result.totalMinor, 88000);
    console.log("  ✔ calculateOrderTotals: Voucher discount & tax recomputation");
  }
}
