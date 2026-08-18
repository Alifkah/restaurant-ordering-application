import { z } from "zod";

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  optionIds: z.array(z.string()).default([]),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
  note: z.string().max(255, "Item note must not exceed 255 characters").optional().nullable(),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemInputSchema)
    .min(1, "Your dining basket cannot be empty"),
  diningOption: z.enum(["dine_in", "takeaway"]).default("dine_in"),
  tableNumber: z.string().max(50).optional().nullable(),
  customerNote: z.string().max(500, "Customer note must not exceed 500 characters").optional().nullable(),
  discountMinor: z.number().int().min(0).default(0),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
