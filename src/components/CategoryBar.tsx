import React from 'react';
import { 
  Sparkles, 
  Gift, 
  Flame, 
  Heart, 
  Cookie, 
  Award, 
  Leaf, 
  Layers 
} from 'lucide-react';
import { CATEGORIES } from '../data/initialProducts';
import { Product } from '../types';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  products: Product[];
}

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  products,
}) => {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'All':
        return <Layers className="w-3.5 h-3.5" />;
      case 'Fresh Bouquets':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'Luxury Hampers':
        return <Gift className="w-3.5 h-3.5" />;
      case 'Preserved Roses':
        return <Heart className="w-3.5 h-3.5" />;
      case 'Artisanal Candles':
        return <Flame className="w-3.5 h-3.5" />;
      case 'Chocolates & Sweets':
        return <Cookie className="w-3.5 h-3.5" />;
      case 'Personalized Gifts':
        return <Award className="w-3.5 h-3.5" />;
      case 'Plant & Succulents':
        return <Leaf className="w-3.5 h-3.5" />;
      default:
        return <Gift className="w-3.5 h-3.5" />;
    }
  };

  const getCount = (cat: string) => {
    if (cat === 'All') return products.length;
    return products.filter(p => p.category === cat).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-4">
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = getCount(cat);

          return (
            <button
              key={cat}
              id={`cat-btn-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-[#E75480] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-[#E75480] hover:bg-pink-50 border border-slate-200 hover:border-pink-200'
              }`}
            >
              <span className={isSelected ? 'text-pink-100' : 'text-[#E75480]'}>
                {getCategoryIcon(cat)}
              </span>
              <span>{cat}</span>
              <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
