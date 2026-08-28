import React, { useState, useMemo } from 'react';
import { 
  SlidersHorizontal, 
  ArrowUpDown, 
  Search, 
  Gift, 
  Sparkles, 
  X, 
  RotateCcw, 
  Plus, 
  Check,
  Star
} from 'lucide-react';
import { Product, FilterOptions } from '../types';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { CATEGORIES } from '../data/initialProducts';
import { formatPrice } from '../utils/formatters';

interface ProductCatalogProps {
  products: Product[];
  isLoading?: boolean;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onQuickView: (product: Product) => void;
  onOpenAddProduct?: () => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  isLoading = false,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onQuickView,
  onOpenAddProduct,
}) => {
  const [sortBy, setSortBy] = useState<FilterOptions['sortBy']>('featured');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number>(20000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Category filter
    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Price filter
    result = result.filter(p => p.price <= maxPriceFilter);

    // In-stock only filter
    if (inStockOnly) {
      result = result.filter(p => p.stock_quantity > 0);
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        break;
      case 'featured':
      default:
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }

    return result;
  }, [products, selectedCategory, searchQuery, maxPriceFilter, inStockOnly, sortBy]);

  const resetAllFilters = () => {
    onSelectCategory('All');
    onSearchChange('');
    setMaxPriceFilter(20000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = selectedCategory !== 'All' || searchQuery !== '' || maxPriceFilter < 20000 || inStockOnly;

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
      
      {/* Top Filter & Sort Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-3 sm:p-4 shadow-2xs mb-4 sm:mb-6 flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Results title & count */}
        <div>
          <h2 className="font-semibold text-slate-800 text-base sm:text-lg flex items-center gap-2">
            <span>{selectedCategory === 'All' ? 'Curated Gift Catalog' : selectedCategory}</span>
            {isLoading ? (
              <span className="text-[11px] sm:text-xs font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200 animate-pulse">
                Curating gifts...
              </span>
            ) : (
              <span className="text-[11px] sm:text-xs font-medium text-[#E75480] bg-pink-50 px-2 py-0.5 rounded-full border border-pink-100">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'gift' : 'gifts'}
              </span>
            )}
          </h2>
          {searchQuery && !isLoading && (
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Showing matching gifts for: <strong className="text-[#E75480] font-medium">"{searchQuery}"</strong>
            </p>
          )}
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5 pt-0.5 md:flex-wrap md:overflow-visible">
          
          {/* Quick Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium transition cursor-pointer border flex items-center gap-1.5 shrink-0 ${
              inStockOnly
                ? 'bg-pink-50 border-pink-300 text-[#E75480]'
                : 'bg-white border-slate-200 text-slate-600 hover:border-pink-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${inStockOnly ? 'bg-[#E75480]' : 'bg-slate-300'}`} />
            <span>In Stock Only</span>
          </button>

          {/* Price Cap Filter */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-slate-200 text-[11px] sm:text-xs shrink-0">
            <span className="text-slate-500 font-medium hidden xs:inline">Under:</span>
            <span className="font-bold text-[#E75480]">{formatPrice(maxPriceFilter)}</span>
            <input
              type="range"
              min="250"
              max="20000"
              step="250"
              value={maxPriceFilter}
              onChange={(e) => setMaxPriceFilter(Number(e.target.value))}
              className="w-16 sm:w-24 accent-[#E75480] cursor-pointer"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-full px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs shrink-0">
            <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <select
              id="sort-gifts-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as FilterOptions['sortBy'])}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer text-[11px] sm:text-xs"
            >
              <option value="featured">Featured Gifts</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Clear Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="p-1 sm:p-1.5 text-slate-400 hover:text-[#E75480] transition cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}

        </div>
      </div>

      {/* Grid of Product Cards, Skeleton Loaders, or Empty State */}
      {isLoading ? (
        <div
          id="product-catalog-skeletons"
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 md:gap-6"
        >
          {Array.from({ length: 8 }).map((_, idx) => (
            <ProductCardSkeleton key={`catalog-skeleton-${idx}`} index={idx} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State Handling */
        <div className="bg-white rounded-2xl border border-slate-100 p-8 sm:p-16 text-center max-w-xl mx-auto my-6 shadow-2xs">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-50 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#E75480]">
            <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
          </div>

          <h3 className="font-semibold text-lg sm:text-xl text-slate-800 mb-2">
            No gifts currently available
          </h3>

          <p className="text-xs sm:text-sm text-slate-400 mb-6 leading-relaxed max-w-md mx-auto">
            {products.length === 0
              ? 'Our floral studio in Mwitu Centre, Meru is currently assembling new arrangements. Please check back shortly or get in touch for custom floral commissions.'
              : `We couldn't find any gifts matching your selected criteria "${selectedCategory}" with price under ${formatPrice(maxPriceFilter)}.`}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={resetAllFilters}
              className="bg-[#E75480] hover:bg-[#D6336C] text-white font-medium text-xs px-5 py-2.5 rounded-full shadow-md shadow-pink-100 transition flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Filters & View All</span>
            </button>

            {onOpenAddProduct && (
              <button
                onClick={onOpenAddProduct}
                className="bg-pink-50 hover:bg-pink-100 text-[#E75480] font-medium text-xs px-5 py-2.5 rounded-full border border-pink-200 transition flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Gift as Admin</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>
      )}

    </section>
  );
};
