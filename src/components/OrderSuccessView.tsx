import React from 'react';
import { Check, ArrowRight, ShoppingBag, MapPin, Clock, Sparkles } from 'lucide-react';
import { PlacedOrder } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OrderSuccessViewProps {
  order: PlacedOrder;
  onGoToFeed: () => void;
  onViewOrders: () => void;
}

export const OrderSuccessView: React.FC<OrderSuccessViewProps> = ({
  order,
  onGoToFeed,
  onViewOrders,
}) => {
  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-card p-6 sm:p-8 text-center space-y-6">
        {/* Animated Checkmark */}
        <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/25">
          <Check className="w-9 h-9 stroke-[3]" />
        </div>

        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            <span>PROTOTYPE ORDER PLACED SUCCESSFULLY</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 tracking-tight">
            That's a wrap! 🍔
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-sm mx-auto">
            Your campus pool unlocked the deal together, and your individual order has been registered in the prototype.
          </p>
        </div>

        {/* Receipt Ticket */}
        <div className="text-left rounded-2xl border border-dashed border-brand-300 bg-cream-50 p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                Order ID
              </div>
              <div className="font-display font-extrabold text-xs text-charcoal-900">
                {order.orderId}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500">
                Estimated Delivery
              </div>
              <div className="text-xs font-bold text-brand-600">
                {order.estimatedDelivery}
              </div>
            </div>
          </div>

          <div>
            <div className="font-bold text-sm text-charcoal-900 mb-1">
              {order.restaurant}
            </div>
            <div className="text-xs text-charcoal-600 space-y-0.5">
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.quantity}x {it.name}</span>
                  <span className="font-medium">{formatCurrency(it.price * it.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold">
            <span className="text-charcoal-700">Total Paid (Demo)</span>
            <div className="text-right">
              <span className="font-display font-extrabold text-base text-charcoal-900">
                {formatCurrency(order.finalTotal)}
              </span>
              <span className="block text-[10px] text-emerald-600 font-bold">
                Saved {formatCurrency(order.dealDiscount)} with Campus Crave
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 pt-1">
            <MapPin className="w-3.5 h-3.5 text-brand-500" />
            <span>Delivering to: <b>{order.zone}</b></span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onViewOrders}
            className="w-full sm:flex-1 py-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-charcoal-800 font-bold text-xs transition-colors"
          >
            View in Orders Tab
          </button>
          <button
            onClick={onGoToFeed}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all"
          >
            <span>Back to Campus Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
