import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SHOP_INFO } from '../utils/formatters';

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  category: string;
  image: string;
  accentColor: string;
  tag: string;
}

export interface StoreSettings {
  siteLogoUrl: string;
  siteName: string;
  siteTagline: string;
  topBarPromo: {
    enabled: boolean;
    locationText: string;
    supportName: string;
    supportPhoneDisplay: string;
    supportPhoneRaw: string;
    promoCode: string;
    promoText: string;
    instagramHandle: string;
    instagramUrl: string;
  };
  heroSlides: HeroSlide[];
}

const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: 'Meru Florist Collection',
    title: 'Handcrafted Blooms & Thoughtful Keepsakes',
    subtitle: 'From delicate fresh highland rose bouquets to artisanal gift hampers, deliver warmth and love in Meru and across Kenya.',
    ctaText: 'Explore Fresh Blooms',
    category: 'Fresh Bouquets',
    image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-rose-950/80 via-rose-900/60 to-transparent',
    tag: 'Same-Day Meru'
  },
  {
    id: 2,
    badge: 'VIP Curated Hampers',
    title: 'Luxury Gift Boxes for Life’s Grandest Milestones',
    subtitle: 'Indulge loved ones with gourmet Belgian chocolates, Mt. Kenya teas, hand-poured soy candles, and luxury celebration hampers.',
    ctaText: 'Discover Luxury Hampers',
    category: 'Luxury Hampers',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-slate-950/80 via-rose-950/60 to-transparent',
    tag: 'Mwitu Centre Shop'
  },
  {
    id: 3,
    badge: 'Everlasting Romance',
    title: 'Preserved Roses in Illuminated Crystal Glass',
    subtitle: '100% genuine preserved roses crafted to maintain their velvety luster for 3+ years without a single drop of water.',
    ctaText: 'Shop Preserved Roses',
    category: 'Preserved Roses',
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
    accentColor: 'from-pink-950/80 via-rose-950/60 to-transparent',
    tag: 'Timeless Gift'
  }
];

const DEFAULT_SETTINGS: StoreSettings = {
  siteLogoUrl: '',
  siteName: 'Petals Haven',
  siteTagline: 'Luxury Gift Boutique & Florist',
  topBarPromo: {
    enabled: true,
    locationText: '📍 Meru: Mwitu Centre Building (Below Sayen Hyperstore)',
    supportName: 'Winnie',
    supportPhoneDisplay: '+254 729 228 364',
    supportPhoneRaw: '254729228364',
    promoCode: 'MERU10',
    promoText: '10% off your order',
    instagramHandle: '@petalhaven_meru',
    instagramUrl: 'https://instagram.com/petalhaven_meru',
  },
  heroSlides: DEFAULT_HERO_SLIDES,
};

const SETTINGS_LOCAL_KEY = 'petals_haven_store_settings_v2';

interface StoreSettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  resetSettings: () => void;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_LOCAL_KEY);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Failed to parse saved settings', e);
    }
    return DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(merged));
      } catch (e) {
        console.warn('Failed to save store settings', e);
      }
      return merged;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(SETTINGS_LOCAL_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch (e) {
      console.warn('Failed to reset store settings', e);
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export function useStoreSettings() {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
}
