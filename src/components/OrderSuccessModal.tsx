import React from 'react';
import { 
  CheckCircle, 
  Sparkles, 
  Package, 
  Truck, 
  HeartHandshake, 
  ArrowRight,
  Printer,
  Copy,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Gift,
  Heart
} from 'lucide-react';
import { Order } from '../types';
import { formatPrice, SHOP_INFO } from '../utils/formatters';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 p-4 sm:p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Celebration Icon */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-3 sm:mb-4 text-[#E75480] shadow-xs">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-[#E75480]" />
        </div>

        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2">
          <CheckCircle className="w-3.5 h-3.5" /> Order Placed Successfully
        </span>

        <h3 className="font-semibold text-lg sm:text-2xl text-slate-900 mb-1.5 sm:mb-2">
          Thank You, {order.customer_name}!
        </h3>

        <p className="text-xs text-slate-600 mb-4 sm:mb-6 leading-relaxed">
          Your gift order has been received! Our florists at Mwitu Centre, Meru are preparing your arrangement with immense care and fresh highland petals.
        </p>

        {/* Order Reference Card */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Order ID:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono font-bold text-slate-800 text-xs max-w-[150px] truncate">{order.id}</span>
              <button 
                onClick={copyOrderId}
                className="text-[#E75480] hover:text-[#D6336C] p-1 cursor-pointer"
                title="Copy Order ID"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Scheduled Delivery Date & Time Window */}
          {order.delivery_date && (
            <div className="bg-pink-100/70 p-2.5 rounded-lg border border-pink-200 text-xs text-slate-800 space-y-1">
              <div className="flex items-center justify-between font-bold text-[#E75480]">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Scheduled Delivery Date:
                </span>
                <span>{order.delivery_date}</span>
              </div>
              {order.delivery_time_slot && (
                <div className="flex items-center justify-between text-[11px] text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-slate-500" />
                    Preferred Time Window:
                  </span>
                  <span className="font-semibold text-slate-900">{order.delivery_time_slot}</span>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Destination:</span>
            <span className="font-medium text-slate-800">{order.city} ({order.shipping_address})</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Delivery Method:</span>
            <span className="font-semibold text-[#E75480] capitalize">{order.delivery_type.replace('_', ' ')}</span>
          </div>

          {order.gift_message && (
            <div className="text-xs text-slate-700 bg-pink-50/60 p-2.5 rounded-lg border border-pink-200/80 space-y-1">
              <div className="flex items-center gap-1 font-semibold text-[#E75480] text-[11px]">
                <Gift className="w-3 h-3" />
                <span>Handwritten Gift Message:</span>
              </div>
              <p className="italic font-serif text-slate-800 pl-4 text-[11px]">
                "{order.gift_message}"
              </p>
            </div>
          )}

          {order.gift_wrapping && (
            <div className="flex items-center justify-between text-xs bg-pink-50/80 p-2 rounded-lg border border-pink-200 text-slate-800">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Gift className="w-3.5 h-3.5 text-[#E75480]" />
                Luxury Gift Wrapping:
              </span>
              <span className="font-semibold text-[#E75480]">Included (Ribbon & Wrap)</span>
            </div>
          )}

          {order.delivery_instructions && (
            <div className="text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
              <span className="font-medium text-slate-500">Special Note: </span>
              <span className="italic">{order.delivery_instructions}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Payment:</span>
            <span className="font-semibold text-slate-800 uppercase">{order.payment_method}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
            <span className="text-slate-700 font-medium">Total Paid / Payable:</span>
            <span className="font-bold text-base text-[#E75480]">{formatPrice(order.total_amount)}</span>
          </div>
        </div>

        {/* Store Support Badge */}
        <div className="bg-pink-50/70 p-3 rounded-xl border border-pink-100 text-left mb-6 flex items-start gap-2.5 text-xs text-slate-700">
          <Phone className="w-4 h-4 text-[#E75480] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-900">Need immediate order assistance?</span>
            <p className="text-[11px] text-slate-600">
              Call or WhatsApp Winnie on <a href="tel:+254729228364" className="text-[#E75480] font-bold underline">+254 729 228 364</a> or visit Mwitu Centre Building below Sayen Hyperstore, Meru.
            </p>
          </div>
        </div>

        {/* Order Tracking Progress Steps */}
        <div className="grid grid-cols-3 gap-2 text-center mb-6 pt-2">
          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-[#E75480] text-white flex items-center justify-center text-xs mb-1">
              <Package className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-semibold text-slate-800">Processing</span>
            <span className="text-[9px] text-slate-400">Floral Prep</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs mb-1">
              <Truck className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Dispatched</span>
            <span className="text-[9px] text-slate-400">Rider en route</span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs mb-1">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-medium text-slate-600">Delivered</span>
            <span className="text-[9px] text-slate-400">Smiles gifted</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => window.print()}
            className="flex-1 py-2.5 bg-pink-50 hover:bg-pink-100 text-[#E75480] border border-pink-200 rounded-full text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
          
          <button
            id="continue-shopping-success-btn"
            onClick={onClose}
            className="flex-1 py-2.5 bg-[#E75480] hover:bg-[#D6336C] text-white rounded-full text-xs font-medium shadow-md shadow-pink-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
