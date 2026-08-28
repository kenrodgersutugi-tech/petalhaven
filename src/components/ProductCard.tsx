import React, { useState } from 'react';
import { 
  Heart, 
  ShoppingBag, 
  Eye, 
  Star, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  product: Product;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(true);

  const isFavorite = isInWishlist(product.id);
  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;
  const discountPercent = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);
  };

  return (
    <div 
      id={`product-card-${product.id}`}
      onClick={() => onQuickView(product)}
      className="group relative bg-white rounded-xl border border-slate-100 overflow-hidden shadow-2xs hover:border-pink-200 hover:shadow-md transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Wrapper */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50">
        <img
          src={imageLoaded ? product.image_url : 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          onError={() => setImageLoaded(false)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider rounded bg-[#E75480] text-white shadow-xs">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider rounded bg-pink-100 text-[#E75480] border border-pink-200">
              Featured
            </span>
          )}
          {isLowStock && (
            <span className="px-1.5 py-0.5 text-[8px] sm:text-[10px] font-semibold rounded bg-amber-500 text-white flex items-center gap-0.5 shadow-xs">
              <AlertCircle className="w-2.5 h-2.5" /> <span className="hidden xs:inline">Only</span> {product.stock_quantity} left
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          id={`wishlist-toggle-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 z-10 cursor-pointer shadow-xs ${
            isFavorite 
              ? 'bg-[#E75480] text-white' 
              : 'bg-white/90 text-slate-500 hover:text-[#E75480] hover:bg-white'
          }`}
          title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? 'fill-white' : ''}`} />
        </button>

        {/* Quick View Hover Button (Desktop) */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="bg-white/95 text-slate-800 hover:text-[#E75480] px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5 transform translate-y-2 group-hover:translate-y-0 transition-transform cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[9px] sm:text-[10px] font-bold text-pink-400 uppercase tracking-wider truncate max-w-[80px] sm:max-w-none">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 sm:gap-1 text-amber-500 shrink-0">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
              <span className="text-[11px] sm:text-xs font-bold text-slate-700">{product.rating || 5.0}</span>
              <span className="text-[10px] text-slate-400 hidden xs:inline">({product.review_count || 1})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-[#E75480] transition-colors mb-1">
            {product.title}
          </h3>

          {/* Description snippet (hidden on phone for clean 2-column mobile alignment) */}
          <p className="hidden sm:block text-xs text-slate-400 line-clamp-1 mb-3">
            {product.description}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-1.5 sm:pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
              <span className="text-xs sm:text-base font-bold text-slate-900 whitespace-nowrap">
                {formatPrice(product.price)}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through whitespace-nowrap">
                  {formatPrice(product.original_price)}
                </span>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-500 truncate">
              {isOutOfStock ? (
                <span className="text-rose-500 font-semibold">Out of Stock</span>
              ) : (
                <span className="text-emerald-600 font-medium">{product.stock_quantity} in stock</span>
              )}
            </p>
          </div>

          <button
            id={`add-cart-${product.id}`}
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`p-1.5 sm:p-2 rounded-lg border border-slate-200 flex items-center justify-center transition-all cursor-pointer shrink-0 ml-1.5 ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border-transparent'
                : addedAnimation
                ? 'bg-emerald-600 text-white border-emerald-600 scale-105'
                : 'hover:bg-[#E75480] hover:text-white hover:border-[#E75480] text-slate-600 bg-white'
            }`}
            title={isOutOfStock ? 'Sold Out' : 'Add to Cart'}
          >
            {addedAnimation ? (
              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
