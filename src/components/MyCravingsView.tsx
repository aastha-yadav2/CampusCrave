import React from 'react';
import { Flame, Clock, MapPin, Users, ArrowRight, Zap, Check, Sparkles } from 'lucide-react';
import { Craving } from '../types';
import { ProgressBar } from './ProgressBar';
import { formatMinutesLeft } from '../utils/formatters';

interface MyCravingsViewProps {
  cravings: Craving[];
  onSelectCraving: (id: number) => void;
  onExploreClick: () => void;
}

export const MyCravingsView: React.FC<MyCravingsViewProps> = ({
  cravings,
  onSelectCraving,
  onExploreClick,
}) => {
  const joinedCravings = cravings.filter((c) => c.joined);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 tracking-tight flex items-center gap-2">
            <Flame className="w-7 h-7 text-brand-500 fill-brand-500" />
            <span>My Active Cravings</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            Cravings you have created or joined on campus
          </p>
        </div>
        <div className="text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-3 py-1.5 rounded-xl self-start sm:self-center">
          {joinedCravings.length} Active {joinedCravings.length === 1 ? 'Pool' : 'Pools'} Joined
        </div>
      </div>

      {joinedCravings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mx-auto border border-brand-100">
            <Flame className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-display font-extrabold text-lg text-charcoal-900">
              No cravings joined yet
            </h3>
            <p className="text-xs text-charcoal-600 max-w-sm mx-auto">
              You haven't joined or started any campus cravings yet. Explore what others are craving and unlock group deals!
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {joinedCravings.map((craving) => {
            const isUnlocked = craving.count >= craving.target || craving.status === 'DEAL_UNLOCKED';
            const remaining = Math.max(0, craving.target - craving.count);

            return (
              <div
                key={craving.id}
                onClick={() => onSelectCraving(craving.id)}
                className="bg-white rounded-2xl border border-stone-200 shadow-card hover:shadow-card-hover hover:border-brand-300 transition-all p-5 flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                        isUnlocked
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-brand-50 text-brand-700 border border-brand-200'
                      }`}
                    >
                      {isUnlocked ? 'DEAL UNLOCKED' : 'POOL IN PROGRESS'}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span>{formatMinutesLeft(craving.deadlineMinutes)}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <img
                      src={craving.image}
                      alt={craving.restaurant}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-extrabold text-base text-charcoal-900 truncate">
                        {craving.restaurant}
                      </h3>
                      <p className="text-xs text-charcoal-500 truncate">
                        {craving.food}
                      </p>
                      <div className="text-[11px] font-bold text-brand-600 mt-0.5">
                        {craving.deal}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-stone-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-charcoal-700">
                      <b>{craving.count}</b> / {craving.target} students joined
                    </span>
                    <span className={isUnlocked ? 'text-emerald-600 font-bold' : 'text-stone-500'}>
                      {isUnlocked ? 'Goal Reached!' : `${remaining} more needed`}
                    </span>
                  </div>
                  <ProgressBar current={craving.count} target={craving.target} isUnlocked={isUnlocked} size="md" />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-charcoal-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{craving.zone}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCraving(craving.id);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    <span>{isUnlocked ? 'Claim Deal' : 'View Status'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
