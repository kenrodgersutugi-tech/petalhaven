import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Order, OrderItem, CartItem } from '../types';
import { productService } from './productService';

const ORDERS_STORAGE_KEY = 'petals_haven_orders_v1';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (raw) {
      const orders: Order[] = JSON.parse(raw);
      // Clean out any legacy demo test orders
      const cleaned = orders.filter(
        (o) =>
          o.id !== 'ord-meru-8841' &&
          o.id !== 'ord-meru-9204' &&
          !o.items?.some((it) => it.id?.startsWith('sample-item-'))
      );
      if (cleaned.length !== orders.length) {
        saveLocalOrders(cleaned);
      }
      return cleaned;
    }
  } catch (err) {
    console.warn('Could not read orders from local storage', err);
  }
  return [];
}

function saveLocalOrders(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (err) {
    console.warn('Could not save orders to local storage', err);
  }
}

export const orderService = {
  // Create order with order_items and update stock
  async createOrder(params: {
    user_id?: string | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_address: string;
    city: string;
    postal_code?: string;
    delivery_type: 'standard' | 'express' | 'same_day';
    delivery_date?: string;
    delivery_time_slot?: string;
    delivery_instructions?: string;
    gift_message?: string;
    gift_wrapping?: boolean;
    gift_wrapping_fee?: number;
    payment_method: 'card' | 'apple_pay' | 'cod' | 'mpesa';
    total_amount: number;
    cartItems: CartItem[];
  }): Promise<{ order: Order | null; error?: string }> {
    const orderId = isSupabaseConfigured ? undefined as unknown as string : `order-${Date.now()}`;
    const createdAt = new Date().toISOString();

    const orderItems: OrderItem[] = params.cartItems.map((item, index) => ({
      id: `item-${Date.now()}-${index}`,
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.product.price,
      product_title: item.product.title,
      product_image: item.product.image_url,
    }));

    if (isSupabaseConfigured) {
      try {
        // 1. Insert into orders
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert([
            {
              user_id: params.user_id || null,
              customer_name: params.customer_name,
              customer_email: params.customer_email,
              customer_phone: params.customer_phone,
              shipping_address: params.shipping_address,
              city: params.city,
              postal_code: params.postal_code || '',
              delivery_type: params.delivery_type,
              delivery_date: params.delivery_date || '',
              delivery_time_slot: params.delivery_time_slot || '',
              delivery_instructions: params.delivery_instructions || '',
              gift_message: params.gift_message || '',
              gift_wrapping: !!params.gift_wrapping,
              gift_wrapping_fee: params.gift_wrapping_fee || 0,
              payment_method: params.payment_method,
              total_amount: params.total_amount,
              status: 'processing',
            }
          ])
          .select()
          .single();

        if (orderError) throw orderError;

        // 2. Insert into order_items
        if (orderData && params.cartItems.length > 0) {
          const itemsToInsert = params.cartItems.map(item => ({
            order_id: orderData.id,
            product_id: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          }));

          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);

          if (itemsError) {
            console.warn('Order items insert warning:', itemsError.message);
          }
        }

        // 3. Update stock levels for each item
        for (const item of params.cartItems) {
          const newStock = Math.max(0, item.product.stock_quantity - item.quantity);
          await productService.updateProduct(item.product.id, {
            stock_quantity: newStock
          });
        }

        const completedOrder: Order = {
          ...orderData,
          delivery_date: params.delivery_date,
          delivery_time_slot: params.delivery_time_slot,
          delivery_instructions: params.delivery_instructions,
          gift_wrapping: params.gift_wrapping,
          gift_wrapping_fee: params.gift_wrapping_fee,
          items: orderItems,
        };

        // Cache locally
        const currentOrders = getLocalOrders();
        saveLocalOrders([completedOrder, ...currentOrders]);

        return { order: completedOrder };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Order creation failed';
        console.warn('Supabase order creation failed, saving locally:', msg);
      }
    }

    // Fallback local flow
    const localOrder: Order = {
      id: orderId || `order-${Date.now()}`,
      user_id: params.user_id || null,
      customer_name: params.customer_name,
      customer_email: params.customer_email,
      customer_phone: params.customer_phone,
      shipping_address: params.shipping_address,
      city: params.city,
      postal_code: params.postal_code || '',
      delivery_type: params.delivery_type,
      delivery_date: params.delivery_date,
      delivery_time_slot: params.delivery_time_slot,
      delivery_instructions: params.delivery_instructions,
      gift_message: params.gift_message || '',
      gift_wrapping: params.gift_wrapping,
      gift_wrapping_fee: params.gift_wrapping_fee,
      payment_method: params.payment_method,
      total_amount: params.total_amount,
      status: 'processing',
      created_at: createdAt,
      items: orderItems,
    };

    // Update stock locally
    for (const item of params.cartItems) {
      const newStock = Math.max(0, item.product.stock_quantity - item.quantity);
      await productService.updateProduct(item.product.id, {
        stock_quantity: newStock
      });
    }

    const currentOrders = getLocalOrders();
    saveLocalOrders([localOrder, ...currentOrders]);

    return { order: localOrder };
  },

  // Get orders
  async getOrders(): Promise<Order[]> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            *,
            items:order_items (
              id,
              product_id,
              quantity,
              price,
              product:products (
                title,
                image_url
              )
            )
          `)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Normalize items
          const normalized: Order[] = data.map((o: any) => ({
            id: o.id,
            user_id: o.user_id,
            customer_name: o.customer_name,
            customer_email: o.customer_email,
            customer_phone: o.customer_phone,
            shipping_address: o.shipping_address,
            city: o.city,
            postal_code: o.postal_code,
            delivery_type: o.delivery_type,
            gift_message: o.gift_message,
            payment_method: o.payment_method,
            total_amount: Number(o.total_amount),
            status: o.status,
            created_at: o.created_at,
            items: (o.items || []).map((it: any) => ({
              id: it.id,
              order_id: o.id,
              product_id: it.product_id,
              quantity: it.quantity,
              price: Number(it.price),
              product_title: it.product?.title || 'Gift Item',
              product_image: it.product?.image_url || '',
            }))
          }));
          saveLocalOrders(normalized);
          return normalized;
        }
      } catch (err) {
        console.warn('Supabase fetch orders failed, using local orders:', err);
      }
    }

    return getLocalOrders();
  },

  // Get orders specifically for a user or customer email
  async getUserOrders(userId?: string | null, email?: string): Promise<Order[]> {
    const allOrders = await this.getOrders();
    
    if (!userId && !email) {
      return allOrders;
    }

    const cleanEmail = email?.trim().toLowerCase();

    return allOrders.filter(order => {
      const matchUserId = userId && order.user_id && order.user_id === userId;
      const matchEmail = cleanEmail && order.customer_email && order.customer_email.toLowerCase() === cleanEmail;
      return matchUserId || matchEmail;
    });
  },

  // Update order status
  async updateOrderStatus(id: string, status: Order['status']): Promise<boolean> {
    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('orders')
          .update({ status })
          .eq('id', id);
      } catch (err) {
        console.warn('Supabase order update status failed:', err);
      }
    }

    const current = getLocalOrders();
    const updated = current.map(o => o.id === id ? { ...o, status } : o);
    saveLocalOrders(updated);
    return true;
  }
};
