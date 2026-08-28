import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';

const LOCAL_STORAGE_KEY = 'petals_haven_products_v2';

// Deduplicate array of products by ID
function deduplicateProducts(products: Product[]): Product[] {
  const seen = new Set<string>();
  const result: Product[] = [];
  for (const p of products) {
    if (p && p.id && !seen.has(p.id)) {
      seen.add(p.id);
      result.push(p);
    }
  }
  return result;
}

// Get local cache or fallback
function getLocalProducts(): Product[] {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const parsed: Product[] = JSON.parse(data);
      const dedupedParsed = deduplicateProducts(parsed);
      // Ensure all current initial products exist in cache
      const existingIds = new Set(dedupedParsed.map(p => p.id));
      const missing = INITIAL_PRODUCTS.filter(p => !existingIds.has(p.id));
      const currentList = deduplicateProducts([...dedupedParsed, ...missing]);

      // Ensure prod-011 is properly set at 250 KES
      let priceUpdated = false;
      const verifiedList = currentList.map(p => {
        if (p.id === 'prod-011' && p.price !== 250) {
          priceUpdated = true;
          return { ...p, price: 250, title: 'Neclace and Bracelet Gift box' };
        }
        return p;
      });

      if (missing.length > 0 || priceUpdated || dedupedParsed.length !== parsed.length) {
        saveLocalProducts(verifiedList);
        return verifiedList;
      }
      return verifiedList;
    }
  } catch (err) {
    console.warn('Could not read from localStorage', err);
  }
  const defaultList = deduplicateProducts(INITIAL_PRODUCTS);
  saveLocalProducts(defaultList);
  return defaultList;
}

function saveLocalProducts(products: Product[]): void {
  try {
    const unique = deduplicateProducts(products);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(unique));
  } catch (err) {
    console.warn('Could not save to localStorage', err);
  }
}

