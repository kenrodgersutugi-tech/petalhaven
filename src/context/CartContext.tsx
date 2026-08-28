import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (product: Product, quantity?: number, giftNote?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItemCount: number;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
  promoCode: string;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  appliedDiscountPercent: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'petals_haven_cart_v2';
const WISHLIST_STORAGE_KEY = 'petals_haven_wishlist_v2';
const FREE_SHIPPING_THRESHOLD = 5000;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedDiscountPercent, setAppliedDiscountPercent] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Could not save wishlist', e);
    }
  }, [wishlist]);

  const addToCart = (product: Product, quantity = 1, giftNote?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(item => item.product.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(product.stock_quantity || 99, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          selectedGiftNote: giftNote || updated[existingIndex].selectedGiftNote,
        };
        return updated;
      } else {
        return [...prevCart, { product, quantity: Math.min(product.stock_quantity || 99, quantity), selectedGiftNote: giftNote }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.min(item.product.stock_quantity || 99, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setPromoCode('');
    setAppliedDiscountPercent(0);
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const totalItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const discountAmount = Math.round((subtotal * appliedDiscountPercent) / 100);
  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 300;
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyPromoCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'PETALS10' || clean === 'WELCOME10' || clean === 'MERU10') {
      setPromoCode(clean);
      setAppliedDiscountPercent(10);
      return { success: true, message: '10% discount applied to your order!' };
    } else if (clean === 'WINNIE15' || clean === 'BLOOM15') {
      setPromoCode(clean);
      setAppliedDiscountPercent(15);
      return { success: true, message: '15% Winnie’s VIP gift discount applied!' };
    } else if (clean === 'BLOOM20' || clean === 'SPRING20') {
      setPromoCode(clean);
      setAppliedDiscountPercent(20);
      return { success: true, message: '20% VIP gift discount applied!' };
    } else {
      return { success: false, message: 'Invalid promo code. Try "MERU10" or "WINNIE15"' };
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setAppliedDiscountPercent(0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        totalItemCount,
        subtotal,
        discountAmount,
        shippingFee,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
        promoCode,
        applyPromoCode,
        removePromoCode,
        appliedDiscountPercent,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
