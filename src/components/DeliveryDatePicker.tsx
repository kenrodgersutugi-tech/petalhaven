import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Sun, 
  Sunset, 
  Sparkles, 
  Info, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  MapPin,
  CalendarCheck
} from 'lucide-react';

export interface DeliverySlot {
  id: string;
  label: string;
  timeRange: string;
  description: string;
  icon: 'morning' | 'midday' | 'afternoon' | 'evening';
  availableOnSunday: boolean;
  endHour24: number; // 24h format for same-day cut-off check
}

const ALL_SLOTS: DeliverySlot[] = [
  {
    id: 'morning',
    label: 'Morning Fresh Dispatch',
    timeRange: '08:30 AM – 11:30 AM',
    description: 'First morning floral cuts & breakfast surprise',
    icon: 'morning',
    availableOnSunday: false,
    endHour24: 11.5,
  },
  {
    id: 'midday',
    label: 'Midday & Lunch Surprise',
    timeRange: '11:30 AM – 02:30 PM',
    description: 'Office, school, or lunch celebration delivery',
    icon: 'midday',
    availableOnSunday: true,
    endHour24: 14.5,
  },
  {
    id: 'afternoon',
    label: 'Afternoon Bouquet Drop',
    timeRange: '02:30 PM – 05:00 PM',
    description: 'Afternoon tea time & doorstep gifting',
    icon: 'afternoon',
    availableOnSunday: true,
    endHour24: 17.0,
  },
  {
    id: 'evening',
    label: 'Evening Twilight Special',
    timeRange: '05:00 PM – 07:00 PM',
    description: 'Dinner surprise & evening floral presentation',
    icon: 'evening',
    availableOnSunday: false, // Meru shop closes at 5:00 PM on Sunday
    endHour24: 19.0,
  },
];

const SUNDAY_MORNING_SLOT: DeliverySlot = {
  id: 'sunday_morning',
  label: 'Sunday Morning Blooms',
  timeRange: '09:30 AM – 12:30 PM',
  description: 'Sunday church & morning celebration arrangements',
  icon: 'morning',
  availableOnSunday: true,
  endHour24: 12.5,
};

interface DeliveryDatePickerProps {
  selectedDate: string; // YYYY-MM-DD
  onDateChange: (dateStr: string) => void;
  selectedTimeSlot: string; // slot id or label
  onTimeSlotChange: (slotLabel: string) => void;
  deliveryType: 'standard' | 'express' | 'same_day';
  instructions?: string;
  onInstructionsChange?: (instructions: string) => void;
}

