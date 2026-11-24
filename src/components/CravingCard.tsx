import React from 'react';
import { Clock, MapPin, Users, ArrowRight, Zap, Check, Flame } from 'lucide-react';
import { Craving } from '../types';
import { ProgressBar } from './ProgressBar';
import { formatMinutesLeft } from '../utils/formatters';

interface CravingCardProps {
  craving: Craving;
  onJoin: (id: number) => void;
  onCardClick: (id: number) => void;
}

export const CravingCard: React.FC<CravingCardProps> = ({
  craving,
  onJoin,
  onCardClick,
}) => {
  const isUnlocked = craving.count >= craving.target || craving.status === 'DEAL_UNLOCKED';
  const remaining = Math.max(0, craving.target - craving.count);

  return (
    <article
      onClick={() => onCardClick(craving.id)}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Card Visual Header */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
        <img
          src={craving.image}
          alt={craving.restaurant}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-charcoal-900/20 to-transparent" />

        {/* Floating Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          {/* Deal Tag */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold shadow-md backdrop-blur-md ${
              isUnlocked
                ? 'bg-emerald-500 text-white'
                : 'bg-white/95 text-brand-600'
            }`}
          >
            {isUnlocked ? <Zap className="w-3.5 h-3.5 fill-white" /> : <Flame className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />}
            <span>{craving.deal}</span>
          </span>

          {/* Time Remaining Tag */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-charcoal-900/80 text-white backdrop-blur-md">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{formatMinutesLeft(craving.deadlineMinutes)}</span>
          </span>
        </div>

        {/* Bottom Zone Pill in Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-black/40 px-2 py-0.5 rounded-lg backdrop-blur-xs">
            <MapPin className="w-3 h-3 text-brand-400" />
            <span className="truncate max-w-[200px]">{craving.zone}</span>
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
            <div className={`text-[11px] font-bold ${isUnlocked ? 'text-success font-extrabold' : 'text-stone-500'}`}>
              {isUnlocked ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Deal Unlocked!
                </span>
              ) : (
                <span>{remaining} more needed</span>
              )}
            </div>
          </div>

          <ProgressBar current={craving.count} target={craving.target} isUnlocked={isUnlocked} size="md" />
        </div>

        {/* Card Footer: Avatars & Join Action */}
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

          {/* Join / Status Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onJoin(craving.id);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              craving.joined
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                : isUnlocked
                ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-sm'
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
