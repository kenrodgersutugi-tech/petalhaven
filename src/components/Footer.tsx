import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Heart, 
  Check, 
  Truck, 
  Gift, 
  ShieldCheck, 
  MapPin, 
  Phone,
  Instagram,
  MessageCircle,
  Clock,
  Award
} from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface FooterProps {
  onSelectCategory: (cat: string) => void;
  onOpenOrders?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenOrders }) => {
  const { settings } = useStoreSettings();
  const topPromo = settings.topBarPromo;
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setNewsletterEmail('');
  };

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-rose-950 mt-16">
      
      {/* Newsletter Strip */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FFB6C1] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#E75480]" /> Petals Haven VIP Circle
              </span>
              <h3 className="font-serif font-bold text-2xl text-white">
                Receive Special Seasonal Bloom Offers
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Subscribe for private holiday gift reveals, floral arrangement guides, and VIP discount vouchers in Meru and Kenya.
              </p>
            </div>

            <form onSubmit={handleNewsletter} className="w-full md:w-auto flex flex-col sm:flex-row gap-2 max-w-md">
              {newsletterSubscribed ? (
                <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-700 text-emerald-300 px-4 py-3 rounded-2xl text-xs font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Welcome to the VIP Club! Use code {topPromo.promoCode} at checkout.</span>
                </div>
              ) : (
                <>
                  <div className="relative flex-1">
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email address"
                      className="w-full sm:w-72 bg-slate-800 border border-slate-700 text-white text-xs rounded-xl pl-9 pr-3 py-3 focus:outline-none focus:border-[#FFB6C1]"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#E75480] hover:bg-[#D6336C] text-white text-xs font-semibold px-5 py-3 rounded-xl transition shadow-lg cursor-pointer"
                  >
                    Subscribe
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand story & Physical Location */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              {settings.siteLogoUrl ? (
                <img
                  src={settings.siteLogoUrl}
                  alt={settings.siteName}
                  className="w-8 h-8 object-contain rounded-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 bg-[#FFB6C1] rounded-full flex items-center justify-center text-white font-bold shadow-xs">
                  {settings.siteName.charAt(0) || 'P'}
                </div>
              )}
              <span className="text-xl font-semibold text-[#FFB6C1] tracking-tight font-serif">
                {settings.siteName}
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Artisan florist & premier luxury gift boutique located in <strong>Meru, Kenya</strong>. We craft unforgettable floral bouquets, romantic everlasting roses, artisanal candles, and luxury gift hampers for all celebrations.
            </p>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <MapPin className="w-4 h-4 text-[#FFB6C1] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-medium">Physical Shop Location:</strong>
                  <span>Mwitu Centre Building, shop just below Sayen Hyperstore, Meru, Kenya</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-800/60 p-3 rounded-xl border border-slate-800">
                <Phone className="w-4 h-4 text-[#FFB6C1] shrink-0" />
                <div>
                  <strong className="text-white block font-medium">Customer Support (Talk to {topPromo.supportName}):</strong>
                  <div className="flex items-center gap-3 mt-0.5">
                    <a 
                      href={`tel:${topPromo.supportPhoneRaw}`} 
                      className="text-[#FFB6C1] hover:underline font-semibold"
                    >
                      {topPromo.supportPhoneDisplay}
                    </a>
                    <a 
                      href={`https://wa.me/${topPromo.supportPhoneRaw}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp {topPromo.supportName}</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href={topPromo.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-950/60 border border-pink-800 text-[#FFB6C1] hover:bg-[#E75480] hover:text-white transition font-medium text-xs"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Follow {topPromo.instagramHandle}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Gift Collections */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Gift Collections</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onSelectCategory('Fresh Bouquets')} className="text-slate-400 hover:text-[#FFB6C1] transition cursor-pointer">
                  Fresh Bouquets
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Luxury Hampers')} className="text-slate-400 hover:text-[#FFB6C1] transition cursor-pointer">
                  Luxury Gift Hampers
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Preserved Roses')} className="text-slate-400 hover:text-[#FFB6C1] transition cursor-pointer">
                  Everlasting Roses
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Artisanal Candles')} className="text-slate-400 hover:text-[#FFB6C1] transition cursor-pointer">
                  Hand-Poured Candles
                </button>
              </li>
              <li>
                <button onClick={() => onSelectCategory('Chocolates & Sweets')} className="text-slate-400 hover:text-[#FFB6C1] transition cursor-pointer">
                  Belgian Chocolates
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery & Care */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Delivery & Care</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>📍 Meru Town Shop Pickup (Mwitu Centre)</li>
              <li>⚡ Same-Day Doorstep Rider in Meru</li>
              <li>🚚 Nationwide Kenya Express Courier</li>
              <li>🌸 Highland Fresh Cut Roses</li>
              <li>✍️ Complimentary Handwritten Card</li>
              <li>💬 Talk to {topPromo.supportName} for Custom Orders</li>
              {onOpenOrders && (
                <li className="pt-1">
                  <button
                    onClick={onOpenOrders}
                    className="text-[#FFB6C1] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    📦 View Past Orders & Tracking
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Col 4: Store Hours & Promises (Replaces Tech & Architecture) */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-3">Shop Hours & Promises</h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#FFB6C1] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Mon – Sat:</strong>
                  <span>08:00 AM – 07:00 PM EAT</span>
                </div>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#FFB6C1] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200 block">Sunday:</strong>
                  <span>09:00 AM – 05:00 PM EAT</span>
                </div>
              </li>
              <li className="flex items-start gap-2 pt-1 border-t border-slate-800">
                <Award className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>100% Quality & Freshness Hand-Tied Guarantee</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & payment methods */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 {settings.siteName}. Physical Shop: Mwitu Centre Building, Meru, Kenya.</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold text-[10px] tracking-wider">
              LIPA NA M-PESA
            </span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">VISA</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">MASTERCARD</span>
            <span className="px-2 py-1 bg-slate-800 rounded text-[10px] text-slate-300 font-mono">CASH ON PICKUP</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
