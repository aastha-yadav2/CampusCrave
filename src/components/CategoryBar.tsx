import React from 'react';
import { FoodCategory } from '../types';

interface CategoryBarProps {
  selectedCategory: FoodCategory;
  onSelectCategory: (cat: FoodCategory) => void;
  categoryCounts: Record<string, number>;
}

const CATEGORIES: { label: FoodCategory; icon: string }[] = [
  { label: 'All', icon: '🍽️' },
  { label: 'Burgers', icon: '🍔' },
  { label: 'Pizza', icon: '🍕' },
  { label: 'Momos', icon: '🥟' },
  { label: 'Biryani', icon: '🍚' },
  { label: 'Chinese', icon: '🥢' },
  { label: 'Snacks', icon: '☕' },
  { label: 'Desserts', icon: '🍰' },
  { label: 'Healthy', icon: '🥗' },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  return (
    <div className="w-full mb-6">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((item) => {
          const isSelected = selectedCategory === item.label;
          const count = categoryCounts[item.label] || 0;

          return (
            <button
              key={item.label}
              onClick={() => onSelectCategory(item.label)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                isSelected
                  ? 'bg-charcoal-900 text-white shadow-md shadow-charcoal-900/20 scale-[1.02]'
                  : 'bg-white hover:bg-stone-50 text-charcoal-700 border border-stone-200/80 hover:border-brand-200'
              }`}
            >
              <span className="text-sm leading-none">{item.icon}</span>
              <span>{item.label}</span>
              {count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-charcoal-500'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
