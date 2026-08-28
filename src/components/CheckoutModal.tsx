import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  Gift, 
  Lock, 
  CheckCircle2, 
  Loader2,
  Calendar,
  Sparkles,
  Smartphone,
  MapPin,
  Phone,
  Clock,
  Heart,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services/orderService';
import { Order } from '../types';
import { formatPrice, SHOP_INFO } from '../utils/formatters';
import { DeliveryDatePicker } from './DeliveryDatePicker';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCompleted: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderCompleted,
}) => {
  const { user } = useAuth();
  const { cart, totalAmount, subtotal, discountAmount, shippingFee, clearCart } = useCart();

  // Quick message inspiration chips
  const MESSAGE_PRESETS = [
    'Wishing you a day filled with love, laughter, and blooming happiness! 🌸',
    'Happy Birthday! May your year be as bright and beautiful as these flowers. 🎉',
    'With all my love, now and always. Happy Anniversary! ❤️',
    'Sending heartfelt congratulations on your wonderful achievement! 🥂',
    'Thinking of you and sending warm hugs from afar. ✨',
    'Get well soon! Wishing you a speedy recovery and blooming strength. 💐',
  ];

  // Helper for initial default date (today in local time)
  const initialDateStr = useMemo(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, []);

  const GIFT_WRAPPING_FEE = 250;

  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: 'Meru',
    postalCode: '60200',
    deliveryType: 'standard' as 'standard' | 'express' | 'same_day',
    deliveryDate: initialDateStr,
    deliveryTimeSlot: 'Morning Fresh Dispatch (08:30 AM – 11:30 AM)',
    deliveryInstructions: '',
    giftMessage: '',
    paymentMethod: 'mpesa' as 'mpesa' | 'card' | 'cod',
    mpesaPhone: '',
    mpesaName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
  });

  // Keep customer name and email synced if user logs in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.full_name || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [addGiftWrapping, setAddGiftWrapping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const giftWrappingFee = addGiftWrapping ? GIFT_WRAPPING_FEE : 0;
  const deliveryAddon = formData.deliveryType === 'same_day' ? 450 : formData.deliveryType === 'express' ? 200 : 0;
  const calculatedGrandTotal = Math.max(0, totalAmount + deliveryAddon + giftWrappingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.address || !formData.city) {
      setErrorMsg('Please complete all required shipping fields.');
      return;
    }

    if (!formData.deliveryDate) {
      setErrorMsg('Please select a preferred delivery date for your floral arrangement.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { order, error } = await orderService.createOrder({
        user_id: user?.id || null,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: formData.address,
        city: formData.city,
        postal_code: formData.postalCode,
        delivery_type: formData.deliveryType,
        delivery_date: formData.deliveryDate,
        delivery_time_slot: formData.deliveryTimeSlot,
        delivery_instructions: formData.deliveryInstructions,
        gift_message: formData.giftMessage,
        gift_wrapping: addGiftWrapping,
        gift_wrapping_fee: giftWrappingFee,
        payment_method: formData.paymentMethod,
        total_amount: calculatedGrandTotal,
        cartItems: cart,
      });

      if (error) {
        console.warn('Order note:', error);
      }

      if (order) {
        clearCart();
        onClose();
        onOrderCompleted(order);
      } else {
        setErrorMsg('Failed to process order. Please try again.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Checkout encountered an error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[96vh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-100 flex items-center justify-between bg-pink-50/40">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#E75480] text-white flex items-center justify-center shadow-xs shrink-0">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">Secure Gift Checkout (KES)</h3>
              <p className="text-[11px] sm:text-xs text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                <span className="truncate">Lipa na M-PESA & Card • Petals Haven</span>
              </p>
            </div>
          </div>
          <button
            id="close-checkout-btn"
            onClick={onClose}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Two column layout */}
        <div className="p-3.5 sm:p-6 overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8">
          
          {/* Left Form: 7 cols */}
          <form id="checkout-form" onSubmit={handleSubmitOrder} className="lg:col-span-7 space-y-6">
            
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {errorMsg}
              </div>
            )}

            {/* Step 1: Recipient & Shipping Information */}
            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center text-xs font-bold">1</span>
                Recipient & Delivery Address
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    placeholder="Recipient's Name"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    placeholder="Order receipt email"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Physical Address / Pickup Point *</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    placeholder="e.g. Mwitu Centre Pickup or Makutano Meru estate"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Town / County *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    placeholder="Meru (or Nairobi, Nanyuki, etc.)"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">Phone Number (M-PESA active) *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    placeholder="+254 700 000 000"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Speed, Schedule & Working Hours */}
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-800 text-sm mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center text-xs font-bold">2</span>
                Delivery Method & Preferred Schedule
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.deliveryType === 'standard'
                    ? 'border-[#E75480] bg-pink-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-pink-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800">Standard Meru</span>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={formData.deliveryType === 'standard'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'standard' })}
                      className="accent-[#E75480]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Shop Pickup / 1-2 Days</p>
                  <span className="text-xs font-medium text-slate-700">Included</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.deliveryType === 'express'
                    ? 'border-[#E75480] bg-pink-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-pink-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800">Meru Town Rider</span>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={formData.deliveryType === 'express'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'express' })}
                      className="accent-[#E75480]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Same-Day Doorstep</p>
                  <span className="text-xs font-semibold text-[#E75480]">+{formatPrice(200)}</span>
                </label>

                <label className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  formData.deliveryType === 'same_day'
                    ? 'border-[#E75480] bg-pink-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-pink-200 bg-white'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-800">Countrywide VIP</span>
                    <input
                      type="radio"
                      name="deliveryType"
                      checked={formData.deliveryType === 'same_day'}
                      onChange={() => setFormData({ ...formData, deliveryType: 'same_day' })}
                      className="accent-[#E75480]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mb-2">Courier / Upcountry</p>
                  <span className="text-xs font-semibold text-[#E75480]">+{formatPrice(450)}</span>
                </label>
              </div>

              {/* Date & Time Slot Picker Restricted to Meru Working Hours */}
              <DeliveryDatePicker
                selectedDate={formData.deliveryDate}
                onDateChange={(newDate) => setFormData({ ...formData, deliveryDate: newDate })}
                selectedTimeSlot={formData.deliveryTimeSlot}
                onTimeSlotChange={(newSlot) => setFormData({ ...formData, deliveryTimeSlot: newSlot })}
                deliveryType={formData.deliveryType}
                instructions={formData.deliveryInstructions}
                onInstructionsChange={(newInst) => setFormData({ ...formData, deliveryInstructions: newInst })}
              />
            </div>

            {/* Step 3: Personalized Gift Message (Optional) */}
            <div className="bg-white rounded-xl border border-pink-100 p-4 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center text-xs font-bold">3</span>
                  <Gift className="w-4 h-4 text-[#E75480]" />
                  <span>Personalized Gift Message</span>
                </h4>
                <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  Optional • Free
                </span>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                Include a custom note to be hand-lettered on our complimentary luxury gift card and tied with a satin ribbon to your blooms.
              </p>

              {/* Quick Message Inspiration Chips */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E75480]" /> Quick Greeting Inspiration:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {MESSAGE_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, giftMessage: preset })}
                      className="text-[11px] bg-pink-50/70 hover:bg-pink-100 text-slate-700 hover:text-[#E75480] px-2.5 py-1 rounded-full border border-pink-100 transition cursor-pointer text-left"
                    >
                      {preset.length > 32 ? preset.slice(0, 32) + '...' : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Input with Counter and Clear */}
              <div className="relative">
                <textarea
                  id="personalized-gift-message-input"
                  value={formData.giftMessage}
                  onChange={(e) => setFormData({ ...formData, giftMessage: e.target.value.slice(0, 300) })}
                  rows={3}
                  maxLength={300}
                  placeholder="e.g. Happy Birthday Sarah! Wishing you endless love, joy, and sunshine on your special day. Love always, David..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1] focus:bg-white resize-none transition-all placeholder:text-slate-400 text-slate-800"
                />
                
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400 px-1">
                  {formData.giftMessage ? (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, giftMessage: '' })}
                      className="text-slate-400 hover:text-rose-600 transition underline cursor-pointer"
                    >
                      Clear message (no note)
                    </button>
                  ) : (
                    <span>Leave empty if no gift card is needed</span>
                  )}
                  <span>{formData.giftMessage.length}/300 chars</span>
                </div>
              </div>

              {/* Live Handwritten Card Preview */}
              {formData.giftMessage.trim() && (
                <div className="bg-[#FFF9FA] border border-pink-200/80 rounded-xl p-3.5 shadow-2xs relative">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#E75480] uppercase tracking-wider mb-1">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-[#E75480] fill-[#E75480]" />
                      Florist Handwritten Card Preview:
                    </span>
                    <span className="text-slate-400 font-normal">Hand-tied to bouquet</span>
                  </div>
                  <p className="font-serif italic text-xs text-slate-800 leading-relaxed pl-1">
                    "{formData.giftMessage.trim()}"
                  </p>
                </div>
              )}

              {/* Add Gift Wrapping Checkbox Toggle */}
              <div className="pt-2 border-t border-pink-100/80">
                <label 
                  htmlFor="gift-wrapping-toggle"
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                    addGiftWrapping
                      ? 'border-[#E75480] bg-gradient-to-r from-pink-50/80 to-rose-50/40 shadow-xs'
                      : 'border-slate-200 hover:border-pink-200 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="gift-wrapping-toggle"
                      checked={addGiftWrapping}
                      onChange={(e) => setAddGiftWrapping(e.target.checked)}
                      className="w-4 h-4 rounded text-[#E75480] accent-[#E75480] focus:ring-[#E75480] cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Gift className={`w-3.5 h-3.5 ${addGiftWrapping ? 'text-[#E75480]' : 'text-slate-500'}`} />
                        Add Luxury Gift Wrapping & Satin Ribbon
                      </span>
                      <span className="text-xs font-bold text-[#E75480] bg-pink-100/70 px-2 py-0.5 rounded-full">
                        +{formatPrice(GIFT_WRAPPING_FEE)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                      Premium textured floral wrap paper, hand-tied French satin ribbon bow, and delicate dried botanical sprig decoration.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 4: Payment Method */}
            <div>
              <h4 className="font-semibold text-slate-800 text-sm mb-3 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-100 text-[#E75480] flex items-center justify-center text-xs font-bold">4</span>
                Payment Options (Kenyan Shillings)
              </h4>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'mpesa' })}
                  className={`p-2.5 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    formData.paymentMethod === 'mpesa'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>M-PESA</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'card' })}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    formData.paymentMethod === 'card'
                      ? 'border-[#E75480] bg-pink-50 text-[#E75480]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                    formData.paymentMethod === 'cod'
                      ? 'border-[#E75480] bg-pink-50 text-[#E75480]'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Pay on Pickup</span>
                </button>
              </div>

              {formData.paymentMethod === 'mpesa' && (
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-200 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      Lipa Na M-PESA
                    </span>
                    <span className="bg-emerald-200 text-emerald-900 text-[10px] px-2 py-0.5 rounded font-mono">
                      Pay to Winnie: 0729228364
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600">
                    1. Go to <strong>M-PESA</strong> on your phone<br />
                    2. Select <strong>Send Money</strong> or <strong>Buy Goods</strong><br />
                    3. Send amount <strong>{formatPrice(calculatedGrandTotal)}</strong> to <strong>+254 729 228 364 (Winnie)</strong><br />
                    4. Click <strong>"Place Gift Order"</strong> below to confirm.
                  </p>
                  <div className="pt-1">
                    <label className="block text-[11px] font-medium text-emerald-950 mb-1">M-PESA Confirmation Code (Optional)</label>
                    <input
                      type="text"
                      value={formData.mpesaPhone}
                      onChange={(e) => setFormData({ ...formData, mpesaPhone: e.target.value.toUpperCase() })}
                      placeholder="e.g. QAB892LK12"
                      className="w-full text-xs bg-white border border-emerald-300 rounded-lg px-3 py-2 font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'card' && (
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.cardNumber}
                      onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                      placeholder="Card Number"
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg pl-3 pr-10 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    />
                    <CreditCard className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={formData.cardExpiry}
                      onChange={(e) => setFormData({ ...formData, cardExpiry: e.target.value })}
                      placeholder="MM / YY"
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    />
                    <input
                      type="password"
                      value={formData.cardCvc}
                      onChange={(e) => setFormData({ ...formData, cardCvc: e.target.value })}
                      placeholder="CVC"
                      maxLength={4}
                      className="w-full text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
                    />
                  </div>
                </div>
              )}

              {formData.paymentMethod === 'cod' && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <p className="font-semibold mb-0.5">Pick up & Pay at Mwitu Centre</p>
                  <p className="text-[11px] text-amber-800">
                    Visit our physical boutique in Meru (Mwitu Centre building below Sayen Hyperstore). You can pay via cash or M-PESA on collection.
                  </p>
                </div>
              )}
            </div>

          </form>

          {/* Right Summary: 5 cols */}
          <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
            <div>
              <h4 className="font-semibold text-slate-900 text-sm mb-3">Order Summary</h4>

              {/* Items summary */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 mb-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-100">
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-11 h-11 rounded-lg object-cover bg-slate-50 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-800 truncate">{item.product.title}</p>
                      <p className="text-[11px] text-slate-500">Qty: {item.quantity} × {formatPrice(item.product.price)}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-900">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Details */}
              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-200 pt-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-800">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#E75480] font-medium">
                    <span>Gift Promo Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Base Delivery</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}</span>
                </div>
                {deliveryAddon > 0 && (
                  <div className="flex justify-between text-[#E75480] font-medium">
                    <span>Delivery Option Addon</span>
                    <span>+{formatPrice(deliveryAddon)}</span>
                  </div>
                )}
                {addGiftWrapping && (
                  <div className="flex justify-between text-slate-800 font-medium">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3 h-3 text-[#E75480]" />
                      Luxury Gift Wrapping
                    </span>
                    <span className="text-[#E75480] font-semibold">+{formatPrice(giftWrappingFee)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-semibold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                  <span>Total Payable</span>
                  <span className="text-lg font-bold text-[#E75480]">{formatPrice(calculatedGrandTotal)}</span>
                </div>
              </div>

              {/* Scheduled Delivery Review Card */}
              {formData.deliveryDate && (
                <div className="mt-3.5 p-3 bg-pink-50/70 rounded-xl border border-pink-100 space-y-1.5 text-xs text-slate-700">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Calendar className="w-3.5 h-3.5 text-[#E75480]" />
                    <span>Scheduled Meru Dispatch</span>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 pl-5">
                    <p>
                      <strong>Date:</strong> {formData.deliveryDate}
                    </p>
                    <p className="text-[#E75480] font-medium">
                      <strong>Time Window:</strong> {formData.deliveryTimeSlot}
                    </p>
                    <p className="text-slate-500 text-[10px]">
                      Destination: {formData.city || 'Meru'} ({formData.address || 'Address'})
                    </p>
                  </div>
                </div>
              )}

              {/* Gift Message Review Snippet */}
              {formData.giftMessage.trim() && (
                <div className="mt-2.5 p-2.5 bg-white rounded-xl border border-pink-200 text-xs text-slate-700 space-y-1">
                  <div className="flex items-center gap-1 font-semibold text-[#E75480] text-[11px]">
                    <Gift className="w-3 h-3" />
                    <span>Gift Note Included (Complimentary)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 italic font-serif line-clamp-2 pl-4">
                    "{formData.giftMessage.trim()}"
                  </p>
                </div>
              )}

              {/* Gift Wrapping Active Notice */}
              {addGiftWrapping && (
                <div className="mt-2 p-2 bg-pink-50/80 rounded-xl border border-pink-200/80 text-[11px] text-slate-700 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#E75480] shrink-0" />
                  <span className="font-medium text-slate-800">
                    Luxury satin ribbon & botanical wrap included (+{formatPrice(giftWrappingFee)})
                  </span>
                </div>
              )}

              {/* Shop contact reminder */}
              <div className="mt-4 p-2.5 bg-pink-50 rounded-xl border border-pink-100 text-[11px] text-slate-700 flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E75480] shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900">Need custom styling?</span>
                  <p className="text-slate-600">Call Winnie on <a href="tel:+254729228364" className="text-[#E75480] font-bold underline">+254 729 228 364</a></p>
                </div>
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <button
                id="place-order-btn"
                type="submit"
                form="checkout-form"
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-2.5 rounded-full font-medium text-sm bg-[#E75480] hover:bg-[#D6336C] text-white shadow-md shadow-pink-100 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Place Gift Order ({formatPrice(calculatedGrandTotal)})</span>
                  </>
                )}
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-2">
                Mwitu Centre Building, shop below Sayen Hyperstore, Meru.
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
