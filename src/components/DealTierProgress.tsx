import React from 'react';
import { Check, Sparkles, Trophy } from 'lucide-react';
import { Craving } from '../types';
import { calculateTierProgress } from '../engine/dealTiers';

interface DealTierProgressProps {
  craving: Craving;
  compact?: boolean;
}

export const DealTierProgress: React.FC<DealTierProgressProps> = ({ craving, compact = false }) => {
  const summary = calculateTierProgress(craving);
  const tiers = (craving.tiers && craving.tiers.length > 0)
    ? [...craving.tiers].sort((a, b) => a.participantsRequired - b.participantsRequired)
    : [];

  if (tiers.length === 0) return null;

  if (compact) {
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-charcoal-600 font-semibold flex items-center gap-1">
            <Trophy className="w-3 h-3 text-amber-500" />
            <span>
              {summary.currentTier
                ? summary.currentTier.title
                : `Next: ${summary.nextTier?.title || craving.deal}`}
            </span>
          </span>
          {summary.nextTier && (
            <span className="text-brand-600 font-bold text-[10px]">
              {summary.remainingToNextTier} more to next reward
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50/80 rounded-2xl p-4 border border-brand-200/50 space-y-3">
      {/* Tier Heading */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 font-bold text-charcoal-900">
          <Trophy className="w-4 h-4 text-brand-500" />
          <span>Collective Tier Rewards</span>
        </div>
        <span className="text-[11px] font-bold text-brand-600">
          {summary.currentTier ? `Tier ${summary.currentTier.tierNumber} Unlocked` : 'Targeting Tier 1'}
        </span>
      </div>

      {/* Visual Step Nodes */}
      <div className="grid grid-cols-3 gap-2 relative">
        {tiers.map((tier, idx) => {
          const isAchieved = craving.count >= tier.participantsRequired;
          const isNext = summary.nextTier?.id === tier.id;

          return (
            <div
              key={tier.id}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                isAchieved
                  ? 'bg-emerald-50 border-emerald-300 ring-1 ring-emerald-400/30'
                  : isNext
                  ? 'bg-white border-brand-300 ring-1 ring-brand-400/40 shadow-xs'
                  : 'bg-stone-50 border-stone-200 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span
                  className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                    isAchieved
                      ? 'bg-emerald-500 text-white'
                      : isNext
                      ? 'bg-brand-500 text-white'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  T{tier.tierNumber} · {tier.participantsRequired}
                </span>
                {isAchieved && <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />}
              </div>
              <div className="font-bold text-[11px] text-charcoal-900 truncate">
                {tier.title.split(':')[1]?.trim() || tier.title}
              </div>
              <div className="text-[10px] text-charcoal-500 line-clamp-1 mt-0.5">
                {tier.participantsRequired} students
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress helper footer */}
      <div className="text-[11px] text-charcoal-600 flex items-center justify-between pt-1">
        <span>Current pool: <b>{craving.count}</b> participants</span>
        {summary.nextTier ? (
          <span className="text-brand-600 font-bold">
            {summary.remainingToNextTier} more needed for Tier {summary.nextTier.tierNumber}
          </span>
        ) : (
          <span className="text-emerald-600 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Max Campus Tier Unlocked!
          </span>
        )}
      </div>
    </div>
  );
};
