import { z } from "zod";

export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID wajib diisi"),
  optionIds: z.array(z.string()).default([]),
  quantity: z.number().int().min(1, "Kuantitas minimal 1"),
  note: z.string().max(255, "Catatan item maksimal 255 karakter").optional().nullable(),
});

export const createOrderSchema = z.object({
  items: z
    .array(orderItemInputSchema)
    .min(1, "Keranjang belanja tidak boleh kosong"),
  diningOption: z.enum(["dine_in", "takeaway"]).default("dine_in"),
  tableNumber: z.string().max(50).optional().nullable(),
  customerNote: z.string().max(500, "Catatan pesanan maksimal 500 karakter").optional().nullable(),
  discountMinor: z.number().int().min(0).default(0),
});

export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
