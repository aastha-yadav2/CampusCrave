import React from 'react';
import { ShoppingBag, ArrowRight, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { PlacedOrder } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OrdersViewProps {
  orders: PlacedOrder[];
  onExploreClick: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ orders, onExploreClick }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-brand-500" />
            <span>Orders & Receipts</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            Your individual orders placed through campus craving deals (prototype demo)
          </p>
        </div>
        <div className="text-xs font-semibold text-charcoal-700 bg-stone-100 px-3 py-1.5 rounded-xl self-start sm:self-center">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Placed
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-lg text-charcoal-900">
              No orders placed yet
            </h3>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
              When a campus craving reaches its unlock target, you can order your favorite meal at a collective group discount.
            </p>
          </div>
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02]"
          >
            <span>Explore Campus Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.orderId}
              className="bg-white rounded-2xl border border-stone-200 shadow-card p-5 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-base text-charcoal-900">
                      {order.restaurant}
                    </h3>
                    <div className="text-[11px] text-charcoal-500">
                      Order ID: <b>{order.orderId}</b> · Placed {order.placedAt}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    {order.status === 'ORDER_PLACED' ? 'Kitchen Preparing' : order.status}
                  </span>
                </div>
              </div>

              {/* Items in order */}
              <div className="text-xs text-charcoal-700 space-y-1">
                {order.items.map((it) => (
                  <div key={it.id} className="flex justify-between">
                    <span>{it.quantity}x {it.name}</span>
                    <span className="font-semibold">{formatCurrency(it.price * it.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Summary row */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-charcoal-500">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" />
                  <span>Delivery Zone: <b>{order.zone}</b></span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    Saved {formatCurrency(order.dealDiscount)}
                  </span>
                  <div className="text-sm font-bold text-charcoal-900">
                    Total: <span className="font-display font-extrabold text-brand-600">{formatCurrency(order.finalTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
