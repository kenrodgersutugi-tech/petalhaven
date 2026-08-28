import React, { useState } from 'react';
import { 
  X, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Sparkles, 
  Tag, 
  Truck,
  Gift
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

interface CartDrawerProps {
  onOpenCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onOpenCheckout }) => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    freeShippingThreshold,
    amountToFreeShipping,
    promoCode,
    applyPromoCode,
    removePromoCode,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode) return;
    const result = applyPromoCode(inputCode);
    setPromoMessage({ success: result.success, text: result.message });
    if (result.success) {
      setInputCode('');
    }
  };

  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300 border-l border-pink-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cart Drawer Header */}
        <div className="p-3 sm:p-4 border-b border-pink-50 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center">
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-sm sm:text-base">Your Gift Cart</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">{cart.length} {cart.length === 1 ? 'gift item' : 'gift items'}</p>
            </div>
          </div>
          <button
            id="close-cart-drawer-btn"
            onClick={() => setIsCartOpen(false)}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
            aria-label="Close cart"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="bg-pink-50/50 px-3.5 sm:px-5 py-2.5 sm:py-3 border-b border-pink-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 flex items-center gap-1.5 text-[11px] sm:text-xs">
              <Truck className="w-3.5 h-3.5 text-[#E75480] shrink-0" />
              {amountToFreeShipping === 0 ? (
                <span className="text-emerald-700 font-bold">🎉 Free Express Delivery unlocked!</span>
              ) : (
                <span>Add <strong className="text-[#E75480]">{formatPrice(amountToFreeShipping)}</strong> for Free Delivery</span>
              )}
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-[#E75480]">{progressPercent}%</span>
          </div>
          <div className="w-full bg-pink-100 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-[#E75480] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 sm:space-y-3">
          {cart.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#E75480]">
                <Gift className="w-7 h-7" />
              </div>
              <h4 className="font-semibold text-slate-800 text-base mb-1">Your cart is currently empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                Discover our fresh floral bouquets, artisanal hampers, and luxury gifts to delight someone special.
              </p>
              <button
                id="empty-cart-shop-now-btn"
                onClick={() => setIsCartOpen(false)}
                className="bg-[#E75480] hover:bg-[#D6336C] text-white text-xs font-medium px-5 py-2.5 rounded-full transition-all shadow-md shadow-pink-100 cursor-pointer"
              >
                Browse Gifts Catalog
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div 
                key={item.product.id} 
                className="flex gap-2.5 sm:gap-3 bg-white p-2.5 sm:p-3 rounded-xl border border-slate-100 hover:border-pink-200 transition-colors shadow-2xs"
              >
                {/* Thumbnail */}
                <img
                  src={item.product.image_url}
                  alt={item.product.title}
                  className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg object-cover bg-slate-50 shrink-0"
                  referrerPolicy="no-referrer"
                />

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-slate-800 text-xs line-clamp-2 leading-snug">
                        {item.product.title}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-[#E75480] transition p-1 cursor-pointer"
                        title="Remove gift"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {item.selectedGiftNote && (
                      <p className="text-[10px] text-[#E75480] italic line-clamp-1 mt-0.5 bg-pink-50 px-2 py-0.5 rounded">
                        Note: "{item.selectedGiftNote}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100">
                    <span className="font-bold text-sm text-slate-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>

                    {/* Quantity counter */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-white transition cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-xs text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= (item.product.stock_quantity || 99)}
                        className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:bg-white disabled:opacity-30 transition cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals & checkout */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-white space-y-3">
            
            {/* Promo Code Form */}
            <form onSubmit={handleApplyCode} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    placeholder="Promo code (e.g., MERU10, WINNIE15)"
                    className="w-full text-xs uppercase tracking-wider bg-slate-50 rounded-full px-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FFB6C1] focus:bg-white"
                  />
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-[#E75480] text-white text-xs font-medium px-4 py-2 rounded-full transition cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {promoMessage && (
                <p className={`text-[11px] font-medium ${promoMessage.success ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {promoMessage.text}
                </p>
              )}

              {promoCode && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg border border-emerald-100">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {promoCode} applied
                  </span>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-xs text-emerald-900 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-slate-800">{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-[#E75480] font-medium">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <strong className="text-emerald-600">FREE</strong>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Estimated Total</span>
                <span className="text-base text-[#E75480]">{formatPrice(totalAmount)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              id="proceed-checkout-btn"
              onClick={() => {
                setIsCartOpen(false);
                onOpenCheckout();
              }}
              className="w-full py-3 bg-[#E75480] hover:bg-[#D6336C] text-white rounded-full font-medium text-sm transition-all shadow-md shadow-pink-100 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
