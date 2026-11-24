import React, { useState } from 'react';
import {
  Wand2,
  Users,
  Zap,
  Clock,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Craving } from '../types';

interface DemoControlPanelProps {
  activeCraving: Craving;
  onSimulateCount: (count: number) => void;
  onAdvanceTier: () => void;
  onForceUnlock: () => void;
  onForceExpire: () => void;
  onReset: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const DemoControlPanel: React.FC<DemoControlPanelProps> = ({
  activeCraving,
  onSimulateCount,
  onAdvanceTier,
  onForceUnlock,
  onForceExpire,
  onReset,
  isDemoMode,
  onToggleDemoMode,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isDemoMode) {
    return (
      <button
        onClick={onToggleDemoMode}
        className="fixed bottom-20 md:bottom-5 left-4 z-40 inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-charcoal-900/90 text-amber-300 font-bold text-xs shadow-xl border border-charcoal-700 backdrop-blur-md hover:bg-charcoal-900 transition-all hover:scale-105"
        title="Open Judge Presentation Demo Controls"
      >
        <Wand2 className="w-4 h-4 text-amber-400" />
        <span>DEMO MODE</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-5 left-4 right-4 md:right-auto md:w-96 z-40 bg-charcoal-900/95 text-white rounded-3xl shadow-2xl border border-charcoal-700/80 backdrop-blur-lg overflow-hidden animate-slide-up">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-charcoal-800 bg-charcoal-950/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-display font-extrabold text-xs tracking-wider text-amber-300">
            JUDGE DEMO CONTROLS
          </span>
          <span className="text-[10px] text-stone-400 font-semibold bg-charcoal-800 px-1.5 py-0.5 rounded">
            Live Engine
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-lg text-stone-400 hover:text-white hover:bg-charcoal-800 flex items-center justify-center transition-colors"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
          <button
            onClick={onToggleDemoMode}
            className="text-[10px] text-stone-400 hover:text-white px-2 py-1 rounded hover:bg-charcoal-800 font-bold"
          >
            Exit
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3.5">
          {/* Active Target Banner */}
          <div className="flex items-center justify-between text-xs bg-charcoal-800/80 px-3 py-2 rounded-xl border border-charcoal-700">
            <span className="text-stone-300 truncate max-w-[170px]">
              Target: <b>{activeCraving.restaurant}</b>
            </span>
            <span className="font-bold text-amber-400">
              {activeCraving.count} / {activeCraving.target} · {activeCraving.status}
            </span>
          </div>

          {/* Quick Simulation Buttons */}
          <div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1">
              <Users className="w-3 h-3 text-amber-400" />
              <span>Simulate Live Students</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onSimulateCount(1)}
                className="py-2 rounded-xl bg-charcoal-800 hover:bg-brand-600 text-white font-bold text-xs transition-colors border border-charcoal-700 flex items-center justify-center gap-1"
              >
                <span>+1</span> Student
              </button>
              <button
                onClick={() => onSimulateCount(3)}
                className="py-2 rounded-xl bg-charcoal-800 hover:bg-brand-600 text-white font-bold text-xs transition-colors border border-charcoal-700 flex items-center justify-center gap-1"
              >
                <span>+3</span> Students
              </button>
              <button
                onClick={() => onSimulateCount(5)}
                className="py-2 rounded-xl bg-charcoal-800 hover:bg-brand-600 text-white font-bold text-xs transition-colors border border-charcoal-700 flex items-center justify-center gap-1"
              >
                <span>+5</span> Students
              </button>
            </div>
          </div>

          {/* Milestone Triggers */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Instant Lifecycle Triggers</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onAdvanceTier}
                className="py-2.5 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-800 text-emerald-300 font-bold text-xs border border-emerald-700/60 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>Next Tier</span>
              </button>

              <button
                onClick={onForceUnlock}
                className="py-2.5 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-600/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>Instant Unlock</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={onForceExpire}
                className="py-2 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-stone-300 font-bold text-xs border border-charcoal-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Force Expire</span>
              </button>

              <button
                onClick={onReset}
                className="py-2 px-3 rounded-xl bg-charcoal-800 hover:bg-rose-900/60 text-stone-300 hover:text-rose-200 font-bold text-xs border border-charcoal-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Craving</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
