import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, PhoneCall, Clock } from 'lucide-react';
import { useStoreSettings } from '../context/StoreSettingsContext';

export const WhatsAppFAB: React.FC = () => {
  const { settings } = useStoreSettings();
  const topPromo = settings.topBarPromo;
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasDismissedBadge, setHasDismissedBadge] = useState(false);

  const rawPhone = topPromo.supportPhoneRaw || '254729228364';
  const displayPhone = topPromo.supportPhoneDisplay || '+254 729 228 364';
  const supportName = topPromo.supportName || 'Winnie';

  const defaultMessage = encodeURIComponent(
    `Hello Petals Haven Meru! I'm browsing the store and have a question about your fresh blooms, custom gift hampers, and same-day delivery.`
  );

  const whatsappUrl = `https://wa.me/${rawPhone}?text=${defaultMessage}`;

  return (
    <div className="fixed bottom-3.5 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none">
      
      {/* Interactive Chat Prompt Bubble (Only shown on larger screens or small prompt on mobile) */}
      {!hasDismissedBadge && (
        <div className="hidden xs:block pointer-events-auto mb-2 sm:mb-3 max-w-[240px] sm:max-w-[280px] bg-white text-slate-800 p-2.5 sm:p-3.5 rounded-2xl shadow-xl border border-pink-100 text-xs animate-in fade-in slide-in-from-bottom-3 duration-300 relative group">
          <button
            id="dismiss-whatsapp-badge"
            onClick={() => setHasDismissedBadge(true)}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full flex items-center justify-center transition cursor-pointer shadow-xs"
            aria-label="Dismiss chat prompt"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px] sm:text-xs">
              <Sparkles className="w-3 h-3 text-[#E75480]" />
              Chat with {supportName}
            </span>
            <span className="text-[9px] sm:text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-medium ml-auto">
              Online
            </span>
          </div>

          <p className="text-slate-600 text-[10px] sm:text-[11px] leading-relaxed">
            Need same-day delivery in Meru or custom blooms? Tap to chat directly!
          </p>

          <div className="mt-1.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-mono font-medium text-slate-600">
              <PhoneCall className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#E75480]" />
              {displayPhone}
            </span>
            <span className="flex items-center gap-0.5 text-slate-400">
              <Clock className="w-2.5 h-2.5" /> Fast replies
            </span>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <a
        id="persistent-whatsapp-fab"
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="pointer-events-auto group relative flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white p-2.5 sm:pl-3.5 sm:pr-4 sm:py-3 rounded-full shadow-lg shadow-emerald-900/25 transition-all duration-200 border-2 border-white/80 cursor-pointer"
        aria-label={`Chat directly on WhatsApp with ${supportName} at ${displayPhone}`}
      >
        {/* Pulsing beacon glow effect */}
        <span className="absolute -inset-0.5 rounded-full bg-emerald-400 opacity-40 blur-xs group-hover:opacity-75 transition duration-300 animate-pulse" />

        <div className="relative z-10 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 fill-white text-emerald-500 group-hover:scale-110 transition-transform duration-200" />
        </div>

        <div className="relative z-10 text-left hidden sm:block">
          <span className="block text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider text-emerald-100 leading-none">
            WhatsApp Help
          </span>
          <span className="block text-[11px] sm:text-xs font-bold text-white leading-tight">
            Chat with {supportName}
          </span>
        </div>

        {/* Unread notification dot badge */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E75480] text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
          1
        </span>
      </a>
    </div>
  );
};
