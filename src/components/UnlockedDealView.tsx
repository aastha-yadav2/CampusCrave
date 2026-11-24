import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Zap, Sparkles, Utensils, ShieldCheck } from 'lucide-react';
import { Craving, MenuItem, OrderItem } from '../types';
import { formatCurrency } from '../utils/formatters';
import { calculateOrderDiscount, calculateTierProgress } from '../engine/dealTiers';

interface UnlockedDealViewProps {
  craving: Craving;
  onBack: () => void;
  onProceedToCheckout: (items: OrderItem[], itemTotal: number, discount: number) => void;
}

export const UnlockedDealView: React.FC<UnlockedDealViewProps> = ({
  craving,
  onBack,
  onProceedToCheckout,
}) => {
  // Quantities for each menu item
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    // Default select first item
    const initial: Record<string, number> = {};
    if (craving.menu && craving.menu.length > 0) {
      initial[craving.menu[0].id] = 1;
    }
    return initial;
  });

  const updateQuantity = (itemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  // Calculate totals
  const selectedItems: OrderItem[] = (craving.menu || []).flatMap((item) => {
    const qty = quantities[item.id] || 0;
    if (qty <= 0) return [];
    return [{ id: item.id, name: item.name, price: item.price, quantity: qty }];
  });

  const itemTotal = selectedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const discount = itemTotal > 0 ? calculateOrderDiscount(craving, itemTotal) : 0;
  const finalTotal = Math.max(0, itemTotal - discount);
  const tierProgress = calculateTierProgress(craving);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-charcoal-900 bg-white hover:bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Live Craving</span>
      </button>

      {/* Main Deal Panel */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-6 sm:p-8 space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25 animate-bounce">
            <Zap className="w-7 h-7 fill-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>COLLECTIVE GOAL UNLOCKED</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 tracking-tight">
            Deal Unlocked! Pick Your Meal
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-md mx-auto">
            Your campus pool reached the target. Select what you would like to order individually from {craving.restaurant}.
          </p>
        </div>

        {/* Restaurant Header Pill */}
        <div className="flex items-center gap-3.5 p-3.5 rounded-2xl border border-stone-200 bg-cream-50/70">
          <img
            src={craving.image}
            alt={craving.restaurant}
            className="w-14 h-14 rounded-xl object-cover border border-stone-200 shadow-xs"
          />
          <div className="flex-1 min-w-0">
            <div className="font-display font-extrabold text-sm text-charcoal-900">
              {craving.restaurant}
            </div>
            <div className="text-xs text-brand-600 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
              <span>{craving.deal}</span>
            </div>
            <div className="text-[11px] text-charcoal-500">
              Delivering to {craving.zone}
            </div>
          </div>
        </div>

        {/* Menu Items List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Utensils className="w-4 h-4 text-brand-500" />
              <span className="font-display font-bold text-sm text-charcoal-900">
                Restaurant Menu
              </span>
            </div>
            <span className="text-[11px] text-charcoal-500 font-medium">Individual Order</span>
          </div>

          <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white">
            {craving.menu.map((item) => {
              const qty = quantities[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                    qty > 0 ? 'bg-cream-50/60' : 'hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center p-[2px] ${
                          item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                        {item.name}
                      </h4>
                      {item.popular && (
                        <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-charcoal-500 line-clamp-1 mt-0.5">
                      {item.desc}
                    </p>
                    <div className="text-xs font-bold text-charcoal-900 mt-1">
                      {formatCurrency(item.price)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2">
                    {qty > 0 ? (
                      <div className="flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 rounded-lg bg-white text-brand-700 font-bold flex items-center justify-center hover:bg-stone-100 shadow-xs"
                        >
                          -
                        </button>
                        <span className="font-display font-bold text-xs text-brand-900 w-4 text-center">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 rounded-lg bg-brand-500 text-white font-bold flex items-center justify-center hover:bg-brand-600 shadow-xs"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:border-brand-300 bg-white hover:bg-brand-50 text-xs font-bold text-brand-600 transition-colors shadow-xs"
                      >
                        Add +
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bill Summary Breakdown */}
        {itemTotal > 0 ? (
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 space-y-2 border border-stone-200">
            <div className="flex items-center justify-between text-xs text-charcoal-600">
              <span>Item Total</span>
              <span className="font-semibold">{formatCurrency(itemTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
              <span>Campus Crave Pool Discount</span>
              <span>- {formatCurrency(discount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-charcoal-500">
              <span>Delivery & Platform fee</span>
              <span className="text-emerald-600 font-semibold">FREE (Demo)</span>
            </div>
            <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-sm sm:text-base font-bold text-charcoal-900">
              <span>Estimated Total</span>
              <span className="font-display font-extrabold text-brand-600 text-lg">
                {formatCurrency(finalTotal)}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 text-center font-medium">
            Please select at least 1 menu item to continue to checkout.
          </div>
        )}

        {/* Continue Button */}
        <button
          disabled={itemTotal === 0}
          onClick={() => onProceedToCheckout(selectedItems, itemTotal, discount)}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm shadow-lg transition-all ${
            itemTotal > 0
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/25 hover:scale-[1.01]'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          <span>Continue to Individual Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
