import React, { useState } from 'react';
import {
  MapPin,
  ChevronDown,
  Bell,
  Plus,
  Flame,
  ShoppingBag,
  Sparkles,
  Compass,
  Check,
  CheckCircle,
} from 'lucide-react';
import { CampusOption } from '../types';

interface NavbarProps {
  currentView: 'feed' | 'live' | 'deal' | 'checkout' | 'success' | 'my-cravings' | 'orders';
  onNavigate: (view: 'feed' | 'live' | 'deal' | 'checkout' | 'success' | 'my-cravings' | 'orders') => void;
  selectedCampus: CampusOption;
  selectedZone: string;
  onOpenCampusModal: () => void;
  onOpenCreateCraving: () => void;
  joinedCount: number;
  ordersCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedCampus,
  selectedZone,
  onOpenCampusModal,
  onOpenCreateCraving,
  joinedCount,
  ordersCount,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Burger Barn Pool 80% Full', desc: 'Just 2 more students needed to unlock 25% OFF!', time: '3m ago', unread: true },
    { id: 2, title: 'Biryani Blues Deal Unlocked!', desc: '30% OFF handi deal is unlocked and ordering is open.', time: '14m ago', unread: false },
    { id: 3, title: 'Momo Junction Closing Soon', desc: 'Pool closes in 5 minutes for tonight delivery.', time: '20m ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Brand Identity */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('feed')}>
          <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white font-display font-extrabold text-xl shadow-md shadow-brand-500/25 tracking-tight group">
            <span>C</span>
            <span className="w-2 h-2 rounded-full bg-amber-300 absolute top-2 right-2 border border-brand-600 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-charcoal-900">
                campus<span className="text-brand-500">crave</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
                CAMPUS HUB
              </span>
            </div>
            <p className="text-[10px] text-charcoal-500 font-medium hidden sm:block">
              Your cravings. Better deals together.
            </p>
          </div>
        </div>

        {/* Interactive Campus Selector */}
        <button
          onClick={onOpenCampusModal}
          className="flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-cream-100 hover:bg-cream-200/80 border border-stone-200/90 text-left transition-all hover:border-brand-300 group max-w-[200px] sm:max-w-xs"
        >
          <div className="w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-charcoal-400">
              <span>Campus Delivery</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-xs font-bold text-charcoal-800 truncate">
              {selectedCampus.name.split(',')[0]}
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-500 transition-colors ml-auto flex-shrink-0" />
        </button>

        {/* Center/Right Navigation links for Desktop */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          <button
            onClick={() => onNavigate('feed')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'feed'
                ? 'bg-brand-50 text-brand-600 font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-50'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Live Feed</span>
          </button>

          <button
            onClick={() => onNavigate('my-cravings')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative ${
              currentView === 'my-cravings' || currentView === 'live' || currentView === 'deal'
                ? 'bg-brand-50 text-brand-600 font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-50'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>My Cravings</span>
            {joinedCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {joinedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onNavigate('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              currentView === 'orders' || currentView === 'checkout' || currentView === 'success'
                ? 'bg-brand-50 text-brand-600 font-bold'
                : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Orders</span>
            {ordersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-stone-200 text-charcoal-700 text-[10px] font-bold flex items-center justify-center">
                {ordersCount}
              </span>
            )}
          </button>
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Start Craving Primary CTA */}
          <button
            onClick={onOpenCreateCraving}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Start a Craving</span>
          </button>

          {/* Notifications Popover */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-charcoal-600 hover:text-charcoal-900 flex items-center justify-center transition-colors"
              aria-label="Campus Crave Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-brand-500 absolute top-2 right-2 ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-50 animate-slide-up">
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="font-display font-bold text-sm text-charcoal-900">Campus Crave Activity</span>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Live Demo
                  </span>
                </div>
                <div className="divide-y divide-stone-100 max-h-64 overflow-y-auto mt-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2.5 px-1 hover:bg-stone-50 rounded-lg transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-charcoal-800">{n.title}</span>
                        <span className="text-[10px] text-stone-400 whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-charcoal-500 mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-2 border-t border-stone-100 text-center">
                  <span className="text-[11px] text-brand-600 font-semibold cursor-pointer hover:underline" onClick={() => setShowNotifications(false)}>
                    Mark all caught up
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-stone-200">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-brand-100 to-amber-200 text-brand-900 border border-brand-200 flex items-center justify-center font-display font-bold text-xs shadow-xs">
              AS
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-charcoal-800 leading-tight">Aastha S.</div>
              <div className="text-[10px] text-charcoal-500 font-medium">Hostel Block A</div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
