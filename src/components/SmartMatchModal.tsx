import React from 'react';
import { X, Sparkles, Check, ArrowRight, Clock, MapPin, Users, Flame } from 'lucide-react';
import { MatchScoreBreakdown } from '../types';
import { ProgressBar } from './ProgressBar';
import { formatMinutesLeft } from '../utils/formatters';

interface SmartMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchScoreBreakdown[];
  onJoinMatch: (cravingId: number) => void;
  onCreateAnyway: () => void;
}

export const SmartMatchModal: React.FC<SmartMatchModalProps> = ({
  isOpen,
  onClose,
  matches,
  onJoinMatch,
  onCreateAnyway,
}) => {
  if (!isOpen || matches.length === 0) return null;

  const topMatch = matches[0];
  const pool = topMatch.matchedCraving;
  const remaining = Math.max(0, pool.target - pool.count);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/65 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-gradient-to-r from-cream-100 to-orange-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 flex items-center gap-1">
                <span>Smart Craving Match</span>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
              </div>
              <h2 className="font-display font-extrabold text-lg text-charcoal-900">
                Someone on your campus is craving this!
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-stone-400 hover:text-charcoal-800 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Why pool together notice */}
          <div className="text-xs text-charcoal-600 bg-amber-50/70 border border-amber-200/70 p-3.5 rounded-2xl flex items-start gap-3">
            <Flame className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-charcoal-900 mb-0.5">Don't create a fragmented group!</div>
              <p className="text-charcoal-600 leading-relaxed text-[11px]">
                Joining this active pool helps you and {pool.count} other students unlock collective restaurant discounts faster. You still order and pay individually.
              </p>
            </div>
          </div>

          {/* Matched Pool Card */}
          <div className="rounded-2xl border-2 border-brand-500/70 bg-white shadow-md p-4 sm:p-5 relative overflow-hidden">
            {/* Top Score Banner */}
            <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-xl bg-brand-500 text-white font-display font-extrabold text-xs shadow-xs">
                  {topMatch.score}% Compatibility
                </span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60">
                  {topMatch.tierLabel}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-500">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{formatMinutesLeft(pool.deadlineMinutes)}</span>
              </div>
            </div>

            {/* Restaurant & Food details */}
            <div className="flex gap-4 items-start">
              <img
                src={pool.image}
                alt={pool.restaurant}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover border border-stone-200 shadow-xs flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold uppercase tracking-wider text-charcoal-400">
                  {pool.category} · {pool.zone}
                </div>
                <h4 className="font-display font-extrabold text-base text-charcoal-900 truncate mt-0.5">
                  {pool.restaurant}
                </h4>
                <p className="text-xs text-charcoal-600 line-clamp-2 mt-1">
                  {pool.food}
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-600 mt-2 bg-brand-50 px-2 py-0.5 rounded-md">
                  <Sparkles className="w-3 h-3" />
                  <span>Unlocks: {pool.deal}</span>
                </div>
              </div>
            </div>

            {/* Progress in Pool */}
            <div className="mt-4 pt-3 border-t border-stone-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-charcoal-700 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-500" />
                  <span><b>{pool.count}</b> of {pool.target} students joined</span>
                </span>
                <span className="text-brand-600 font-bold">
                  {remaining === 1 ? 'Just 1 more student needed!' : `${remaining} more students needed`}
                </span>
              </div>
              <ProgressBar current={pool.count} target={pool.target} size="md" />
            </div>

            {/* Match Breakdown Reasons */}
            <div className="mt-4 pt-3 border-t border-stone-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 mb-2">
                Why this craving matches:
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {topMatch.reasons.map((reason, idx) => (
                  <li key={idx} className="flex items-center gap-1.5 text-xs text-charcoal-700">
                    <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Secondary alternatives if multiple matches */}
          {matches.length > 1 && (
            <div className="text-xs text-charcoal-500 text-center">
              Also found {matches.length - 1} other active craving with partial match.
            </div>
          )}
        </div>

        {/* Modal Action Controls */}
        <div className="p-6 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onCreateAnyway}
            className="w-full sm:w-auto order-2 sm:order-1 px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-200/60 transition-colors"
          >
            Create new craving anyway
          </button>

          <button
            onClick={() => onJoinMatch(pool.id)}
            className="w-full sm:w-auto order-1 sm:order-2 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Join This Craving</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
