import { db } from "@/db";
import { restaurantSettings } from "@/db/schema/restaurant_settings";
import { formatCurrency as baseFormatCurrency } from "@/lib/utils";

export interface RestaurantCurrencyConfig {
  code: string;
  symbol: string;
  decimals: number;
}

const DEFAULT_CURRENCY_CONFIG: RestaurantCurrencyConfig = {
  code: "IDR",
  symbol: "Rp",
  decimals: 0,
};

/**
 * Fetch currency configuration from restaurant settings with fallback
 */
export async function getRestaurantCurrency(): Promise<RestaurantCurrencyConfig> {
  try {
    const [settings] = await db
      .select({
        code: restaurantSettings.currency,
        symbol: restaurantSettings.currencySymbol,
        decimals: restaurantSettings.currencyDecimals,
      })
      .from(restaurantSettings)
      .limit(1);

    if (settings) {
      return {
        code: settings.code.trim(),
        symbol: settings.symbol.trim(),
        decimals: settings.decimals,
      };
    }
  } catch (e) {
    console.warn("Could not query restaurantSettings for currency, using default:", e);
  }

  return DEFAULT_CURRENCY_CONFIG;
}

/**
 * Format minor integer price according to currency rules
 */
export function formatMinorPrice(
  minorAmount: number,
  config: RestaurantCurrencyConfig = DEFAULT_CURRENCY_CONFIG
): string {
  return baseFormatCurrency(minorAmount, config.code, config.symbol, config.decimals);
}
