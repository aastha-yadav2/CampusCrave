import React, { useState } from 'react';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  Wallet,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Craving, OrderItem, PlacedOrder } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CheckoutViewProps {
  craving: Craving;
  items: OrderItem[];
  itemTotal: number;
  discount: number;
  isRegularPriceFallback?: boolean;
  onBack: () => void;
  onOrderPlaced: (order: PlacedOrder) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({
  craving,
  items,
  itemTotal,
  discount,
  isRegularPriceFallback = false,
  onBack,
  onOrderPlaced,
}) => {
  const [deliveryNote, setDeliveryNote] = useState('Meet at hostel reception gate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const appliedDiscount = isRegularPriceFallback ? 0 : discount;
  const finalTotal = Math.max(0, itemTotal - appliedDiscount);

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newOrder: PlacedOrder = {
        orderId: `CC-${Math.floor(100000 + Math.random() * 900000)}`,
        cravingId: craving.id,
        restaurant: craving.restaurant,
        zone: craving.zone,
        items,
        itemTotal,
        dealDiscount: appliedDiscount,
        finalTotal,
        isRegularPriceFallback,
        placedAt: 'Just now',
        estimatedDelivery: 'Tonight · 25-30 mins',
        status: 'ORDER_PLACED',
      };
      setIsSubmitting(false);
      onOrderPlaced(newOrder);
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-charcoal-900 bg-white hover:bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Meal Selection</span>
      </button>

      {/* Checkout Container */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-6 sm:p-8 space-y-6">
        <div>
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 flex items-center gap-1 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FINAL STEP · INDIVIDUAL ORDER</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 tracking-tight">
            Review Your Order
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            {isRegularPriceFallback
              ? 'Ordering at standard restaurant menu price.'
              : 'Your collective pool deal has been applied to your individual meal.'}
          </p>
        </div>

        {/* Regular Price Notice Banner if Fallback */}
        {isRegularPriceFallback && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <b>Regular Price Notice:</b> This group deal did not reach its target before closing. You are purchasing your selected meal at standard menu pricing without the collective reward.
            </p>
          </div>
        )}

        {/* Restaurant Header */}
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-cream-50/70 border border-stone-200">
          <img
            src={craving.image}
            alt={craving.restaurant}
            className="w-12 h-12 rounded-xl object-cover border border-stone-200"
          />
          <div>
            <div className="font-bold text-sm text-charcoal-900">{craving.restaurant}</div>
            <div className={`text-xs font-semibold ${isRegularPriceFallback ? 'text-charcoal-500 line-through' : 'text-brand-600'}`}>
              {craving.deal}
            </div>
          </div>
        </div>

        {/* Selected Items List */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-charcoal-500 mb-2">
            Items in your order
          </div>
          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
            {items.map((it) => (
              <div key={it.id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-charcoal-900">
                    {it.quantity}x
                  </span>
                  <span className="text-charcoal-800 font-medium">{it.name}</span>
                </div>
                <span className="font-bold text-charcoal-900">
                  {formatCurrency(it.price * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Campus Delivery Location */}
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-charcoal-900">
              <MapPin className="w-4 h-4 text-brand-500" />
              <span>Campus Delivery Zone</span>
            </div>
            <span className="text-brand-600 font-bold">{craving.zone}</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-charcoal-600 mb-1">
              Drop-off Instruction for Rider
            </label>
            <input
              type="text"
              value={deliveryNote}
              onChange={(e) => setDeliveryNote(e.target.value)}
              placeholder="e.g. Call when near hostel gate..."
              className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs bg-white focus:outline-none focus:border-brand-500"
            />
          </div>
        </div>

        {/* Simulated Payment */}
        <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-200/80 flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-charcoal-900">
              Prototype Payment Simulation
            </div>
            <p className="text-[11px] text-charcoal-600 mt-0.5 leading-relaxed">
              No real bank transaction or credit card required. This simulates your individual student checkout.
            </p>
          </div>
        </div>

        {/* Final Price Breakdown */}
        <div className="bg-cream-50 rounded-2xl p-4 sm:p-5 space-y-2.5 border border-brand-200/50">
          <div className="flex items-center justify-between text-xs text-charcoal-600">
            <span>Item Total</span>
            <span className="font-semibold">{formatCurrency(itemTotal)}</span>
          </div>
          {!isRegularPriceFallback && (
            <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
              <span>Campus Crave Pool Savings</span>
              <span>- {formatCurrency(appliedDiscount)}</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-charcoal-500">
            <span>Delivery & Campus platform fee</span>
            <span className="text-emerald-600 font-semibold">₹0 (Demo)</span>
          </div>
          <div className="pt-2.5 border-t border-stone-200/80 flex items-center justify-between text-base font-bold text-charcoal-900">
            <span>To Pay (Demo)</span>
            <span className="font-display font-extrabold text-brand-600 text-xl">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>

        {/* Place Order CTA */}
        <button
          onClick={handlePlaceOrder}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-75"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Simulating Order Placement...</span>
            </span>
          ) : (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Place Demo Order ({formatCurrency(finalTotal)})</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
