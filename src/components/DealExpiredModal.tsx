import React, { useState } from 'react';
import { X, AlertCircle, ArrowRight, ShoppingBag, Compass, LogOut, ShieldAlert } from 'lucide-react';
import { Craving } from '../types';

interface DealExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  craving: Craving;
  onFindAnother: () => void;
  onOrderRegularPrice: () => void;
  onLeaveCraving: () => void;
}

export const DealExpiredModal: React.FC<DealExpiredModalProps> = ({
  isOpen,
  onClose,
  craving,
  onFindAnother,
  onOrderRegularPrice,
  onLeaveCraving,
}) => {
  const [confirmRegularPrice, setConfirmRegularPrice] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/70 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-stone-200 overflow-hidden animate-slide-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-charcoal-500">
                POOL WINDOW CLOSED
              </span>
              <h3 className="font-display font-extrabold text-base text-charcoal-900">
                Almost made it!
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-charcoal-800 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-charcoal-600 leading-relaxed">
            This craving pool for <b>{craving.restaurant}</b> didn't reach the required target of <b>{craving.target} students</b> before the ordering window ended.
          </p>

          {/* Result Card */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-600 font-semibold">Final Pool Size:</span>
              <span className="font-bold text-charcoal-900">
                {craving.count} of {craving.target} students
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-600 font-semibold">Delivery Zone:</span>
              <span className="text-charcoal-800 font-medium">{craving.zone}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-charcoal-600 font-semibold">Unclaimed Reward:</span>
              <span className="text-brand-600 line-through font-semibold">{craving.deal}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-charcoal-600 leading-relaxed">
            <b>Zero automatic charges:</b> You have not been charged and no order was created. Choose how you would like to proceed:
          </div>

          {/* Confirmation step if user clicked regular price */}
          {confirmRegularPrice ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs text-amber-900">Confirm Regular Price Order</h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-snug">
                    Because this group deal did not reach its goal, you will pay the standard menu price without the group discount ({craving.deal}).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setConfirmRegularPrice(false)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold text-charcoal-700 bg-white border border-stone-200 hover:bg-stone-50"
                >
                  Go Back
                </button>
                <button
                  onClick={onOrderRegularPrice}
                  className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-xs"
                >
                  I Understand, Order at Regular Price
                </button>
              </div>
            </div>
          ) : (
            /* Core 3 Required Options */
            <div className="space-y-2 pt-1">
              {/* Option A */}
              <button
                onClick={onFindAnother}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-brand-50 hover:bg-brand-100 border border-brand-200 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-charcoal-900">OPTION A: Find another craving</div>
                    <div className="text-[11px] text-charcoal-500">Discover active pools unlocking right now on campus</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-600" />
              </button>

              {/* Option B */}
              <button
                onClick={() => setConfirmRegularPrice(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-stone-50 border border-stone-200 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-stone-100 text-charcoal-700 flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-charcoal-900">OPTION B: Order at regular price</div>
                    <div className="text-[11px] text-charcoal-500">Proceed to order from {craving.restaurant} without group discount</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-charcoal-700" />
              </button>

              {/* Option C */}
              <button
                onClick={onLeaveCraving}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-rose-50/50 border border-stone-200 text-left transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <LogOut className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-xs text-charcoal-900">OPTION C: Leave craving</div>
                    <div className="text-[11px] text-charcoal-500">Exit this craving pool with no purchase</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
