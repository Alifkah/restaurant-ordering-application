import { EventEmitter } from "events";

export interface KitchenOrderEvent {
  orderId: string;
  orderNumber: string;
  status: string;
  totalMinor: number;
  currency: string;
  customerNote?: string | null;
  createdAt: string | Date;
  itemsCount: number;
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    note?: string | null;
    options: Array<{ name: string }>;
  }>;
}

export interface OrderStatusEvent {
  orderId: string;
  orderNumber: string;
  status: string;
  updatedAt: string | Date;
}

class SSEBroadcaster extends EventEmitter {
  constructor() {
    super();
    // Allow large number of concurrent listeners for staff & customer streams
    this.setMaxListeners(200);
  }

  /**
   * Broadcast a new order or state change to kitchen staff display
   */
  broadcastKitchenOrder(order: KitchenOrderEvent) {
    this.emit("kitchen_order", order);
  }

  /**
   * Broadcast a status change for a specific order to customer tracking
   */
  broadcastOrderStatus(orderId: string, event: OrderStatusEvent) {
    this.emit(`order_status:${orderId}`, event);
    // Also notify kitchen if an order state changed
    this.emit("kitchen_status_update", event);
  }

  /**
   * Subscribe to all kitchen events
   */
  onKitchenEvent(callback: (event: KitchenOrderEvent | OrderStatusEvent) => void) {
    const handleOrder = (order: KitchenOrderEvent) => callback(order);
    const handleStatus = (status: OrderStatusEvent) => callback(status);

    this.on("kitchen_order", handleOrder);
    this.on("kitchen_status_update", handleStatus);

    return () => {
      this.off("kitchen_order", handleOrder);
      this.off("kitchen_status_update", handleStatus);
    };
  }

  /**
   * Subscribe to status events for a single order
   */
  onOrderEvent(orderId: string, callback: (event: OrderStatusEvent) => void) {
    const eventName = `order_status:${orderId}`;
    this.on(eventName, callback);

    return () => {
      this.off(eventName, callback);
    };
  }
}

// Global singleton across hot-reloads in Next.js development
const globalForSSE = global as unknown as { sseBroadcaster: SSEBroadcaster };
export const sseBroadcaster = globalForSSE.sseBroadcaster || new SSEBroadcaster();
if (process.env.NODE_ENV !== "production") globalForSSE.sseBroadcaster = sseBroadcaster;
