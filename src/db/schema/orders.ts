import { pgTable, uuid, varchar, text, bigint, char, timestamp, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { restaurantTables } from "./restaurant_tables";
import { orderStatusEnum, orderTypeEnum } from "./enums";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: varchar("order_number", { length: 30 }).unique().notNull(),
    customerId: uuid("customer_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    orderType: orderTypeEnum("order_type").default("dine_in").notNull(),
    tableNumber: varchar("table_number", { length: 20 }),
    tableId: uuid("table_id").references(() => restaurantTables.id, { onDelete: "set null" }),
    status: orderStatusEnum("status").default("pending").notNull(),
    subtotalMinor: bigint("subtotal_minor", { mode: "number" }).notNull(),
    discountMinor: bigint("discount_minor", { mode: "number" }).default(0).notNull(),
    taxMinor: bigint("tax_minor", { mode: "number" }).default(0).notNull(),
    totalMinor: bigint("total_minor", { mode: "number" }).notNull(),
    currency: char("currency", { length: 3 }).default("IDR").notNull(),
    customerNote: text("customer_note"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("orders_customer_id_created_at_idx").on(table.customerId, table.createdAt),
    index("orders_status_created_at_idx").on(table.status, table.createdAt),
    index("orders_order_number_idx").on(table.orderNumber),
    index("orders_table_id_idx").on(table.tableId),
  ]
);

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
