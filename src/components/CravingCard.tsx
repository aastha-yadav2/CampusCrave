import React from 'react';
import { Clock, MapPin, Users, ArrowRight, Zap, Check, AlertCircle } from 'lucide-react';
import { Craving } from '../types';
import { ProgressBar } from './ProgressBar';
import { DealStatusBadge } from './DealStatusBadge';
import { DealTierProgress } from './DealTierProgress';
import { formatCountdown, calculateRemainingSeconds } from '../engine/countdown';
import { isAlmostUnlocked } from '../engine/dealLifecycle';
import { calculateTierProgress } from '../engine/dealTiers';

interface CravingCardProps {
  craving: Craving;
  now: number;
  onJoin: (id: number) => void;
  onCardClick: (id: number) => void;
}

export const CravingCard: React.FC<CravingCardProps> = ({
  craving,
  now,
  onJoin,
  onCardClick,
}) => {
  const isUnlocked = craving.status === 'UNLOCKED' || craving.count >= craving.target;
  const isExpired = craving.status === 'EXPIRED';
  const isAlmost = isAlmostUnlocked(craving);
  const remainingSeconds = calculateRemainingSeconds(craving.expiresAt, now);
  const countdownFormatted = isUnlocked
    ? 'GOAL REACHED'
    : isExpired
    ? 'ENDED'
    : formatCountdown(remainingSeconds);

  const tierProgress = calculateTierProgress(craving);
  const remainingToTarget = Math.max(0, craving.target - craving.count);

  return (
    <article
      onClick={() => onCardClick(craving.id)}
      className={`group bg-white rounded-3xl border shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col overflow-hidden cursor-pointer ${
        isAlmost
          ? 'border-brand-400 ring-2 ring-brand-400/20 shadow-md'
          : isUnlocked
          ? 'border-emerald-300'
          : isExpired
          ? 'border-stone-200 opacity-80'
          : 'border-stone-200/80 hover:border-brand-300'
      }`}
    >
      {/* Card Visual Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={craving.image}
          alt={craving.restaurant}
          className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
            isExpired ? 'grayscale-30' : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/75 via-charcoal-900/20 to-transparent" />

        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Status Badge */}
          <DealStatusBadge status={craving.status} isAlmostUnlocked={isAlmost} size="sm" />

          {/* Real-time Countdown Timer Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold backdrop-blur-md shadow-xs ${
              isUnlocked
                ? 'bg-emerald-900/80 text-emerald-200'
                : isExpired
                ? 'bg-charcoal-900/80 text-stone-400'
                : remainingSeconds <= 120
                ? 'bg-rose-600/90 text-white animate-pulse'
                : 'bg-charcoal-900/80 text-white'
            }`}
          >
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="font-mono tracking-tight">{countdownFormatted}</span>
          </span>
        </div>

        {/* Bottom Zone Pill in Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-xs">
            <MapPin className="w-3 h-3 text-brand-400" />
            <span className="truncate max-w-[180px]">{craving.zone}</span>
          </span>
          <span className="text-[11px] font-bold text-amber-300">
            {craving.priceRange}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Restaurant & Category Header */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-display font-extrabold text-base sm:text-lg text-charcoal-900 group-hover:text-brand-600 transition-colors leading-snug">
              {craving.restaurant}
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal-500 bg-stone-100 px-2 py-0.5 rounded-md flex-shrink-0">
              {craving.category}
            </span>
          </div>

          {/* Craving Description */}
          <p className="text-xs text-charcoal-600 line-clamp-2 leading-relaxed">
            {craving.food}
          </p>

          {/* Compact Tier progress headline */}
          <div className="mt-2.5">
            <DealTierProgress craving={craving} compact />
          </div>
        </div>

        {/* Progress & Milestone Section */}
        <div className="space-y-2 pt-2 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-charcoal-700 font-semibold">
              <Users className="w-3.5 h-3.5 text-brand-500" />
              <span>
                <b className="text-charcoal-900 font-extrabold">{craving.count}</b> / {craving.target} craving
              </span>
            </div>
            <div className={`text-[11px] font-bold ${isUnlocked ? 'text-emerald-600 font-extrabold' : 'text-stone-500'}`}>
              {isUnlocked ? (
                <span className="flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Deal Unlocked!
                </span>
              ) : isExpired ? (
                <span className="text-stone-400">Target not reached</span>
              ) : (
                <span>{remainingToTarget} more needed</span>
              )}
            </div>
          </div>

          <ProgressBar current={craving.count} target={craving.target} isUnlocked={isUnlocked} size="md" />
        </div>

        {/* Card Footer: Avatars & Action */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Avatar stack */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {craving.participants.slice(0, 3).map((p) => (
              <div
                key={p.id}
                title={p.name}
                className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${p.avatarBg}`}
              >
                {p.initial}
              </div>
            ))}
            {craving.count > 3 && (
              <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-charcoal-600 shadow-xs">
                +{craving.count - 3}
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isExpired) {
                onCardClick(craving.id); // Open expired options
              } else if (isUnlocked) {
                onCardClick(craving.id); // Open unlocked deal
              } else {
                onJoin(craving.id);
              }
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              craving.joined
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                : isUnlocked
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
                : isExpired
                ? 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                : 'bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white border border-brand-200 hover:border-brand-500'
            }`}
          >
            {craving.joined ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Joined</span>
              </>
            ) : isUnlocked ? (
              <>
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Claim Deal</span>
              </>
            ) : isExpired ? (
              <>
                <AlertCircle className="w-3.5 h-3.5" />
                <span>View Options</span>
              </>
            ) : (
              <>
                <span>Join Pool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};