export const DeliveryDatePicker: React.FC<DeliveryDatePickerProps> = ({
  selectedDate,
  onDateChange,
  selectedTimeSlot,
  onTimeSlotChange,
  deliveryType,
  instructions = '',
  onInstructionsChange,
}) => {
  const [viewMode, setViewMode] = useState<'quick' | 'calendar'>('quick');
  
  // Current date helpers in Local/EAT time
  const now = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  // Max selectable date (60 days in advance)
  const maxDateStr = useMemo(() => {
    const future = new Date(now);
    future.setDate(future.getDate() + 60);
    const y = future.getFullYear();
    const m = String(future.getMonth() + 1).padStart(2, '0');
    const d = String(future.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  // Determine current active date object
  const activeDate = useMemo(() => {
    if (!selectedDate) return now;
    const parts = selectedDate.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    return now;
  }, [selectedDate, now]);

  const isToday = selectedDate === todayStr;
  const isSunday = activeDate.getDay() === 0;
  const currentHour = now.getHours() + now.getMinutes() / 60;

  // Calendar month navigator state
  const [calendarMonth, setCalendarMonth] = useState<Date>(() => new Date(activeDate));

  // Determine working hours text for selected day
  const workingHoursText = isSunday
    ? 'Sunday Working Hours in Meru: 09:00 AM – 05:00 PM (EAT)'
    : 'Mon – Sat Working Hours in Meru: 08:00 AM – 07:00 PM (EAT)';

  // Slots available for the selected day
  const availableSlots = useMemo(() => {
    let list: DeliverySlot[] = [];
    if (isSunday) {
      list = [
        SUNDAY_MORNING_SLOT,
        ALL_SLOTS.find(s => s.id === 'midday')!,
        ALL_SLOTS.find(s => s.id === 'afternoon')!,
      ];
    } else {
      list = ALL_SLOTS;
    }

    return list.map((slot) => {
      // Check if slot has expired for same-day
      let isPast = false;
      if (isToday) {
        // Needs at least 45 mins preparation before end hour
        if (currentHour > slot.endHour24 - 0.75) {
          isPast = true;
        }
      }
      return {
        ...slot,
        isPast,
      };
    });
  }, [isSunday, isToday, currentHour]);

  // If currently selected slot is invalid or past, auto-select first available
  useEffect(() => {
    const validSlot = availableSlots.find(s => !s.isPast);
    const isCurrentSlotValid = availableSlots.some(
      s => (s.id === selectedTimeSlot || s.label === selectedTimeSlot || `${s.label} (${s.timeRange})` === selectedTimeSlot) && !s.isPast
    );

    if (!isCurrentSlotValid && validSlot) {
      onTimeSlotChange(`${validSlot.label} (${validSlot.timeRange})`);
    }
  }, [selectedDate, availableSlots, selectedTimeSlot, onTimeSlotChange]);

  // Helper date generators for shortcuts
  const tomorrowStr = useMemo(() => {
    const t = new Date(now);
    t.setDate(t.getDate() + 1);
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  const upcomingSaturdayStr = useMemo(() => {
    const s = new Date(now);
    const day = s.getDay();
    const diff = (6 - day + 7) % 7 || 7;
    s.setDate(s.getDate() + diff);
    const y = s.getFullYear();
    const m = String(s.getMonth() + 1).padStart(2, '0');
    const d = String(s.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [now]);

  // Format readable display date
  const readableSelectedDate = useMemo(() => {
    if (!selectedDate) return 'Select a date';
    try {
      const parts = selectedDate.split('-');
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDate;
    }
  }, [selectedDate]);

  // Calendar matrix calculations
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean; isDisabled: boolean; isSunday: boolean }[] = [];

    // Empty lead cells
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({
        dateStr: '',
        dayNum: 0,
        isCurrentMonth: false,
        isDisabled: true,
        isSunday: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      // Disable past dates
      const isDisabled = dateStr < todayStr || dateStr > maxDateStr;
      const isSun = dayDate.getDay() === 0;

      days.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isDisabled,
        isSunday: isSun,
      });
    }

    return days;
  }, [calendarMonth, todayStr, maxDateStr]);

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const getSlotIcon = (iconType: string) => {
    switch (iconType) {
      case 'morning':
        return <Sun className="w-3.5 h-3.5 text-amber-500" />;
      case 'midday':
        return <Sparkles className="w-3.5 h-3.5 text-[#E75480]" />;
      case 'afternoon':
        return <Clock className="w-3.5 h-3.5 text-indigo-500" />;
      case 'evening':
        return <Sunset className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const allTodaySlotsClosed = isToday && availableSlots.every(s => s.isPast);

  return (
    <div id="delivery-date-time-picker" className="space-y-4">
      {/* Working Hours & Meru Dispatch Banner */}
      <div className="bg-gradient-to-r from-pink-50 to-rose-50/70 p-3 rounded-xl border border-pink-100/80 flex items-start gap-2.5 text-xs text-slate-700">
        <div className="w-6 h-6 rounded-full bg-[#E75480] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
          <Clock className="w-3.5 h-3.5" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-900">
            <span>Meru Florist Working Hours & Dispatch Policy</span>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Live Working Hours
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            • <strong>Mon – Sat</strong>: 08:00 AM – 07:00 PM (EAT)<br />
            • <strong>Sunday</strong>: 09:00 AM – 05:00 PM (EAT)<br />
            Deliveries are arranged fresh from our boutique at <strong>Mwitu Centre Building, Meru</strong>.
          </p>
        </div>
      </div>

      {/* Date Selection Box */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5 text-[#E75480]" />
            <span>Select Preferred Delivery Date *</span>
          </label>

          {/* Toggle Quick / Visual Calendar */}
          <div className="flex bg-slate-200/70 p-0.5 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setViewMode('quick')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                viewMode === 'quick' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Quick Picks
            </button>
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                viewMode === 'calendar' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Interactive Calendar
            </button>
          </div>
        </div>

        {/* Quick Date Presets */}
        {viewMode === 'quick' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Today */}
            <button
              type="button"
              onClick={() => onDateChange(todayStr)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedDate === todayStr
                  ? 'bg-pink-100/70 border-[#E75480] text-slate-900 ring-1 ring-[#E75480]'
                  : 'bg-white border-slate-200 hover:border-pink-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Today</span>
                {selectedDate === todayStr && <Check className="w-3.5 h-3.5 text-[#E75480]" />}
              </div>
              <span className="text-[10px] text-slate-500">Same-day dispatch</span>
            </button>

            {/* Tomorrow */}
            <button
              type="button"
              onClick={() => onDateChange(tomorrowStr)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedDate === tomorrowStr
                  ? 'bg-pink-100/70 border-[#E75480] text-slate-900 ring-1 ring-[#E75480]'
                  : 'bg-white border-slate-200 hover:border-pink-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">Tomorrow</span>
                {selectedDate === tomorrowStr && <Check className="w-3.5 h-3.5 text-[#E75480]" />}
              </div>
              <span className="text-[10px] text-slate-500">Recommended</span>
            </button>

            {/* Weekend */}
            <button
              type="button"
              onClick={() => onDateChange(upcomingSaturdayStr)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                selectedDate === upcomingSaturdayStr
                  ? 'bg-pink-100/70 border-[#E75480] text-slate-900 ring-1 ring-[#E75480]'
                  : 'bg-white border-slate-200 hover:border-pink-200 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold">This Saturday</span>
                {selectedDate === upcomingSaturdayStr && <Check className="w-3.5 h-3.5 text-[#E75480]" />}
              </div>
              <span className="text-[10px] text-slate-500">Weekend celebration</span>
            </button>

            {/* Custom Input */}
            <div className="relative">
              <input
                type="date"
                min={todayStr}
                max={maxDateStr}
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) onDateChange(e.target.value);
                }}
                className="w-full h-full text-xs font-medium bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none focus:border-[#E75480] cursor-pointer"
                title="Choose custom date"
              />
            </div>
          </div>
        )}

        {/* Visual Interactive Calendar */}
        {viewMode === 'calendar' && (
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                  aria-label="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer"
                  aria-label="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Day initials */}
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-slate-400 border-b border-slate-100 pb-1">
              <span className="text-rose-500">Su</span>
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
            </div>

            {/* Date Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {calendarDays.map((item, idx) => {
                if (!item.isCurrentMonth) {
                  return <div key={`empty-${idx}`} className="h-8" />;
                }

                const isSelected = item.dateStr === selectedDate;
                const isItemToday = item.dateStr === todayStr;

                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    disabled={item.isDisabled}
                    onClick={() => onDateChange(item.dateStr)}
                    className={`h-8 rounded-lg text-xs font-medium flex items-center justify-center transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-[#E75480] text-white font-bold shadow-xs'
                        : item.isDisabled
                        ? 'text-slate-300 cursor-not-allowed line-through bg-slate-50/50'
                        : item.isSunday
                        ? 'text-rose-700 hover:bg-pink-50'
                        : 'text-slate-700 hover:bg-pink-50 hover:text-[#E75480]'
                    }`}
                  >
                    <span>{item.dayNum}</span>
                    {isItemToday && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#E75480]" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-400" /> Sunday (9 AM - 5 PM)
              </span>
              <span>Mon – Sat (8 AM - 7 PM)</span>
            </div>
          </div>
        )}

        {/* Selected date readout */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-slate-600">
            <CalendarCheck className="w-4 h-4 text-[#E75480]" />
            <span className="font-semibold text-slate-900">{readableSelectedDate}</span>
          </div>
          <span className="text-[11px] text-[#E75480] font-medium">
            {isSunday ? 'Sunday Special Window' : 'Full Working Day'}
          </span>
        </div>
      </div>

      {/* Warning if today's window is closed */}
      {allTodaySlotsClosed && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Today's Dispatch Window Closed:</span>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Working hours at Petals Haven Meru end at {isSunday ? '5:00 PM' : '7:00 PM'}. Please select tomorrow or another future date for guaranteed morning freshness.
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Time Slot Selector (Restricted to Meru florist hours) */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#E75480]" />
            <span>Select Delivery Time Window (Meru Working Hours) *</span>
          </label>
          <span className="text-[10px] text-slate-500 font-mono">
            EAT (UTC+3)
          </span>
        </div>

        <p className="text-[11px] text-slate-500">
          {workingHoursText}
        </p>

        {/* Slot Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {availableSlots.map((slot) => {
            const fullSlotValue = `${slot.label} (${slot.timeRange})`;
            const isSelected = selectedTimeSlot === fullSlotValue || selectedTimeSlot === slot.id || selectedTimeSlot === slot.label;
            const isSlotDisabled = slot.isPast;

            return (
              <button
                key={slot.id}
                type="button"
                disabled={isSlotDisabled}
                onClick={() => onTimeSlotChange(fullSlotValue)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between relative ${
                  isSlotDisabled
                    ? 'opacity-40 bg-slate-100 border-slate-200 cursor-not-allowed'
                    : isSelected
                    ? 'bg-pink-100/70 border-[#E75480] shadow-2xs ring-1 ring-[#E75480]'
                    : 'bg-white border-slate-200 hover:border-pink-200 hover:bg-pink-50/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {getSlotIcon(slot.icon)}
                    <span className="text-xs font-bold text-slate-800">{slot.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#E75480] shrink-0" />}
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#E75480] mb-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{slot.timeRange}</span>
                </div>

                <p className="text-[10px] text-slate-500 line-clamp-1">
                  {isSlotDisabled ? 'Window expired for today' : slot.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Special Delivery & Landmark Instructions */}
      {onInstructionsChange && (
        <div>
          <label className="block text-[11px] font-medium text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#E75480]" />
            <span>Special Delivery / Landmark Instructions (Optional)</span>
          </label>
          <input
            type="text"
            value={instructions}
            onChange={(e) => onInstructionsChange(e.target.value)}
            placeholder="e.g. Call before delivery, drop at Makutano reception, or surprise recipient quietly"
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#E75480] focus:ring-1 focus:ring-[#FFB6C1]"
          />
        </div>
      )}
    </div>
  );
};
