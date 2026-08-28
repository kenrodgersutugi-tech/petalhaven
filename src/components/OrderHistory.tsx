import React, { useState } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  Truck, 
  Gift, 
  Calendar, 
  MapPin, 
  Phone, 
  ShoppingBag, 
  RotateCcw, 
  Search, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertCircle,
  MessageCircle,
  FileText
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { formatPrice } from '../utils/formatters';
import { useCart } from '../context/CartContext';
import { useStoreSettings } from '../context/StoreSettingsContext';

interface OrderHistoryProps {
  orders: Order[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onSelectProductToView?: (productId: string) => void;
  onCloseParent?: () => void;
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({
  orders,
  isLoading = false,
  onRefresh,
  onCloseParent,
}) => {
  const { addToCart } = useCart();
  const { settings } = useStoreSettings();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [reorderedOrderId, setReorderedOrderId] = useState<string | null>(null);

  const rawPhone = settings.topBarPromo.supportPhoneRaw || '254729228364';

  const toggleExpand = (id: string) => {
    setExpandedOrderId(prev => (prev === id ? null : id));
  };

  const getStatusProgress = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return { percentage: 25, label: 'Order Placed & Scheduled', step: 1 };
      case 'processing': return { percentage: 55, label: 'Arranging Fresh Blooms & Gifts', step: 2 };
      case 'shipped': return { percentage: 80, label: 'Dispatched with Meru Rider', step: 3 };
      case 'delivered': return { percentage: 100, label: 'Delivered to Recipient', step: 4 };
      case 'cancelled': return { percentage: 0, label: 'Order Cancelled', step: 0 };
      default: return { percentage: 25, label: 'Processing', step: 1 };
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Dispatched
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" /> Processing
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getStatusStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'pending': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      case 'cancelled': return 0;
      default: return 1;
    }
  };

  const handleReorder = (order: Order) => {
    if (!order.items || order.items.length === 0) return;
    
    order.items.forEach(item => {
      // Re-create a minimal Product object
      addToCart({
        id: item.product_id,
        title: item.product_title || 'Floral Bouquet',
        description: 'Floral arrangement from previous order',
        price: item.price,
        category: 'Fresh Bouquets',
        stock_quantity: 10,
        image_url: item.product_image || 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=800&q=80',
      }, item.quantity);
    });

    setReorderedOrderId(order.id);
    setTimeout(() => {
      setReorderedOrderId(null);
      if (onCloseParent) onCloseParent();
    }, 1200);
  };

