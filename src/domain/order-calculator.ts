import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { products, productOptions } from "@/db/schema";
import { OrderItemInput } from "@/lib/validation/order";

export interface CalculatedOrderItemOption {
  productOptionId: string;
  optionNameSnapshot: string;
  priceDeltaMinor: number;
  quantity: number;
}

export interface CalculatedOrderItem {
  productId: string;
  productNameSnapshot: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
  note?: string | null;
  options: CalculatedOrderItemOption[];
}

export interface CalculationResult {
  items: CalculatedOrderItem[];
  subtotalMinor: number;
  taxMinor: number;
  discountMinor: number;
  totalMinor: number;
  currency: string;
}

export class OrderCalculationError extends Error {
  constructor(message: string, public code: string = "CALCULATION_ERROR") {
    super(message);
    this.name = "OrderCalculationError";
  }
}

/**
 * Server-Authoritative Order Price Calculator
 * Re-calculates and validates item prices, option deltas, taxes, and totals
 * purely from current database records to prevent client-side price tampering.
 */
export async function calculateOrderPrices(
  rawItems: OrderItemInput[],
  discountMinor: number = 0
): Promise<CalculationResult> {
  if (!rawItems || rawItems.length === 0) {
    throw new OrderCalculationError("Dining basket cannot be empty.", "EMPTY_ITEMS");
  }

  // 1. Collect and validate all distinct product IDs and option IDs
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const productIds = Array.from(new Set(rawItems.map((i) => i.productId)));
  const allOptionIds = Array.from(
    new Set(rawItems.flatMap((i) => i.optionIds || []))
  );

  for (const pid of productIds) {
    if (!uuidRegex.test(pid)) {
      throw new OrderCalculationError(
        "Outdated items detected in your basket. Please clear your basket and choose dishes from the menu catalog.",
        "INVALID_PRODUCT_ID"
      );
    }
  }

  for (const oid of allOptionIds) {
    if (!uuidRegex.test(oid)) {
      throw new OrderCalculationError(
        "Outdated option modifier detected in basket. Please re-select your dish options.",
        "INVALID_OPTION_ID"
      );
    }
  }

  // 2. Query products from database
  const dbProducts = await db
    .select()
    .from(products)
    .where(inArray(products.id, productIds));

  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  // Verify all products exist and are available
  for (const pid of productIds) {
    const prod = productMap.get(pid);
    if (!prod) {
      throw new OrderCalculationError(
        `Dish with ID ${pid} was not found in the menu catalog.`,
        "PRODUCT_NOT_FOUND"
      );
    }
    if (!prod.isAvailable) {
      throw new OrderCalculationError(
        `"${prod.name}" is currently sold out or unavailable.`,
        "PRODUCT_UNAVAILABLE"
      );
    }
  }

  // 3. Query product options if any
  const optionMap = new Map();
  if (allOptionIds.length > 0) {
    const dbOptions = await db
      .select()
      .from(productOptions)
      .where(inArray(productOptions.id, allOptionIds));

    for (const opt of dbOptions) {
      optionMap.set(opt.id, opt);
    }

    // Verify all requested options exist
    for (const oid of allOptionIds) {
      const opt = optionMap.get(oid);
      if (!opt) {
        throw new OrderCalculationError(
          `Dish option with ID ${oid} was not found.`,
          "OPTION_NOT_FOUND"
        );
      }
      if (!opt.isAvailable) {
        throw new OrderCalculationError(
          `Option "${opt.name}" is currently unavailable.`,
          "OPTION_UNAVAILABLE"
        );
      }
    }
  }

  // 4. Calculate prices with immutable snapshots
  const calculatedItems: CalculatedOrderItem[] = [];
  let calculatedSubtotalMinor = 0;
  let currency = "IDR";

  for (const rawItem of rawItems) {
    const prod = productMap.get(rawItem.productId)!;
    currency = prod.currency || "IDR";

    const itemOptions: CalculatedOrderItemOption[] = [];
    let optionsDeltaTotal = 0;

    for (const oid of rawItem.optionIds || []) {
      const opt = optionMap.get(oid);
      if (!opt) continue;

      // Verify that this option belongs to the product
      if (opt.productId !== prod.id) {
        throw new OrderCalculationError(
          `Option "${opt.name}" does not belong to dish "${prod.name}".`,
          "INVALID_OPTION_ATTACHMENT"
        );
      }

      const priceDelta = Number(opt.priceDeltaMinor) || 0;
      optionsDeltaTotal += priceDelta;

      itemOptions.push({
        productOptionId: opt.id,
        optionNameSnapshot: opt.name,
        priceDeltaMinor: priceDelta,
        quantity: 1,
      });
    }

    const basePrice = Number(prod.priceMinor) || 0;
    const effectiveUnitPriceMinor = basePrice + optionsDeltaTotal;
    const lineTotalMinor = effectiveUnitPriceMinor * rawItem.quantity;

    calculatedSubtotalMinor += lineTotalMinor;

    calculatedItems.push({
      productId: prod.id,
      productNameSnapshot: prod.name,
      unitPriceMinor: basePrice,
      quantity: rawItem.quantity,
      lineTotalMinor,
      note: rawItem.note || null,
      options: itemOptions,
    });
  }

  // 5. Tax (10% standard PB1 resto tax in Indonesia)
  const taxMinor = Math.round(calculatedSubtotalMinor * 0.1);
  const validatedDiscountMinor = Math.max(0, discountMinor);
  const totalMinor = Math.max(
    0,
    calculatedSubtotalMinor + taxMinor - validatedDiscountMinor
  );

  return {
    items: calculatedItems,
    subtotalMinor: calculatedSubtotalMinor,
    taxMinor,
    discountMinor: validatedDiscountMinor,
    totalMinor,
    currency,
  };
}
