import React from 'react';

interface ProgressBarProps {
  current: number;
  target: number;
  isUnlocked?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  isUnlocked = false,
  size = 'md',
  showLabel = false,
}) => {
  const percentage = Math.min(100, Math.round((current / target) * 100));
  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-charcoal-600">
            <span className="font-bold text-charcoal-900">{current}</span> of {target} joined
          </span>
          <span className={`font-semibold ${isUnlocked ? 'text-success font-bold' : 'text-brand-600'}`}>
            {isUnlocked ? 'Goal Reached (100%)' : `${percentage}% unlocked`}
          </span>
        </div>
      )}
      <div className={`w-full bg-stone-200/80 rounded-full overflow-hidden ${heightClass} p-[1px]`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            isUnlocked
              ? 'bg-gradient-to-r from-emerald-500 to-green-400'
              : 'bg-gradient-to-r from-brand-500 to-amber-400'
          }`}
          style={{ width: `${Math.max(6, percentage)}%` }}
        />
      </div>
    </div>
  );
};
