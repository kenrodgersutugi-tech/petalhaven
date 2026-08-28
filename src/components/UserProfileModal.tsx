import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShoppingBag, 
  Heart, 
  Shield, 
  Sparkles, 
  LogOut, 
  Search, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Gift, 
  Award,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { OrderHistory } from './OrderHistory';
import { formatPrice } from '../utils/formatters';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'orders' | 'profile' | 'wishlist';
  onOpenAuth?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'orders',
  onOpenAuth,
}) => {
  const { user, signOut, isAdminUser, role, setRole } = useAuth();
  const { wishlist } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'lookup'>(
    user ? (initialTab === 'profile' ? 'profile' : 'orders') : 'lookup'
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');
  const [isSearchingLookup, setIsSearchingLookup] = useState(false);

  // Sync initial tab when opened
  useEffect(() => {
    if (isOpen) {
      if (user) {
        setActiveTab(initialTab === 'profile' ? 'profile' : 'orders');
      } else {
        setActiveTab('lookup');
      }
      fetchOrders();
    }
  }, [isOpen, user, initialTab]);

  const fetchOrders = async (emailOverride?: string) => {
    setLoadingOrders(true);
    try {
      const email = emailOverride || user?.email || undefined;
      const userId = user?.id || undefined;
      
      let fetched = await orderService.getUserOrders(userId, email);
      setOrders(fetched);
    } catch (err) {
      console.warn('Error loading user orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleLookupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;

    setIsSearchingLookup(true);
    try {
      const results = await orderService.getUserOrders(null, lookupEmail.trim());
      setOrders(results);
      setActiveTab('orders');
    } catch (err) {
      console.warn('Error looking up orders:', err);
    } finally {
      setIsSearchingLookup(false);
    }
  };

  if (!isOpen) return null;

  // Stats calculation
  const totalSpent = orders.reduce((sum, ord) => sum + (ord.status !== 'cancelled' ? ord.total_amount : 0), 0);
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const inProgressOrdersCount = orders.filter(o => o.status === 'processing' || o.status === 'shipped').length;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        id="user-profile-modal-container"
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-pink-100 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-pink-100 bg-gradient-to-r from-pink-50/70 via-rose-50/40 to-white flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {user ? (
              <div className="relative shrink-0">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name || 'User'}
                    className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover border-2 border-white shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#E75480] text-white flex items-center justify-center font-bold text-sm sm:text-lg shadow-xs">
                    {(user.full_name || user.email || 'P')[0].toUpperCase()}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-4 sm:h-4 bg-emerald-500 border-2 border-white rounded-full" />
              </div>
            ) : (
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-pink-100 text-[#E75480] flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-serif font-bold text-slate-900 text-sm sm:text-xl truncate">
                  {user ? (user.full_name || 'My Account') : 'Track Gift Orders'}
                </h3>
                {isAdminUser && (
                  <span className="text-[9px] sm:text-[10px] bg-slate-900 text-white font-bold px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full uppercase tracking-wider shrink-0">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {user ? user.email : 'Track past purchases in Meru'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={() => fetchOrders()}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Refresh order history"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loadingOrders ? 'animate-spin text-[#E75480]' : ''}`} />
            </button>
            <button
              id="close-profile-modal-btn"
              onClick={onClose}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition cursor-pointer"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-3 sm:px-6 border-b border-slate-100 bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {user && (
            <>
              <button
                id="tab-order-history-btn"
                onClick={() => setActiveTab('orders')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-[#E75480] text-[#E75480]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Order History</span>
                <span className="px-1.5 py-0.2 rounded-full text-[11px] bg-pink-100 text-[#E75480] font-bold">
                  {orders.length}
                </span>
              </button>

              <button
                id="tab-account-profile-btn"
                onClick={() => setActiveTab('profile')}
                className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  activeTab === 'profile'
                    ? 'border-[#E75480] text-[#E75480]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="w-4 h-4" />
                <span>Profile & Perks</span>
              </button>
            </>
          )}

          <button
            id="tab-lookup-order-btn"
            onClick={() => setActiveTab('lookup')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold border-b-2 transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'lookup'
                ? 'border-[#E75480] text-[#E75480]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Track by Email / Phone</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6">

          {/* Tab 1: Order History */}
          {activeTab === 'orders' && (
            <div className="space-y-4 sm:space-y-5">
              {/* Quick High-Level Metrics */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
                <div className="bg-pink-50/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-pink-100 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Purchases
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-slate-900">
                    {orders.length}
                  </span>
                </div>

                <div className="bg-emerald-50/60 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-emerald-100 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    In Transit
                  </span>
                  <span className="text-sm sm:text-lg font-bold text-emerald-700">
                    {inProgressOrdersCount}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-2 sm:p-3 border border-slate-100 text-center">
                  <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                    Spent
                  </span>
                  <span className="text-xs sm:text-lg font-bold text-[#E75480] truncate block">
                    {formatPrice(totalSpent)}
                  </span>
                </div>
              </div>

              {/* Orders History List & Tracking Component */}
              <OrderHistory
                orders={orders}
                isLoading={loadingOrders}
                onRefresh={fetchOrders}
                onCloseParent={onClose}
              />
            </div>
          )}

          {/* Tab 2: Profile & VIP Perks */}
          {activeTab === 'profile' && user && (
            <div className="space-y-5">
              {/* Customer Card */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 relative overflow-hidden shadow-lg">
                <div className="absolute right-0 bottom-0 opacity-10 translate-x-4 translate-y-4">
                  <Sparkles className="w-48 h-48 text-pink-300" />
                </div>

                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 text-xs font-semibold">
                      <Award className="w-3.5 h-3.5" />
                      Petals Haven Floral Club VIP
                    </span>
                    <span className="text-xs text-slate-400">Meru Chapter</span>
                  </div>

                  <div>
                    <h4 className="text-lg sm:text-xl font-bold">{user.full_name || 'Valued Patron'}</h4>
                    <p className="text-xs text-slate-300">{user.email}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
                    <span>Saved Gifts: <strong className="text-white">{wishlist.length}</strong></span>
                    <span>Delivered Orders: <strong className="text-white">{completedOrdersCount}</strong></span>
                    <span>Account: <strong className="text-pink-300 uppercase">{user.role}</strong></span>
                  </div>
                </div>
              </div>

              {/* VIP Benefits & Exclusive Codes */}
              <div className="bg-pink-50/60 rounded-2xl border border-pink-100 p-4 space-y-3">
                <h5 className="font-semibold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#E75480]" />
                  Your Active Customer Perks
                </h5>
                <ul className="text-xs text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Free Express Delivery</strong> in Meru on any bouquet order over KES 5,000</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Complimentary Floral Card</strong> hand-written with satin ribbon on every order</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>VIP Promo Code: <code className="bg-white px-2 py-0.5 rounded font-bold text-[#E75480] border border-pink-200">WINNIE15</code> for 15% off</span>
                  </li>
                </ul>
              </div>

              {/* Admin switch if admin user */}
              {isAdminUser && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h6 className="font-bold text-slate-800 text-xs">Store Management Mode</h6>
                    <p className="text-[11px] text-slate-500">Access inventory, orders, and product creator</p>
                  </div>
                  <button
                    onClick={() => {
                      setRole(role === 'admin' ? 'customer' : 'admin');
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    {role === 'admin' ? 'Switch to Shop' : 'Open Admin Portal'}
                  </button>
                </div>
              )}

              {/* Sign Out Button */}
              <div className="pt-2">
                <button
                  id="profile-sign-out-btn"
                  onClick={() => {
                    signOut();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out of Petals Haven
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Order Lookup (for Guest/Unauthenticated or alternate email) */}
          {activeTab === 'lookup' && (
            <div className="space-y-5">
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <Search className="w-4 h-4 text-[#E75480]" />
                    Find Previous Purchases
                  </h4>
                  <p className="text-xs text-slate-500">
                    Enter the email address you used during checkout to retrieve your past flower orders and track delivery status in real-time.
                  </p>
                </div>

                <form onSubmit={handleLookupSubmit} className="space-y-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Email Address Used at Checkout
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={lookupEmail}
                        onChange={(e) => setLookupEmail(e.target.value)}
                        placeholder="e.g. kenrodgersutugi@gmail.com"
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSearchingLookup}
                    className="w-full py-2.5 px-4 bg-[#E75480] hover:bg-[#D43D6D] text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    {isSearchingLookup ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching Orders...</span>
                      </>
                    ) : (
                      <>
                        <Search className="w-3.5 h-3.5" />
                        <span>Look Up My Gift Orders</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {!user && onOpenAuth && (
                <div className="text-center p-4 bg-pink-50/50 rounded-2xl border border-pink-100 space-y-2">
                  <p className="text-xs text-slate-600">
                    Have a Petals Haven customer account?
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAuth();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#E75480] hover:underline cursor-pointer"
                  >
                    <span>Sign In for one-click access to all your past orders</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
