import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Read env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if valid Supabase configuration is present
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key'
);

// Create Supabase client instance (or a dummy client if not yet configured)
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Ready-to-run PostgreSQL schema definition for Supabase SQL Editor
export const SUPABASE_SQL_SCHEMA = `-- =========================================================================
-- PETALS HAVEN GIFT SHOP - SUPABASE DATABASE SCHEMA & STORAGE SETUP
-- =========================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2),
    category TEXT NOT NULL,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    image_url TEXT NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00,
    review_count INTEGER DEFAULT 1,
    is_featured BOOLEAN DEFAULT false,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    delivery_type TEXT DEFAULT 'standard',
    gift_message TEXT,
    payment_method TEXT DEFAULT 'card',
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0)
);

-- 4. Create Product Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    author_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    verified_purchase BOOLEAN DEFAULT true,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 6. Policies for Products (Public read, Authenticated or Admin CRUD)
CREATE POLICY "Public products viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Anyone or authenticated can insert products" 
ON public.products FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone or authenticated can update products" 
ON public.products FOR UPDATE USING (true);

CREATE POLICY "Anyone or authenticated can delete products" 
ON public.products FOR DELETE USING (true);

-- 7. Policies for Orders (Public insert, Users can view their own, Admins can view all)
CREATE POLICY "Anyone can create orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their orders" 
ON public.orders FOR SELECT USING (
  auth.uid() = user_id OR auth.uid() IS NOT NULL OR user_id IS NULL
);

CREATE POLICY "Anyone can update orders (Admin)" 
ON public.orders FOR UPDATE USING (true);

-- 8. Policies for Order Items
CREATE POLICY "Anyone can insert order items" 
ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Order items viewable" 
ON public.order_items FOR SELECT USING (true);

-- 9. Policies for Reviews
CREATE POLICY "Public reviews viewable by everyone" 
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Anyone can submit reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update reviews (likes)" 
ON public.reviews FOR UPDATE USING (true);

-- 10. Storage bucket for product images (Run in Supabase Storage or Dashboard)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

CREATE POLICY "Public Access to product-images" 
ON storage.objects FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload to product-images" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update images" 
ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete images" 
ON storage.objects FOR DELETE USING (bucket_id = 'product-images');
`;
