import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  Gift, 
  ShieldCheck, 
  Sparkles, 
  Check, 
  Plus, 
  Minus,
  MessageSquare,
  Sparkle
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';
import { ReviewComponent } from './ReviewComponent';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantCheckout?: () => void;
  onOpenAuth?: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantCheckout,
  onOpenAuth,
}) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [quantity, setQuantity] = useState(1);
  const [giftNote, setGiftNote] = useState('');
  const [isAdded, setIsAdded] = useState(false);
  
  // Local state for dynamic rating update if customer reviews
  const [dynamicRating, setDynamicRating] = useState<number | null>(null);
  const [dynamicReviewCount, setDynamicReviewCount] = useState<number | null>(null);

  if (!product) return null;

  const currentRating = dynamicRating !== null ? dynamicRating : (product.rating || 5.0);
  const currentReviewCount = dynamicReviewCount !== null ? dynamicReviewCount : (product.review_count || 1);

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, giftNote);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 800);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, giftNote);
    onClose();
    if (onInstantCheckout) {
      onInstantCheckout();
    }
  };

  const handleReviewSubmitted = (newRating: number, newCount: number) => {
    setDynamicRating(newRating);
    setDynamicReviewCount(newCount);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row max-h-[95vh] md:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-product-detail-btn"
          onClick={onClose}
          className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 hover:bg-white text-slate-500 hover:text-slate-900 flex items-center justify-center shadow-sm transition cursor-pointer border border-slate-100"
          aria-label="Close modal"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>

        {/* Left: Product Image */}
        <div className="h-48 sm:h-64 md:h-auto md:w-1/2 relative bg-slate-50 flex items-center justify-center shrink-0">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 sm:top-4 sm:left-4 flex flex-col gap-1 z-10">
            {discountPercent > 0 && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold rounded-full bg-[#E75480] text-white shadow-xs">
                Save {discountPercent}%
              </span>
            )}
            {product.is_featured && (
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-medium rounded-full bg-white/95 text-[#E75480] backdrop-blur-md shadow-xs flex items-center gap-1 border border-pink-100">
                <Sparkles className="w-3 h-3 text-[#E75480]" /> Featured Gift
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Details, Tabs & Reviews */}
        <div className="md:w-1/2 p-3.5 sm:p-7 overflow-y-auto flex flex-col justify-between">
          <div>
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 mb-1.5 sm:mb-2">
              <span className="text-[11px] sm:text-xs font-medium text-[#E75480] bg-pink-50 px-2 py-0.5 sm:px-2.5 rounded-full border border-pink-100">
                {product.category}
              </span>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className="flex items-center gap-1 text-amber-500 text-xs sm:text-sm hover:opacity-80 transition cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400" />
                <span className="font-bold text-slate-800">{currentRating}</span>
                <span className="text-[11px] sm:text-xs text-slate-400 underline decoration-slate-300">
                  ({currentReviewCount} {currentReviewCount === 1 ? 'review' : 'reviews'})
                </span>
              </button>
            </div>

            <h2 className="text-base sm:text-2xl font-semibold text-slate-900 leading-snug mb-1.5 sm:mb-2">
              {product.title}
            </h2>

            {/* Price & Stock */}
            <div className="flex items-baseline gap-2 sm:gap-3 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-slate-100">
              <span className="text-xl sm:text-3xl font-bold text-[#E75480]">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-xs sm:text-base text-slate-400 line-through">
                  {formatPrice(product.original_price)}
                </span>
              )}
              <span className={`ml-auto text-[11px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium ${
                isOutOfStock 
                  ? 'bg-rose-50 text-rose-600' 
                  : product.stock_quantity <= 5 
                  ? 'bg-amber-50 text-amber-700' 
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isOutOfStock ? 'Sold Out' : `${product.stock_quantity} in stock`}
              </span>
            </div>

            {/* Segmented View Switcher */}
            <div className="flex p-1 bg-slate-100/90 rounded-xl mb-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Gift Details</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 py-1.5 rounded-lg transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'reviews'
                    ? 'bg-white text-[#E75480] shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Reviews & Ratings ({currentReviewCount})</span>
              </button>
            </div>

            {/* Tab 1: Overview */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Description</h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Personalized Gift Message Field */}
                <div className="bg-pink-50/50 p-3.5 rounded-xl border border-pink-100">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 mb-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#E75480]" />
                    <span>Complimentary Handwritten Gift Message (Optional)</span>
                  </label>
                  <textarea
                    value={giftNote}
                    onChange={(e) => setGiftNote(e.target.value)}
                    placeholder="e.g., Happy Birthday Winnie! Wishing you blooming joy and love. From David"
                    rows={2}
                    maxLength={250}
                    className="w-full text-xs bg-white text-slate-800 rounded-lg p-2.5 border border-pink-200 focus:outline-none focus:ring-1 focus:ring-[#FFB6C1] resize-none"
                  />
                  <div className="flex justify-between items-center mt-1 text-[10px] text-slate-400">
                    <span>Includes embossed Petals Haven keepsake envelope</span>
                    <span>{giftNote.length}/250</span>
                  </div>
                </div>

                {/* Quantity Selector */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quantity</span>
                  <div className="flex items-center border border-slate-200 rounded-full bg-white p-1">
                    <button
                      type="button"
                      disabled={quantity <= 1 || isOutOfStock}
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-slate-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= product.stock_quantity || isOutOfStock}
                      onClick={() => setQuantity(prev => Math.min(product.stock_quantity, prev + 1))}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Reviews Section */}
            {activeTab === 'reviews' && (
              <div className="pb-4">
                <ReviewComponent
                  product={product}
                  onReviewSubmitted={handleReviewSubmitted}
                  onOpenAuth={onOpenAuth}
                />
              </div>
            )}
          </div>

          {/* Action Buttons & Sticky Purchasing Footer */}
          <div className="pt-3 mt-3 sm:pt-4 sm:mt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-2.5 sm:mb-3">
              <button
                id="modal-add-to-cart-btn"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-medium text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
                  isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : isAdded
                    ? 'bg-emerald-600 text-white'
                    : 'bg-pink-50 hover:bg-pink-100 text-[#E75480] border border-pink-200'
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Add to Cart ({formatPrice(product.price * quantity)})
                  </>
                )}
              </button>

              <button
                id="modal-buy-now-btn"
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                className="w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-full font-medium text-xs sm:text-sm bg-[#E75480] hover:bg-[#D6336C] text-white shadow-md shadow-pink-100 transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Instant Checkout
              </button>
            </div>

            {/* Wishlist toggle */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <button
                onClick={() => toggleWishlist(product.id)}
                className="font-medium hover:text-[#E75480] flex items-center gap-1.5 transition-colors cursor-pointer py-0.5"
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-[#E75480] text-[#E75480]' : ''}`} />
                <span>{isFavorite ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
              </button>

              {activeTab === 'overview' && (
                <button
                  onClick={() => setActiveTab('reviews')}
                  className="text-[11px] text-[#E75480] hover:underline font-medium cursor-pointer flex items-center gap-1"
                >
                  <span>See {currentReviewCount} Customer Reviews</span>
                  <span>→</span>
                </button>
              )}
            </div>

            {/* Trust footer */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
              <div className="flex flex-col items-center">
                <Truck className="w-3.5 h-3.5 text-[#E75480] mb-0.5" />
                <span className="text-[9px] text-slate-500 font-medium">Meru & Kenya Dispatch</span>
              </div>
              <div className="flex flex-col items-center">
                <Gift className="w-3.5 h-3.5 text-[#FFB6C1] mb-0.5" />
                <span className="text-[9px] text-slate-500 font-medium">Luxury Boxed Ribbon</span>
              </div>
              <div className="flex flex-col items-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mb-0.5" />
                <span className="text-[9px] text-slate-500 font-medium">100% Fresh Guaranteed</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

