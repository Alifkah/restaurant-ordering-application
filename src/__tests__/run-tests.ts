import { runOrderCalculatorTests } from "./order-calculator.test";
import { runCurrencyTests } from "./currency.test";
import { runOrderStateMachineTests } from "./order-state-machine.test";
import { runStripeIntegrationTests } from "./stripe-integration.test";

async function main() {
  const startTime = Date.now();
  console.log("===============================================================");
  console.log(" 🧪 NUSANTARA ARTISAN SUITE - AUTOMATED TEST RUNNER");
  console.log("===============================================================\n");

  try {
    await runOrderCalculatorTests();
    console.log();

    await runCurrencyTests();
    console.log();

    await runOrderStateMachineTests();
    console.log();

    await runStripeIntegrationTests();
    console.log();

    const elapsed = Date.now() - startTime;
    console.log("===============================================================");
    console.log(` ✅ ALL TEST SUITES PASSED SUCCESSFULLY in ${elapsed}ms`);
    console.log("===============================================================\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ TEST SUITE FAILED:");
    console.error(error);
    process.exit(1);
  }
}

main();
