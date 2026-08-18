import { pgTable, uuid, varchar, bigint, integer, index } from "drizzle-orm/pg-core";
import { orderItems } from "./order_items";
import { productOptions } from "./product_options";

export const orderItemOptions = pgTable(
  "order_item_options",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderItemId: uuid("order_item_id")
      .notNull()
      .references(() => orderItems.id, { onDelete: "cascade" }),
    productOptionId: uuid("product_option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "restrict" }),
    optionNameSnapshot: varchar("option_name_snapshot", { length: 150 }).notNull(),
    priceDeltaMinor: bigint("price_delta_minor", { mode: "number" }).notNull(),
    quantity: integer("quantity").default(1).notNull(),
  },
  (table) => [
    index("order_item_options_order_item_id_idx").on(table.orderItemId),
  ]
);

export type OrderItemOption = typeof orderItemOptions.$inferSelect;
export type NewOrderItemOption = typeof orderItemOptions.$inferInsert;
