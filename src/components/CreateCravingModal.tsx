import React, { useState } from 'react';
import { X, Sparkles, Utensils, Clock, MapPin, IndianRupee, Users, ArrowRight } from 'lucide-react';
import { CampusOption, FoodCategory, CravingInput } from '../types';

interface CreateCravingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCampus: CampusOption;
  selectedZone: string;
  onSubmit: (input: CravingInput) => void;
}

const POPULAR_RESTAURANTS = [
  'Burger Barn',
  'Momo Junction',
  'Pizza Theory',
  'Biryani Blues',
  'Wok & Roll Chinese',
  'Chaayos',
  'The Dessert Lab',
];

const TIME_WINDOWS = [
  'Tonight · 8:15 PM - 8:45 PM',
  'Tonight · 8:45 PM - 9:15 PM',
  'Tonight · 9:15 PM - 9:45 PM',
  'Tonight · 10:00 PM - 10:30 PM',
];

const CATEGORIES: FoodCategory[] = [
  'Burgers',
  'Pizza',
  'Momos',
  'Biryani',
  'Chinese',
  'Snacks',
  'Desserts',
  'Healthy',
];

export const CreateCravingModal: React.FC<CreateCravingModalProps> = ({
  isOpen,
  onClose,
  selectedCampus,
  selectedZone,
  onSubmit,
}) => {
  const [restaurant, setRestaurant] = useState('');
  const [food, setFood] = useState('');
  const [category, setCategory] = useState<FoodCategory>('Burgers');
  const [zone, setZone] = useState(selectedZone || selectedCampus.zones[0]);
  const [timeWindow, setTimeWindow] = useState(TIME_WINDOWS[0]);
  const [budget, setBudget] = useState(180);
  const [target, setTarget] = useState(8);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant.trim()) {
      setError('Please enter or select a restaurant name.');
      return;
    }
    if (!food.trim()) {
      setError('Please describe what food you are craving.');
      return;
    }

    setError('');
    onSubmit({
      restaurant: restaurant.trim(),
      food: food.trim(),
      category,
      campus: selectedCampus.name,
      zone,
      timeWindow,
      budget,
      target,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/65 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white rounded-3xl w-full max-w-xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-cream-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">
                START A COLLECTIVE POOL
              </span>
              <h2 className="font-display font-extrabold text-lg text-charcoal-900">
                What are you craving?
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-stone-400 hover:text-charcoal-800 hover:bg-stone-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {/* Restaurant input & quick chips */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1.5">
              Restaurant Name <span className="text-brand-500">*</span>
            </label>
            <input
              type="text"
              value={restaurant}
              onChange={(e) => setRestaurant(e.target.value)}
              placeholder="e.g. Burger Barn, Momo Junction, Pizza Theory..."
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              required
            />
            {/* Quick Suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap mt-2">
              <span className="text-[10px] text-stone-400 font-medium">Popular on campus:</span>
              {POPULAR_RESTAURANTS.slice(0, 4).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRestaurant(r)}
                  className="text-[10px] font-semibold text-charcoal-600 bg-stone-100 hover:bg-brand-50 hover:text-brand-700 px-2 py-0.5 rounded-md transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Food Craving Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1.5">
              Craving Title & Dishes <span className="text-brand-500">*</span>
            </label>
            <input
              type="text"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="e.g. Smash cheeseburgers, seasoned waffle fries & shakes"
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              required
            />
          </div>

          {/* Food Category Pill Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1.5">
              Food Category
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    category === cat
                      ? 'bg-charcoal-900 text-white'
                      : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Campus Delivery Zone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1.5">
              Campus Delivery Zone
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            >
              {selectedCampus.zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          {/* Preferred Ordering Window & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1.5">
                Ordering Window
              </label>
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500"
              >
                {TIME_WINDOWS.map((tw) => (
                  <option key={tw} value={tw}>
                    {tw}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-600 mb-1.5">
                Target Budget / Student
              </label>
              <select
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs font-medium bg-white focus:outline-none focus:border-brand-500"
              >
                <option value={100}>₹100 (Snack budget)</option>
                <option value={150}>₹150 (Economy meal)</option>
                <option value={180}>₹180 (Standard combo)</option>
                <option value={220}>₹220 (Feast meal)</option>
                <option value={300}>₹300+ (Premium spread)</option>
              </select>
            </div>
          </div>

          {/* Group Target Size */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-charcoal-600">
                Unlock Target: {target} students
              </label>
              <span className="text-[11px] text-brand-600 font-semibold">
                Deal unlocks at {target} participants
              </span>
            </div>
            <div className="flex items-center gap-2">
              {[5, 8, 10, 12, 15].map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setTarget(t)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    target === t
                      ? 'bg-brand-500 text-white shadow-xs'
                      : 'bg-stone-100 text-charcoal-600 hover:bg-stone-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Smart Matching Notice */}
          <div className="p-3.5 rounded-2xl bg-brand-50/60 border border-brand-200/60 flex items-start gap-2.5 text-xs text-charcoal-600">
            <Sparkles className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <b>Smart Matching Check:</b> Before creating a duplicate pool, we will search for existing active cravings matching this restaurant & zone so you can unlock deals immediately!
            </p>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <span>Check Matches & Create Craving</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
