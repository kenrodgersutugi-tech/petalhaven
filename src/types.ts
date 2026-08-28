export type ProductCategory = 
  | 'All'
  | 'Fresh Bouquets'
  | 'Luxury Hampers'
  | 'Preserved Roses'
  | 'Artisanal Candles'
  | 'Chocolates & Sweets'
  | 'Personalized Gifts'
  | 'Plant & Succulents';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  category: string;
  stock_quantity: number;
  image_url: string;
  rating?: number;
  review_count?: number;
  is_featured?: boolean;
  tags?: string[];
  created_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedGiftNote?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
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
  status: OrderStatus;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  price: number;
  product_title?: string;
  product_image?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id?: string | null;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
  verified_purchase?: boolean;
  helpful_count?: number;
  user_has_voted?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  role: 'customer' | 'admin';
  avatar_url?: string;
}

export interface FilterOptions {
  category: string;
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  inStockOnly: boolean;
}
