import React from 'react';
import { Zap, Clock, AlertCircle, Check, Flame } from 'lucide-react';
import { DealLifecycleState } from '../types';

interface DealStatusBadgeProps {
  status: DealLifecycleState;
  isAlmostUnlocked?: boolean;
  size?: 'sm' | 'md';
}

export const DealStatusBadge: React.FC<DealStatusBadgeProps> = ({
  status,
  isAlmostUnlocked = false,
  size = 'md',
}) => {
  const padClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (status === 'UNLOCKED') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-xl bg-emerald-500 text-white shadow-xs backdrop-blur-md ${padClass}`}>
        <Zap className="w-3.5 h-3.5 fill-white" />
        <span>DEAL UNLOCKED</span>
      </span>
    );
  }

  if (status === 'LOCKING') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-xl bg-amber-500 text-white shadow-xs backdrop-blur-md ${padClass}`}>
        <Clock className="w-3.5 h-3.5" />
        <span>FINALIZING...</span>
      </span>
    );
  }

  if (status === 'EXPIRED') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-xl bg-charcoal-700 text-stone-200 shadow-xs backdrop-blur-md ${padClass}`}>
        <AlertCircle className="w-3.5 h-3.5 text-stone-300" />
        <span>CRAVING ENDED</span>
      </span>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-xl bg-rose-600 text-white shadow-xs backdrop-blur-md ${padClass}`}>
        <span>CANCELLED</span>
      </span>
    );
  }

  // ACTIVE state
  if (isAlmostUnlocked) {
    return (
      <span className={`inline-flex items-center gap-1 font-bold rounded-xl bg-gradient-to-r from-amber-500 to-brand-500 text-white shadow-xs ${padClass}`}>
        <Flame className="w-3.5 h-3.5 fill-white animate-pulse" />
        <span>ALMOST UNLOCKED</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-xl bg-white/95 text-brand-600 shadow-xs backdrop-blur-md border border-brand-100 ${padClass}`}>
      <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
      <span>LIVE POOL</span>
    </span>
  );
};