  const getWhatsAppHelpLink = (order: Order) => {
    const text = encodeURIComponent(
      `Hello Petals Haven Meru! I would like to check on my previous order #${order.id.slice(0, 10)} (${order.customer_name}, ${formatPrice(order.total_amount)}). Could you provide an update on delivery?`
    );
    return `https://wa.me/${rawPhone}?text=${text}`;
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (selectedStatus !== 'all' && order.status !== selectedStatus) {
      return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchName = order.customer_name?.toLowerCase().includes(q);
      const matchCity = order.city?.toLowerCase().includes(q);
      const matchAddress = order.shipping_address?.toLowerCase().includes(q);
      const matchItems = order.items?.some(item => 
        item.product_title?.toLowerCase().includes(q)
      );
      const matchMessage = order.gift_message?.toLowerCase().includes(q);

      return matchId || matchName || matchCity || matchAddress || matchItems || matchMessage;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'processing', label: 'In Preparation' },
            { id: 'shipped', label: 'Out for Delivery' },
            { id: 'delivered', label: 'Delivered' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap cursor-pointer ${
                selectedStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search within orders */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search gifts, order ID, notes..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-full pl-8 pr-3 py-1.5 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] focus:bg-white"
          />
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <div className="w-6 h-6 border-2 border-[#E75480] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-medium">Loading your gift purchases...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        /* Empty State */
        <div className="py-12 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-pink-50 text-[#E75480] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800">
              {searchQuery || selectedStatus !== 'all' ? 'No matching orders found' : 'No gift orders yet'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || selectedStatus !== 'all'
                ? 'Try adjusting your search query or status filter to locate previous purchases.'
                : 'Your fresh floral arrangements and luxury gift hampers will appear here once placed.'}
            </p>
          </div>
          {onCloseParent && !searchQuery && selectedStatus === 'all' && (
            <button
              onClick={onCloseParent}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E75480] hover:bg-[#D43D6D] text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Explore Fresh Blooms
            </button>
          )}
        </div>
      ) : (
        /* Orders List */
        <div className="space-y-3.5">
          {filteredOrders.map(order => {
            const isExpanded = expandedOrderId === order.id;
            const stepIndex = getStatusStepIndex(order.status);
            const statusInfo = getStatusProgress(order.status);
            const isReordered = reorderedOrderId === order.id;
            const items = order.items || [];
            const firstItem = items[0];
            const otherItemsCount = items.length - 1;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-pink-200 transition-all overflow-hidden"
              >
                {/* Order Header Summary Bar */}
                <div 
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer bg-gradient-to-r from-slate-50/50 via-white to-pink-50/20 hover:bg-slate-50/80 transition"
                >
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Item Thumbnail Preview */}
                    <div className="relative shrink-0">
                      {firstItem?.product_image ? (
                        <img
                          src={firstItem.product_image}
                          alt={firstItem.product_title || 'Gift'}
                          className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-pink-50 text-[#E75480] flex items-center justify-center border border-pink-100">
                          <Gift className="w-6 h-6" />
                        </div>
                      )}
                      {otherItemsCount > 0 && (
                        <span className="absolute -bottom-1 -right-1 bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs">
                          +{otherItemsCount}
                        </span>
                      )}
                    </div>

                    {/* Order Primary Details & Mini Progress */}
                    <div className="space-y-1 flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-slate-900">
                          #{order.id.slice(0, 12)}
                        </span>
                        {getStatusBadge(order.status)}
                        {order.gift_wrapping && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100/80 text-[#E75480] border border-pink-200">
                            <Gift className="w-3 h-3" /> Gift Wrapped
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {firstItem?.product_title || 'Floral Order'}
                        {otherItemsCount > 0 ? ` & ${otherItemsCount} more item${otherItemsCount > 1 ? 's' : ''}` : ''}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#E75480]">
                          {formatPrice(order.total_amount)}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                          {order.payment_method}
                        </span>
                      </div>

                      {/* Header Mini Animated Progress Bar */}
                      {order.status !== 'cancelled' && (
                        <div className="pt-1.5 max-w-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                            <span className="flex items-center gap-1 font-medium text-[10px]">
                              {order.status === 'delivered' ? (
                                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Delivered
                                </span>
                              ) : (
                                <span className="text-[#E75480] font-semibold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#E75480] animate-ping" />
                                  {statusInfo.label}
                                </span>
                              )}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 font-bold">
                              {statusInfo.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-500'
                                  : 'bg-gradient-to-r from-pink-500 via-[#E75480] to-rose-400'
                              }`}
                              style={{ width: `${statusInfo.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Expansion Indicator */}
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReorder(order);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                        isReordered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-pink-50 hover:bg-pink-100 text-[#E75480]'
                      }`}
                      title="Add all items back into your shopping cart"
                    >
                      <RotateCcw className={`w-3 h-3 ${isReordered ? 'animate-spin' : ''}`} />
                      <span>{isReordered ? 'Added to Cart!' : 'Buy Again'}</span>
                    </button>

                    <div className="text-slate-400 p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Progress Tracker (Visible when expanded) */}
                {isExpanded && order.status !== 'cancelled' && (
                  <div className="px-5 py-4 bg-slate-50/80 border-t border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#E75480]" />
                        Live Fulfillment Pipeline in Meru:
                      </span>
                      <span className="text-xs font-bold text-[#E75480]">
                        {statusInfo.percentage}% Complete
                      </span>
                    </div>

                    {/* Animated Connected Multi-Stage Progress Bar */}
                    <div className="relative pt-2 pb-1">
                      {/* Background Bar */}
                      <div className="absolute top-[18px] left-[10%] right-[10%] h-1.5 bg-slate-200 rounded-full" />

                      {/* Animated Active Progress Line */}
                      <div 
                        className="absolute top-[18px] left-[10%] h-1.5 bg-gradient-to-r from-[#E75480] via-pink-500 to-rose-400 rounded-full transition-all duration-1000 ease-out shadow-xs"
                        style={{ 
                          width: stepIndex === 1 ? '0%' : stepIndex === 2 ? '26%' : stepIndex === 3 ? '53%' : '80%' 
                        }}
                      />

                      {/* 4 Step Milestone Nodes */}
                      <div className="relative z-10 grid grid-cols-4 gap-1">
                        {[
                          { label: 'Placed', sub: 'Received', step: 1, icon: FileText },
                          { label: 'Arranging', sub: 'Florist Prep', step: 2, icon: Sparkles },
                          { label: 'Dispatched', sub: 'On Route', step: 3, icon: Truck },
                          { label: 'Delivered', sub: 'Completed', step: 4, icon: CheckCircle2 },
                        ].map((item) => {
                          const isDone = stepIndex >= item.step;
                          const isCurrent = stepIndex === item.step;
                          const Icon = item.icon;

                          return (
                            <div key={item.step} className="flex flex-col items-center text-center space-y-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 relative ${
                                  isDone
                                    ? 'bg-[#E75480] text-white shadow-sm'
                                    : 'bg-white border-2 border-slate-200 text-slate-400'
                                } ${isCurrent ? 'ring-4 ring-pink-300 ring-offset-1 scale-110' : ''}`}
                              >
                                <Icon className={`w-4 h-4 ${isCurrent && item.step === 2 ? 'animate-spin' : ''}`} />
                                {isCurrent && (
                                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                                )}
                              </div>
                              <span
                                className={`text-[11px] font-bold leading-tight ${
                                  isDone ? 'text-slate-900' : 'text-slate-400'
                                }`}
                              >
                                {item.label}
                              </span>
                              <span className="text-[9px] text-slate-400 hidden sm:block">
                                {item.sub}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Real-time Status Description Box */}
                    <div className="bg-white p-2.5 rounded-xl border border-pink-100 flex items-center gap-2 text-xs text-slate-700 shadow-2xs">
                      <Clock className="w-3.5 h-3.5 text-[#E75480] shrink-0" />
                      <span className="text-[11px] font-medium text-slate-700">
                        {order.status === 'pending' && '📋 Order details received. Scheduled for fresh flower harvest and stem conditioning.'}
                        {order.status === 'processing' && '🌸 Florist is currently hand-tying the floral stems, packaging gifts, and writing your gift card.'}
                        {order.status === 'shipped' && '🚚 Bouquet is safely secured with our Meru Town rider and is on route to recipient.'}
                        {order.status === 'delivered' && '🎉 Order successfully delivered to recipient in pristine condition!'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div className="p-5 space-y-4 bg-white text-xs border-t border-slate-100">
                    {/* Item Summaries */}
                    <div>
                      <h5 className="font-bold text-slate-800 text-xs mb-2.5 flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-[#E75480]" />
                        Purchased Gift Items ({items.length})
                      </h5>
                      <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 overflow-hidden bg-slate-50/40">
                        {items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {item.product_image ? (
                                <img
                                  src={item.product_image}
                                  alt={item.product_title || 'Item'}
                                  className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-pink-100 text-[#E75480] flex items-center justify-center">
                                  <Gift className="w-4 h-4" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold text-slate-900 text-xs">
                                  {item.product_title || 'Floral Item'}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  Qty: {item.quantity} × {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>
                            <span className="font-bold text-slate-900 text-xs">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Handwritten Gift Note (If Included) */}
                    {order.gift_message && (
                      <div className="bg-[#FFF9FA] border border-pink-200/80 rounded-xl p-3.5 shadow-2xs space-y-1">
                        <div className="flex items-center gap-1.5 text-[#E75480] font-bold text-[11px] uppercase tracking-wider">
                          <Gift className="w-3.5 h-3.5" />
                          <span>Handwritten Gift Message Included:</span>
                        </div>
                        <p className="italic font-serif text-slate-800 leading-relaxed text-xs pl-2">
                          "{order.gift_message}"
                        </p>
                      </div>
                    )}

                    {/* Luxury Gift Wrapping Badge & Note */}
                    {order.gift_wrapping && (
                      <div className="bg-gradient-to-r from-pink-50/90 to-rose-50/50 border border-pink-200 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-[#E75480] text-white flex items-center justify-center shrink-0 shadow-2xs">
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              Luxury Gift Wrapping & French Satin Ribbon
                            </p>
                            <p className="text-[11px] text-slate-600">
                              Artisan botanical wrapping with dried sprig accent included ({formatPrice(order.gift_wrapping_fee || 250)})
                            </p>
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                          Applied
                        </span>
                      </div>
                    )}

                    {/* Delivery & Recipient Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {/* Recipient & Address */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Recipient & Destination
                        </span>
                        <p className="font-semibold text-slate-900">{order.customer_name}</p>
                        <p className="text-slate-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-[#E75480] shrink-0 mt-0.5" />
                          <span>{order.shipping_address}, {order.city}</span>
                        </p>
                        <p className="text-slate-600 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customer_phone}</span>
                        </p>
                      </div>

                      {/* Scheduled Schedule & Dispatch Slot */}
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Delivery Slot & Service
                        </span>
                        <p className="font-semibold text-slate-900 capitalize">
                          {order.delivery_type.replace('_', ' ')} Delivery
                        </p>
                        {order.delivery_date && (
                          <p className="text-slate-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>Scheduled: {order.delivery_date}</span>
                          </p>
                        )}
                        {order.delivery_time_slot && (
                          <p className="text-slate-600 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="line-clamp-1">{order.delivery_time_slot}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Instructions */}
                    {order.delivery_instructions && (
                      <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px]">
                        <span className="font-semibold text-slate-700">Driver Note: </span>
                        {order.delivery_instructions}
                      </p>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100">
                      <div className="text-xs text-slate-500">
                        Total Paid: <span className="font-bold text-slate-900 text-sm">{formatPrice(order.total_amount)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Track / Concierge on WhatsApp */}
                        <a
                          href={getWhatsAppHelpLink(order)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition cursor-pointer"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Track with Winnie</span>
                        </a>

                        {/* Reorder Button */}
                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#E75480] hover:bg-[#D43D6D] text-white shadow-xs transition cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reorder All</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
