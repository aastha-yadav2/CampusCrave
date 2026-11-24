import React from 'react';
import { ArrowRight, Plus, Sparkles, Users, Flame, Zap, ShieldCheck } from 'lucide-react';
import { FOOD_IMAGES } from '../data/mockCravings';

interface HeroProps {
  onExploreClick: () => void;
  onStartCravingClick: () => void;
  stats: {
    activeCravings: number;
    studentsParticipating: number;
    dealsUnlocked: number;
  };
  campusName: string;
}

export const Hero: React.FC<HeroProps> = ({
  onExploreClick,
  onStartCravingClick,
  stats,
  campusName,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cream-200 via-orange-50/50 to-cream-100 border border-brand-200/60 shadow-card p-6 sm:p-10 lg:p-12 mb-10">
      {/* Subtle background glow effect */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-200/30 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Left Copy */}
        <div className="lg:col-span-7 space-y-5">
          {/* Live Campus Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 border border-brand-200/80 text-brand-800 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="uppercase tracking-wider text-[10px] text-charcoal-700">Live at {campusName.split(',')[0]}</span>
            <span className="text-stone-300">|</span>
            <span className="text-brand-600 font-extrabold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Collective Deals
            </span>
          </div>

          {/* Impactful Headline */}
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-charcoal-900 tracking-tight leading-[1.12]">
            Good food hits different when you{' '}
            <span className="text-brand-500 underline decoration-brand-200 decoration-wavy underline-offset-4">
              crave it together.
            </span>
          </h1>

          {/* Supporting Subheadline */}
          <p className="text-sm sm:text-base text-charcoal-600 font-medium leading-relaxed max-w-xl">
            Join cravings happening across your campus. When students pool their appetite for the same restaurant,
            collective deals unlock—and everyone orders and pays individually.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreClick}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Live Cravings</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onStartCravingClick}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white hover:bg-stone-50 text-charcoal-800 hover:text-brand-600 font-bold text-sm border border-stone-200/90 shadow-xs transition-all hover:border-brand-300"
            >
              <Plus className="w-4 h-4 text-brand-500" />
              <span>Start a Craving</span>
            </button>
          </div>

          {/* Live Campus Activity Counters */}
          <div className="pt-4 border-t border-brand-200/40">
            <div className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-2 flex items-center gap-1.5">
              <span>Happening on your campus right now</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-stone-100 rounded text-stone-500 font-medium normal-case">
                demo simulation
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-6">
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-stone-200/60 shadow-xs">
                <div className="font-display font-extrabold text-xl sm:text-2xl text-charcoal-900 leading-tight">
                  {stats.activeCravings}
                </div>
                <div className="text-[11px] font-medium text-charcoal-500">Active Cravings</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-stone-200/60 shadow-xs">
                <div className="font-display font-extrabold text-xl sm:text-2xl text-brand-600 leading-tight">
                  {stats.studentsParticipating}
                </div>
                <div className="text-[11px] font-medium text-charcoal-500">Students Joined</div>
              </div>
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3 border border-stone-200/60 shadow-xs">
                <div className="font-display font-extrabold text-xl sm:text-2xl text-emerald-600 leading-tight">
                  {stats.dealsUnlocked}
                </div>
                <div className="text-[11px] font-medium text-charcoal-500">Deals Unlocked</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Visual Composition */}
        <div className="lg:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full max-w-sm aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <img
              src={FOOD_IMAGES.burger}
              alt="Campus Crave Smash Burger"
              className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/70 via-transparent to-transparent" />

            {/* Floating Live Deal Pill Top Right */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-xl border border-stone-100 max-w-[190px] animate-fade-in">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 uppercase tracking-wide">
                <Zap className="w-3.5 h-3.5 fill-brand-500" />
                <span>Group Unlocked</span>
              </div>
              <div className="font-display font-extrabold text-sm text-charcoal-900 leading-tight mt-0.5">
                25% OFF + Free Fries
              </div>
              <div className="text-[10px] text-charcoal-500 mt-0.5">Burger Barn · 8/10 students</div>
            </div>

            {/* Bottom Tag */}
            <div className="absolute bottom-4 left-4 right-4 bg-charcoal-900/80 backdrop-blur-md text-white rounded-2xl p-3 flex items-center justify-between border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold leading-tight">Hostel Block A & B Hub</div>
                  <div className="text-[10px] text-stone-300">Ordering window: Tonight 8:30 PM</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  92% Match
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
