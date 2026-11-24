import React from 'react';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Users,
  Flame,
  Zap,
  Check,
  UserPlus,
  LogOut,
  Sparkles,
  Info,
} from 'lucide-react';
import { Craving } from '../types';
import { ProgressBar } from './ProgressBar';
import { formatMinutesLeft } from '../utils/formatters';

interface LiveCravingViewProps {
  craving: Craving;
  onBack: () => void;
  onSimulateJoin: (id: number) => void;
  onLeave: (id: number) => void;
  onClaimDeal: (id: number) => void;
}

export const LiveCravingView: React.FC<LiveCravingViewProps> = ({
  craving,
  onBack,
  onSimulateJoin,
  onLeave,
  onClaimDeal,
}) => {
  const isUnlocked = craving.count >= craving.target || craving.status === 'DEAL_UNLOCKED';
  const remaining = Math.max(0, craving.target - craving.count);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-charcoal-600 hover:text-charcoal-900 bg-white hover:bg-stone-50 px-3.5 py-2 rounded-xl border border-stone-200 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Feed</span>
      </button>

      {/* Main Live Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-card overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-60 sm:h-72 w-full overflow-hidden bg-stone-100">
          <img
            src={craving.image}
            alt={craving.restaurant}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-charcoal-900/30 to-transparent" />

          {/* Floating Live Badge */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-500 text-white font-bold text-xs shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>LIVE CRAVING POOL</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-charcoal-900/80 backdrop-blur-md text-white font-medium text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatMinutesLeft(craving.deadlineMinutes)}</span>
            </span>
          </div>

          {/* Restaurant & Zone info in banner */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 text-xs text-amber-300 font-semibold mb-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{craving.zone} · {craving.timeWindow}</span>
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight leading-tight">
              {craving.restaurant}
            </h1>
            <p className="text-xs sm:text-sm text-stone-200 line-clamp-1 mt-0.5">
              {craving.food}
            </p>
          </div>
        </div>

        {/* Live Pool Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Deal Status Card */}
          <div
            className={`p-5 rounded-2xl border transition-all ${
              isUnlocked
                ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-brand-50/60 border-brand-200'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs ${
                    isUnlocked ? 'bg-emerald-500 text-white' : 'bg-brand-500 text-white'
                  }`}
                >
                  {isUnlocked ? <Zap className="w-5 h-5 fill-white" /> : <Flame className="w-5 h-5 fill-white" />}
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-charcoal-500">
                    {isUnlocked ? 'GOAL ACHIEVED' : 'COLLECTIVE REWARD'}
                  </div>
                  <div className="font-display font-extrabold text-base sm:text-lg text-charcoal-900">
                    {craving.deal}
                  </div>
                  <div className="text-xs text-charcoal-600 mt-0.5">
                    Target: {craving.target} students · Price tier: {craving.priceRange}
                  </div>
                </div>
              </div>

              {isUnlocked && (
                <button
                  onClick={() => onClaimDeal(craving.id)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <Check className="w-4 h-4" />
                  <span>Claim Unlocked Deal</span>
                </button>
              )}
            </div>

            {/* Progress Bar & Counter */}
            <div className="mt-5 pt-4 border-t border-stone-200/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-charcoal-700">
                  <b className="font-display font-extrabold text-lg text-charcoal-900">{craving.count}</b> / {craving.target} students
                </span>
                <span className={isUnlocked ? 'text-emerald-700 font-extrabold' : 'text-brand-600 font-bold'}>
                  {isUnlocked ? 'Deal 100% Unlocked!' : `${remaining} more needed to unlock`}
                </span>
              </div>
              <ProgressBar current={craving.count} target={craving.target} isUnlocked={isUnlocked} size="lg" />
            </div>
          </div>

          {/* Participant list */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-brand-500" />
                <span className="font-display font-bold text-sm text-charcoal-900">
                  Students in this Craving Pool ({craving.count})
                </span>
              </div>
              <span className="text-[11px] text-stone-500 font-medium">
                Individual ordering & payment
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {craving.participants.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center gap-3 p-3 rounded-xl border border-stone-100 bg-stone-50/60"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${p.avatarBg}`}
                  >
                    {p.initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-charcoal-900 truncate">
                      {p.name}
                    </div>
                    <div className="text-[10px] text-charcoal-500">
                      {p.role || (idx === 0 ? 'Pool Initiator' : 'Campus Craver')}
                    </div>
                  </div>
                  {idx === 0 && (
                    <span className="text-[9px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Value proposition note */}
          <div className="p-4 rounded-2xl bg-cream-50 border border-brand-200/50 flex items-start gap-3 text-xs text-charcoal-600">
            <Info className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <b>How collective ordering works:</b> Joining this pool reserves your spot for the restaurant discount. When the target is reached, you choose your own food items and checkout individually at the discounted rate. No shared bill headaches!
            </p>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            {isUnlocked ? (
              <button
                onClick={() => onClaimDeal(craving.id)}
                className="w-full flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01]"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Choose Meal & Claim Deal</span>
              </button>
            ) : (
              <button
                onClick={() => onSimulateJoin(craving.id)}
                className="w-full flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Simulate Student Joining (+1)</span>
              </button>
            )}

            <button
              onClick={() => onLeave(craving.id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 font-bold text-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Leave Pool</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
