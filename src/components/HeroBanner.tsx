import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Truck, 
  Gift, 
  ShieldCheck, 
  HeartHandshake,
  ChevronLeft, 
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface HeroBannerProps {
  onSelectCategory: (category: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory }) => {
  const { settings } = useStoreSettings();
  const slides = settings.heroSlides.length > 0 ? settings.heroSlides : [];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  const activeIndex = Math.min(currentSlide, slides.length - 1);
  const slide = slides[activeIndex];

  return (
    <section className="relative overflow-hidden pt-2 sm:pt-4 pb-4 sm:pb-6">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Main Banner Carousel */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl min-h-[260px] sm:min-h-[380px] md:min-h-[460px] flex items-center bg-slate-900">
          {/* Background Image with Zoom transition */}
          <div className="absolute inset-0 z-0">
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover object-center transition-transform duration-1000 scale-105"
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.accentColor || 'from-slate-950/80 via-rose-950/60 to-transparent'}`} />
          </div>

          {/* Banner Content */}
          <div className="relative z-10 max-w-2xl px-4 sm:px-12 py-6 sm:py-10 text-white">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-pink-100 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2.5 sm:mb-4 border border-white/20">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFB6C1]" />
              <span>{slide.badge}</span>
              {slide.tag && (
                <span className="bg-[#E75480] text-white text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {slide.tag}
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-2 sm:mb-4 tracking-tight drop-shadow-xs">
              {slide.title}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-pink-50/90 mb-3.5 sm:mb-6 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-lg">
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                id="hero-cta-btn"
                onClick={() => onSelectCategory(slide.category || 'All')}
                className="bg-[#E75480] hover:bg-[#D6336C] text-white px-4 py-2 sm:px-6 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-md shadow-pink-900/20 flex items-center gap-1.5 sm:gap-2 group cursor-pointer"
              >
                <span>{slide.ctaText || 'Shop Collection'}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectCategory('All')}
                className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full font-medium text-xs sm:text-sm transition-all border border-white/20 hover:border-white/40 cursor-pointer"
              >
                View Catalog
              </button>
            </div>
          </div>

          {/* Carousel Arrows (Hidden on mobile to prevent overlapping text) */}
          {slides.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))}
                className="hidden sm:flex absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white items-center justify-center transition cursor-pointer"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                className="hidden sm:flex absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white items-center justify-center transition cursor-pointer"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Indicator dots */}
          {slides.length > 1 && (
            <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 z-10">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                    activeIndex === idx ? 'w-6 sm:w-8 bg-[#E75480]' : 'w-1.5 sm:w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Value Proposition Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4 mt-3 sm:mt-6">
          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-pink-200 transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center shrink-0">
              <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800">Meru Delivery</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Rider to door</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-pink-200 transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center shrink-0">
              <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800">Gift Packaging</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Custom note + ribbon</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-pink-200 transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800">Fresh Blooms</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Quality assured florist</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 bg-white rounded-xl border border-slate-100 shadow-2xs hover:border-pink-200 transition-colors">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-semibold text-slate-800">M-PESA / Card</p>
              <p className="text-[10px] sm:text-[11px] text-slate-400">Instant Lipa Na M-PESA</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