export const productService = {
  // Fetch all products
  async getProducts(): Promise<{ data: Product[]; isLiveSupabase: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Supabase fetch products error, falling back to local data:', error.message);
          const fallback = getLocalProducts();
          return { data: fallback.length > 0 ? fallback : INITIAL_PRODUCTS, isLiveSupabase: false, error: error.message };
        }

        if (data && data.length > 0) {
          // Check if newly added local items like necklace box are in Supabase; if not, merge for display
          const supabaseIds = new Set(data.map(p => p.id));
          const missingInitial = INITIAL_PRODUCTS.filter(p => !supabaseIds.has(p.id));
          const combined = deduplicateProducts(missingInitial.length > 0 ? [...data, ...missingInitial] : data);
          saveLocalProducts(combined);
          return { data: combined, isLiveSupabase: true };
        } else {
          // Supabase table exists but is currently empty: initialize standard floral catalog
          try {
            await productService.initializeDefaultCatalog();
          } catch (seedErr) {
            console.warn('Catalog initialization attempt finished:', seedErr);
          }
          const defaultList = deduplicateProducts(INITIAL_PRODUCTS);
          saveLocalProducts(defaultList);
          return { data: defaultList, isLiveSupabase: true };
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown network error';
        console.warn('Supabase network issue, using local storage:', message);
        const fallback = getLocalProducts();
        return { data: fallback.length > 0 ? fallback : INITIAL_PRODUCTS, isLiveSupabase: false, error: message };
      }
    }

    const localProds = getLocalProducts();
    return { data: localProds.length > 0 ? localProds : INITIAL_PRODUCTS, isLiveSupabase: false };
  },

  // Add new product
  async addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<{ data: Product | null; error?: string }> {
    const newProduct: Product = {
      ...product,
      id: isSupabaseConfigured ? undefined as unknown as string : `prod-${Date.now()}`,
      created_at: new Date().toISOString(),
      rating: product.rating || 5.0,
      review_count: product.review_count || 1,
    };

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .insert([
            {
              title: product.title,
              description: product.description,
              price: product.price,
              original_price: product.original_price,
              category: product.category,
              stock_quantity: product.stock_quantity,
              image_url: product.image_url,
              rating: product.rating || 5.0,
              review_count: product.review_count || 1,
              is_featured: product.is_featured || false,
              tags: product.tags || [],
            }
          ])
          .select()
          .single();

        if (error) {
          throw error;
        }

        // Also update local cache
        const local = getLocalProducts();
        saveLocalProducts([data, ...local]);
        return { data };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to insert into Supabase';
        console.warn('Supabase insert failed, storing locally:', message);
        
        // Fallback local save
        const fallbackProd: Product = {
          ...product,
          id: `prod-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        const current = getLocalProducts();
        const updated = [fallbackProd, ...current];
        saveLocalProducts(updated);
        return { data: fallbackProd, error: message };
      }
    }

    // Local mode
    const current = getLocalProducts();
    const fallbackProd: Product = {
      ...newProduct,
      id: `prod-${Date.now()}`,
    };
    const updated = [fallbackProd, ...current];
    saveLocalProducts(updated);
    return { data: fallbackProd };
  },

  // Update existing product
  async updateProduct(id: string, updates: Partial<Product>): Promise<{ data: Product | null; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('products')
          .update({
            title: updates.title,
            description: updates.description,
            price: updates.price,
            original_price: updates.original_price,
            category: updates.category,
            stock_quantity: updates.stock_quantity,
            image_url: updates.image_url,
            is_featured: updates.is_featured,
            tags: updates.tags,
          })
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        const current = getLocalProducts();
        const updated = current.map(p => p.id === id ? { ...p, ...data } : p);
        saveLocalProducts(updated);
        return { data };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to update';
        console.warn('Supabase update failed, updating locally:', message);
      }
    }

    const current = getLocalProducts();
    const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
    saveLocalProducts(updated);
    const target = updated.find(p => p.id === id) || null;
    return { data: target };
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);

        if (error) throw error;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to delete';
        console.warn('Supabase delete failed, deleting locally:', message);
      }
    }

    const current = getLocalProducts();
    const updated = current.filter(p => p.id !== id);
    saveLocalProducts(updated);
    return { success: true };
  },

  // Upload image to Supabase Storage bucket 'product-images'
  async uploadProductImage(file: File): Promise<{ url: string; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `gifts/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        return { url: publicUrlData.publicUrl };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Supabase storage error';
        console.warn('Supabase storage upload failed, creating base64 data URL:', message);
      }
    }

    // Fallback: Convert to Base64 Data URL so local/offline preview works seamlessly
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({ url: reader.result as string });
      };
      reader.onerror = () => {
        resolve({ url: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80', error: 'File read error' });
      };
      reader.readAsDataURL(file);
    });
  },

  // Initialize default catalog into Supabase or local storage
  async initializeDefaultCatalog(): Promise<{ count: number; error?: string }> {
    if (isSupabaseConfigured) {
      try {
        const itemsToInsert = INITIAL_PRODUCTS.map(p => ({
          title: p.title,
          description: p.description,
          price: p.price,
          original_price: p.original_price,
          category: p.category,
          stock_quantity: p.stock_quantity,
          image_url: p.image_url,
          rating: p.rating,
          review_count: p.review_count,
          is_featured: p.is_featured,
          tags: p.tags,
        }));

        const { data, error } = await supabase
          .from('products')
          .insert(itemsToInsert)
          .select();

        if (error) throw error;
        saveLocalProducts(data || INITIAL_PRODUCTS);
        return { count: data?.length || INITIAL_PRODUCTS.length };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to initialize Supabase catalog';
        saveLocalProducts(INITIAL_PRODUCTS);
        return { count: INITIAL_PRODUCTS.length, error: message };
      }
    }

    saveLocalProducts(INITIAL_PRODUCTS);
    return { count: INITIAL_PRODUCTS.length };
  }
};
