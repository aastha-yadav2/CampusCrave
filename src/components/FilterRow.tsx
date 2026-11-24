import React from 'react';
import { Search, X, Flame, Clock, Sparkles, IndianRupee } from 'lucide-react';
import { FilterPreset } from '../types';

interface FilterRowProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedFilter: FilterPreset;
  onSelectFilter: (filter: FilterPreset) => void;
  totalResults: number;
}

const FILTER_PRESETS: { id: FilterPreset; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Cravings', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: 'almost_unlocked', label: 'Almost Unlocked', icon: <Flame className="w-3.5 h-3.5 text-brand-500" /> },
  { id: 'ending_soon', label: 'Ending Soon', icon: <Clock className="w-3.5 h-3.5 text-amber-500" /> },
  { id: 'popular', label: 'Popular', icon: <Flame className="w-3.5 h-3.5 text-rose-500" /> },
  { id: 'budget_friendly', label: 'Budget-Friendly', icon: <IndianRupee className="w-3.5 h-3.5 text-emerald-500" /> },
];

export const FilterRow: React.FC<FilterRowProps> = ({
  searchQuery,
  onSearchChange,
  selectedFilter,
  onSelectFilter,
  totalResults,
}) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Instant Search Box */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search restaurants, cravings or dishes..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-white border border-stone-200/90 text-xs text-charcoal-900 placeholder:text-stone-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-charcoal-700 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Results Count & Status */}
        <div className="text-xs text-charcoal-500 font-medium self-end sm:self-center">
          Showing <span className="font-bold text-charcoal-900">{totalResults}</span> active campus pools
        </div>
      </div>

      {/* Preset Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {FILTER_PRESETS.map((preset) => {
          const isSelected = selectedFilter === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectFilter(preset.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-brand-50 text-brand-700 border border-brand-300 ring-1 ring-brand-400/40'
                  : 'bg-white hover:bg-stone-50 text-charcoal-600 border border-stone-200/80'
              }`}
            >
              {preset.icon}
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
