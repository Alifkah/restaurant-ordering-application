import { pgTable, uuid, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const restaurantTables = pgTable("restaurant_tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  tableNumber: varchar("table_number", { length: 20 }).unique().notNull(),
  qrCodeToken: varchar("qr_code_token", { length: 64 }).unique().notNull(),
  zone: varchar("zone", { length: 50 }).default("Indoor").notNull(),
  capacity: integer("capacity").default(4).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type RestaurantTable = typeof restaurantTables.$inferSelect;
export type NewRestaurantTable = typeof restaurantTables.$inferInsert;
