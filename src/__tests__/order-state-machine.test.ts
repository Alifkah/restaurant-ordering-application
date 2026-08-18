import assert from "node:assert/strict";

type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled";

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["completed"],
  completed: [],
  cancelled: [],
};

export function isValidStatusTransition(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus
): boolean {
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
}

export async function runOrderStateMachineTests() {
  console.log("▶ [TEST SUITE] Order Lifecycle State Machine");

  // Test 1: Valid forward flow
  {
    assert.equal(isValidStatusTransition("pending", "confirmed"), true);
    assert.equal(isValidStatusTransition("confirmed", "preparing"), true);
    assert.equal(isValidStatusTransition("preparing", "ready"), true);
    assert.equal(isValidStatusTransition("ready", "completed"), true);
    console.log("  ✔ isValidStatusTransition: Happy path lifecycle (pending -> confirmed -> preparing -> ready -> completed)");
  }

  // Test 2: Valid cancellations
  {
    assert.equal(isValidStatusTransition("pending", "cancelled"), true);
    assert.equal(isValidStatusTransition("confirmed", "cancelled"), true);
    assert.equal(isValidStatusTransition("preparing", "cancelled"), true);
    console.log("  ✔ isValidStatusTransition: Cancellation from pending, confirmed, preparing");
  }

  // Test 3: Invalid backwards and illegal transitions
  {
    assert.equal(isValidStatusTransition("completed", "pending"), false);
    assert.equal(isValidStatusTransition("completed", "preparing"), false);
    assert.equal(isValidStatusTransition("cancelled", "ready"), false);
    assert.equal(isValidStatusTransition("ready", "confirmed"), false);
    console.log("  ✔ isValidStatusTransition: Blocks illegal reverse/invalid transitions");
  }
}
