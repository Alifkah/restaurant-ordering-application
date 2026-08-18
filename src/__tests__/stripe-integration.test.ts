import assert from "node:assert/strict";

interface OrderLineItem {
  name: string;
  unitPriceMinor: number;
  quantity: number;
  currency: string;
}

export function buildStripeLineItems(items: OrderLineItem[]) {
  return items.map((item) => ({
    price_data: {
      currency: item.currency.toLowerCase(),
      product_data: {
        name: item.name,
      },
      unit_amount: item.unitPriceMinor,
    },
    quantity: item.quantity,
  }));
}

export async function runStripeIntegrationTests() {
  console.log("▶ [TEST SUITE] Stripe Checkout & Webhook Integration Helpers");

  // Test 1: Build Stripe Line Items
  {
    const items: OrderLineItem[] = [
      {
        name: "Rendang Wagyu 12 Jam",
        unitPriceMinor: 95000,
        quantity: 2,
        currency: "IDR",
      },
      {
        name: "Es Kelapa Muda Jeruk",
        unitPriceMinor: 25000,
        quantity: 1,
        currency: "IDR",
      },
    ];

    const stripeLines = buildStripeLineItems(items);
    assert.equal(stripeLines.length, 2);
    assert.equal(stripeLines[0].price_data.currency, "idr");
    assert.equal(stripeLines[0].price_data.unit_amount, 95000);
    assert.equal(stripeLines[0].quantity, 2);
    assert.equal(stripeLines[1].price_data.unit_amount, 25000);
    console.log("  ✔ buildStripeLineItems: Correctly transforms order items to Stripe payload");
  }

  // Test 2: Idempotency signature simulation
  {
    const processedWebhookIds = new Set<string>();

    function processWebhookEvent(eventId: string): { processed: boolean; reason?: string } {
      if (processedWebhookIds.has(eventId)) {
        return { processed: false, reason: "DUPLICATE_EVENT_IGNORED" };
      }
      processedWebhookIds.add(eventId);
      return { processed: true };
    }

    const firstRun = processWebhookEvent("evt_test_12345");
    assert.equal(firstRun.processed, true);

    const duplicateRun = processWebhookEvent("evt_test_12345");
    assert.equal(duplicateRun.processed, false);
    assert.equal(duplicateRun.reason, "DUPLICATE_EVENT_IGNORED");
    console.log("  ✔ processWebhookEvent: Enforces idempotency on duplicate Stripe events");
  }
}
