import React from 'react';

interface ProductCardSkeletonProps {
  index?: number;
}

export const ProductCardSkeleton: React.FC<ProductCardSkeletonProps> = ({ index = 0 }) => {
  return (
    <div
      id={`product-card-skeleton-${index}`}
      className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-2xs flex flex-col animate-pulse"
      aria-hidden="true"
    >
      {/* Image Skeleton Box */}
      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden flex items-center justify-center">
        {/* Soft Floral / Gift Silhouette in center */}
        <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-slate-200/50 flex items-center justify-center">
          <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-slate-200/70" />
        </div>

        {/* Top-left badge placeholder */}
        <div className="absolute top-1.5 left-1.5 sm:top-2.5 sm:left-2.5 h-4 sm:h-5 w-10 sm:w-14 rounded bg-slate-200/80" />

        {/* Top-right wishlist button placeholder */}
        <div className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-200/80 shadow-2xs" />
      </div>

      {/* Card Content Skeleton */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating row */}
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            {/* Category tag */}
            <div className="h-2.5 sm:h-3 w-14 sm:w-20 bg-pink-100/80 rounded-full" />
            
            {/* Rating placeholder */}
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm bg-amber-100" />
              <div className="h-2.5 sm:h-3 w-5 sm:w-7 bg-slate-200/70 rounded-xs" />
            </div>
          </div>

          {/* Title lines */}
          <div className="space-y-1 sm:space-y-1.5 mb-2 sm:mb-2.5">
            <div className="h-3 sm:h-4 bg-slate-200/85 rounded w-11/12" />
            <div className="h-3 sm:h-4 bg-slate-200/60 rounded w-3/5" />
          </div>

          {/* Description snippet line (hidden on mobile) */}
          <div className="hidden sm:block h-3 bg-slate-100 rounded w-full mb-3" />
        </div>

        {/* Price & Action Row */}
        <div className="pt-1.5 sm:pt-2.5 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            {/* Price tag */}
            <div className="h-4 sm:h-5 w-14 sm:w-20 bg-slate-200/90 rounded mb-1" />
            {/* Stock indicator */}
            <div className="h-2 sm:h-2.5 w-12 sm:w-16 bg-emerald-100/70 rounded-full" />
          </div>

          {/* Add-to-cart button skeleton */}
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-100 border border-slate-200/60" />
        </div>
      </div>
    </div>
  );
};
