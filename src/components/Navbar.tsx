import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Shield, 
  LogOut, 
  X, 
  Menu, 
  CheckCircle2, 
  SlidersHorizontal,
  Phone,
  Store,
  LayoutDashboard,
  Package,
  Clock,
  Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';
import { CATEGORIES } from '../data/initialProducts';

interface NavbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onOpenAuth: () => void;
  onOpenProfile?: () => void;
  onOpenOrders?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenAuth,
  onOpenProfile,
  onOpenOrders,
}) => {
  const { user, role, isAdminUser, setRole, signOut } = useAuth();
  const { totalItemCount, wishlist, setIsCartOpen } = useCart();
  const { settings } = useStoreSettings();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const topPromo = settings.topBarPromo;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-pink-50 shadow-xs">
      {/* Top Notification Announcement Bar */}
      {topPromo.enabled && (
        <div className="bg-[#E75480] text-white text-[11px] sm:text-xs font-medium py-1 sm:py-1.5 px-3 sm:px-4 text-center tracking-wide flex items-center justify-between">
          <div className="hidden sm:flex items-center gap-2 text-pink-100">
            <Sparkles className="w-3.5 h-3.5 text-pink-200" />
            <span>{topPromo.locationText}</span>
          </div>
          <div className="mx-auto sm:mx-0 flex items-center gap-1.5 sm:gap-2">
            <span>
              ✨ WhatsApp <strong>{topPromo.supportName}</strong>:{' '}
              <a
                href={`https://wa.me/${topPromo.supportPhoneRaw}`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold text-white hover:text-pink-100"
              >
                {topPromo.supportPhoneDisplay}
              </a>
            </span>
            <span className="hidden md:inline text-white/60">•</span>
            <span className="hidden md:inline">
              Use code <strong className="bg-white/20 px-1.5 py-0.5 rounded text-white tracking-wider">{topPromo.promoCode}</strong> for {topPromo.promoText}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 text-pink-100">
            <a
              href={topPromo.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            >
              <span>{topPromo.instagramHandle}</span>
            </a>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2 sm:gap-4">
          
          {/* Mobile Menu Button */}
          <button 
            id="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-[#E75480] hover:bg-pink-50 transition"
            aria-label="Toggle Navigation Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>

          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a 
              href="#" 
              onClick={(e) => { 
                e.preventDefault(); 
                if (role === 'admin') setRole('customer');
                onSelectCategory('All'); 
              }}
              className="flex items-center gap-2 group"
            >
              {settings.siteLogoUrl ? (
                <img
                  src={settings.siteLogoUrl}
                  alt={settings.siteName}
                  className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-lg group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 sm:w-9 sm:h-9 bg-gradient-to-tr from-[#E75480] to-[#FFB6C1] rounded-full flex items-center justify-center text-white font-bold shadow-xs group-hover:scale-105 transition-transform text-sm sm:text-base font-serif">
                  {settings.siteName.charAt(0) || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-base sm:text-xl font-semibold tracking-tight text-[#E75480] font-serif leading-none">
                  {settings.siteName}
                </h1>
                {settings.siteTagline && (
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-0.5 hidden xs:block">
                    {settings.siteTagline}
                  </p>
                )}
              </div>
            </a>

            {/* Admin Active Mode Indicator Badge (Only shown to authenticated admin when viewing admin console) */}
            {isAdminUser && role === 'admin' && (
              <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-100 text-[#E75480] border border-pink-200">
                <Shield className="w-3 h-3" />
                <span>Store Owner Mode</span>
              </span>
            )}
          </div>

          {/* Search Bar with live filter */}
          <div className="flex-1 max-w-md mx-6 hidden md:block">
            <div className="relative">
              <input
                id="search-gifts-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search for fresh bouquets, hampers, chocolates..."
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-1.5 px-4 pr-10 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#FFB6C1] focus:bg-white transition-all"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => onSearchChange('')}
                  className="absolute right-9 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-3 sm:gap-5">
            
            {/* Authenticated Admin Quick Switch Button (Only if user is detected admin) */}
            {isAdminUser && (
              <button
                id="admin-mode-toggle-btn"
                onClick={() => setRole(role === 'admin' ? 'customer' : 'admin')}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer border ${
                  role === 'admin'
                    ? 'bg-slate-900 text-white border-slate-800 hover:bg-slate-800'
                    : 'bg-pink-50 text-[#E75480] border-pink-200 hover:bg-pink-100'
                }`}
                title={role === 'admin' ? 'Switch to Customer View' : 'Go to Admin Management'}
              >
                {role === 'admin' ? (
                  <>
                    <Store className="w-3.5 h-3.5 text-pink-300" />
                    <span>View Shop</span>
                  </>
                ) : (
                  <>
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Admin Portal</span>
                  </>
                )}
              </button>
            )}

            {/* Order History Quick Track Button */}
            <button
              id="header-track-orders-btn"
              onClick={() => {
                if (role === 'admin') setRole('customer');
                if (onOpenOrders) onOpenOrders();
              }}
              className="relative p-1.5 text-slate-600 hover:text-[#E75480] transition-colors cursor-pointer hidden xs:flex items-center"
              title="Track Previous Orders & Purchases"
            >
              <Package className="w-5 h-5" />
            </button>

            {/* Wishlist Icon with count */}
            <button
              id="wishlist-btn"
              onClick={() => {
                if (role === 'admin') setRole('customer');
                onSelectCategory('All');
              }}
              className="relative p-1.5 text-slate-600 hover:text-[#E75480] transition-colors cursor-pointer"
              title="Saved Gifts Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1.5 w-4 h-4 bg-[#E75480] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              id="open-cart-btn"
              onClick={() => {
                if (role === 'admin') setRole('customer');
                setIsCartOpen(true);
              }}
              className="relative cursor-pointer text-slate-700 hover:text-[#E75480] transition-colors flex items-center p-1"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#E75480] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              {user ? (
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center cursor-pointer border border-slate-200 hover:border-pink-200 transition-colors"
                >
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.full_name || 'User'} 
                      className="w-full h-full rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    id="track-orders-guest-btn"
                    onClick={onOpenOrders}
                    className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1.5 rounded-full text-slate-600 hover:text-[#E75480] hover:bg-pink-50 transition cursor-pointer"
                  >
                    Track Orders
                  </button>
                  <button
                    id="sign-in-btn"
                    onClick={onOpenAuth}
                    className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 hover:bg-pink-50 hover:text-[#E75480] transition-colors cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* User Dropdown Menu */}
              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2.5 border-b border-pink-50">
                    <p className="text-xs font-medium text-slate-400">Signed in as</p>
                    <p className="text-sm font-semibold text-slate-800 truncate">{user.full_name || user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 text-[10px] font-medium rounded-full bg-pink-50 text-[#E75480]">
                      {isAdminUser ? 'Store Administrator' : 'Valued Customer'}
                    </span>
                  </div>

                  {/* Order History Option */}
                  <button
                    id="menu-order-history-btn"
                    onClick={() => {
                      if (onOpenOrders) onOpenOrders();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-pink-50 flex items-center gap-2.5 font-semibold cursor-pointer"
                  >
                    <Package className="w-4 h-4 text-[#E75480]" />
                    <span>Order History & Tracking</span>
                  </button>

                  {/* User Profile & Perks Option */}
                  <button
                    id="menu-profile-perks-btn"
                    onClick={() => {
                      if (onOpenProfile) onOpenProfile();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-pink-50 flex items-center gap-2.5 font-medium cursor-pointer"
                  >
                    <Award className="w-4 h-4 text-pink-500" />
                    <span>My Profile & VIP Perks</span>
                  </button>

                  {isAdminUser && (
                    <button
                      id="menu-switch-admin-btn"
                      onClick={() => {
                        setRole(role === 'admin' ? 'customer' : 'admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-pink-50 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2 font-medium">
                        <Shield className="w-3.5 h-3.5 text-[#E75480]" />
                        {role === 'admin' ? 'Switch to Customer Shop' : 'Store Admin Dashboard'}
                      </span>
                      <CheckCircle2 className={`w-3.5 h-3.5 ${role === 'admin' ? 'text-[#E75480]' : 'text-transparent'}`} />
                    </button>
                  )}

                  <div className="border-t border-pink-50 my-1" />

                  <button
                    id="sign-out-btn"
                    onClick={() => {
                      signOut();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-[#E75480] hover:bg-pink-50 flex items-center gap-2 font-medium cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <input
              id="mobile-search-gifts-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search gifts, flowers, chocolates..."
              className="w-full bg-slate-50 text-slate-800 text-sm placeholder-slate-400 pl-4 pr-10 py-1.5 rounded-full border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#FFB6C1]"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-pink-100 py-3 bg-white animate-in slide-in-from-top-2 duration-150">
            {/* Quick Mobile Order History Link */}
            <div className="px-3 pb-2 mb-2 border-b border-pink-50 flex items-center gap-2">
              <button
                onClick={() => {
                  if (onOpenOrders) onOpenOrders();
                  setIsMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-pink-50 text-[#E75480] text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>Order History</span>
              </button>
              {user && (
                <button
                  onClick={() => {
                    if (onOpenProfile) onOpenProfile();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
              )}
            </div>

            {isAdminUser && (
              <div className="mb-3 px-3">
                <button
                  onClick={() => {
                    setRole(role === 'admin' ? 'customer' : 'admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Shield className="w-4 h-4 text-[#FFB6C1]" />
                  <span>{role === 'admin' ? 'Switch to Customer Shop' : 'Open Admin Portal'}</span>
                </button>
              </div>
            )}

            <div className="space-y-1 px-2">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 px-2">Gift Categories</p>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => {
                    if (role === 'admin') setRole('customer');
                    onSelectCategory(cat);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-pink-50 text-[#E75480]' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
