import { pgTable, uuid, varchar, text, smallint, char, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";

export interface DaySchedule {
  open: string;
  close: string;
  isOpen: boolean;
}

export type WeeklyOpeningHours = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export const restaurantSettings = pgTable("restaurant_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantName: varchar("restaurant_name", { length: 180 }).notNull(),
  location: text("location"),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 255 }),
  currency: char("currency", { length: 3 }).default("IDR").notNull(),
  currencySymbol: varchar("currency_symbol", { length: 10 }).default("Rp").notNull(),
  currencyDecimals: smallint("currency_decimals").default(0).notNull(),
  timezone: varchar("timezone", { length: 80 }).default("Asia/Makassar").notNull(),
  openingHours: jsonb("opening_hours").$type<WeeklyOpeningHours>(),
  isAcceptingOrders: boolean("is_accepting_orders").default(true).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type RestaurantSettings = typeof restaurantSettings.$inferSelect;
export type NewRestaurantSettings = typeof restaurantSettings.$inferInsert;
