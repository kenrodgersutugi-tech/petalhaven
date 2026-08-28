import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Sparkles } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const InstallPwaPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone PWA mode
    const isInStandalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isInStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Listen for beforeinstallprompt on Chromium / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Do not show if dismissed or already running as installed standalone app
  if (isStandalone || isDismissed) {
    return null;
  }

  // If deferredPrompt is available or on iOS Safari
  if (!deferredPrompt && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.log('[PWA] User accepted the Divine Beauty Hub install prompt');
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <div 
        id="pwa-install-banner"
        className="bg-gradient-to-r from-pink-500 via-[#E75480] to-rose-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 shadow-md flex items-center justify-between text-xs transition-all z-30 sticky top-0"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#E75480] p-1 flex items-center justify-center shadow-xs shrink-0">
            <img 
              src="/icon-192x192.png" 
              alt="Divine Beauty Rose" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate text-[11px] sm:text-xs tracking-tight flex items-center gap-1.5">
              <span>Install Divine Beauty Hub</span>
              <span className="hidden sm:inline-block bg-white/20 text-[10px] px-1.5 py-0.2 rounded text-white font-normal">
                PWA
              </span>
            </p>
            <p className="text-[10px] sm:text-[11px] text-pink-100 truncate">
              Shop faster & enjoy offline access directly from your home screen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="install-pwa-action-btn"
            type="button"
            onClick={handleInstallClick}
            className="bg-white text-[#E75480] hover:bg-pink-50 font-bold px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
          
          <button
            id="dismiss-pwa-banner-btn"
            type="button"
            onClick={() => setIsDismissed(true)}
            className="text-pink-200 hover:text-white p-1 rounded-full transition cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Safari Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <img src="/icon-192x192.png" alt="Rose" className="w-6 h-6 object-contain" />
                <h3 className="font-bold text-sm text-slate-900">Install on iPhone / iPad</h3>
              </div>
              <button 
                onClick={() => setShowIOSGuide(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              To install <strong className="text-[#E75480]">Divine Beauty Hub</strong> on Safari:
            </p>

            <ol className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Tap the <Share className="w-3.5 h-3.5 inline text-blue-600 mx-0.5" /> <strong>Share</strong> button at bottom of Safari</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and tap <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-0.5" /> <strong>Add to Home Screen</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>Add</strong> in the top-right corner to finish</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full bg-[#E75480] hover:bg-[#D6336C] text-white text-xs font-semibold py-2 rounded-xl transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
