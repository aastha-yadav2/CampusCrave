import React, { useMemo, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Compass,
  Flame,
  Plus,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import './styles.css';

import {
  Craving,
  CravingInput,
  FilterPreset,
  FoodCategory,
  MatchScoreBreakdown,
  OrderItem,
  PlacedOrder,
} from './types';
import { CAMPUSES } from './data/campuses';
import { INITIAL_CRAVINGS, FOOD_IMAGES } from './data/mockCravings';
import { findCompatibleCravings } from './utils/cravingMatcher';
import { generateDefaultTiers } from './engine/dealTiers';
import {
  joinCravingPool,
  leaveCravingPool,
  simulateStudentsJoining,
  advanceToNextTier,
  forceInstantUnlock,
  forceInstantExpiration,
  evaluateCravingExpiry,
  DEMO_USER_ID,
} from './engine/dealEngine';
import { useDealTimer } from './hooks/useDealTimer';
import {
  loadStoredCravings,
  saveStoredCravings,
  loadStoredOrders,
  saveStoredOrders,
  loadDemoModeState,
  saveDemoModeState,
  clearAndResetStorage,
} from './engine/storage';

import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { CategoryBar } from './components/CategoryBar';
import { FilterRow } from './components/FilterRow';
import { CravingCard } from './components/CravingCard';
import { LiveCravingView } from './components/LiveCravingView';
import { UnlockedDealView } from './components/UnlockedDealView';
import { CheckoutView } from './components/CheckoutView';
import { OrderSuccessView } from './components/OrderSuccessView';
import { MyCravingsView } from './components/MyCravingsView';
import { OrdersView } from './components/OrdersView';
import { SmartMatchModal } from './components/SmartMatchModal';
import { CreateCravingModal } from './components/CreateCravingModal';
import { CampusSelectorModal } from './components/CampusSelectorModal';
import { DealExpiredModal } from './components/DealExpiredModal';
import { DemoControlPanel } from './components/DemoControlPanel';
import { Toast, ToastMessage } from './components/Toast';

export function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<
    'feed' | 'live' | 'deal' | 'checkout' | 'success' | 'my-cravings' | 'orders'
  >('feed');

  // Campus location state
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0]);
  const [selectedZone, setSelectedZone] = useState(CAMPUSES[0].zones[0]);

  // Cravings and order state with local storage persistence
  const [cravings, setCravings] = useState<Craving[]>(() => loadStoredCravings());
  const [activeCravingId, setActiveCravingId] = useState<number>(1);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>(() => loadStoredOrders());
  const [activeOrder, setActiveOrder] = useState<PlacedOrder | null>(null);

  // Judge Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => loadDemoModeState());

  // Checkout intermediate state
  const [checkoutData, setCheckoutData] = useState<{
    items: OrderItem[];
    itemTotal: number;
    discount: number;
    isRegularPriceFallback?: boolean;
  } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('All');
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>('all');

  // Modal states
  const [campusModalOpen, setCampusModalOpen] = useState(false);
  const [createCravingOpen, setCreateCravingOpen] = useState(false);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [expiredModalOpen, setExpiredModalOpen] = useState(false);
  const [smartMatches, setSmartMatches] = useState<MatchScoreBreakdown[]>([]);
  const [pendingCravingInput, setPendingCravingInput] = useState<CravingInput | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, title?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ id: Date.now().toString(), message, title, type });
  };

  // Sync cravings to localStorage whenever changed
  useEffect(() => {
    saveStoredCravings(cravings);
  }, [cravings]);

  // Sync orders to localStorage
  useEffect(() => {
    saveStoredOrders(placedOrders);
  }, [placedOrders]);

  // Sync demo mode
  useEffect(() => {
    saveDemoModeState(isDemoMode);
  }, [isDemoMode]);

  // Real-time second-by-second countdown hook
  const { now } = useDealTimer(cravings, (expiredId) => {
    setCravings((prev) =>
      prev.map((c) => {
        if (c.id !== expiredId) return c;
        const res = evaluateCravingExpiry(c, Date.now());
        if (res.updated) {
          if (res.transition === 'UNLOCKED') {
            showToast(`Time ended and target reached! Deal unlocked for ${c.restaurant}`, 'Deal Secured! 🎉');
          } else if (res.transition === 'EXPIRED') {
            showToast(`Ordering window ended for ${c.restaurant} without reaching group target.`, 'Pool Expired', 'warning');
          }
          return res.craving;
        }
        return c;
      })
    );
  });

  // Active craving reference
  const currentCraving = useMemo(
    () => cravings.find((c) => c.id === activeCravingId) || cravings[0],
    [cravings, activeCravingId]
  );

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: cravings.length };
    for (const c of cravings) {
      counts[c.category] = (counts[c.category] || 0) + 1;
    }
    return counts;
  }, [cravings]);

  // Dynamic campus statistics
  const stats = useMemo(() => {
    const active = cravings.filter((c) => c.status === 'ACTIVE').length;
    const students = cravings.reduce((sum, c) => sum + c.count, 0);
    const unlocked = cravings.filter((c) => c.status === 'UNLOCKED' || c.count >= c.target).length;
    return {
      activeCravings: active,
      studentsParticipating: students,
      dealsUnlocked: unlocked,
    };
  }, [cravings]);

  // Filtered cravings
  const filteredCravings = useMemo(() => {
    return cravings.filter((craving) => {
      // 1. Category filter
      if (selectedCategory !== 'All' && craving.category !== selectedCategory) {
        return false;
      }

      // 2. Search query (matches restaurant, food, category, zone)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const searchable = `${craving.restaurant} ${craving.food} ${craving.category} ${craving.zone}`.toLowerCase();
        if (!searchable.includes(query)) {
          return false;
        }
      }

      // 3. Preset filters
      if (selectedFilter === 'almost_unlocked') {
        const progress = craving.count / craving.target;
        return progress >= 0.7 && craving.status === 'ACTIVE';
      }
      if (selectedFilter === 'ending_soon') {
        const remainingSeconds = Math.max(0, Math.floor((craving.expiresAt - now) / 1000));
        return remainingSeconds <= 12 * 60 && craving.status === 'ACTIVE';
      }
      if (selectedFilter === 'popular') {
        return craving.count >= 6;
      }
      if (selectedFilter === 'budget_friendly') {
        return craving.budgetPerPerson <= 160;
      }

      return true;
    });
  }, [cravings, selectedCategory, searchQuery, selectedFilter, now]);

  // Joined cravings count
  const joinedCount = useMemo(() => cravings.filter((c) => c.joined).length, [cravings]);

  // ===================== USER & ENGINE ACTIONS =====================

  const handleJoinCraving = (id: number) => {
    const targetCraving = cravings.find((c) => c.id === id);
    if (!targetCraving) return;

    if (targetCraving.status === 'EXPIRED') {
      setActiveCravingId(id);
      setExpiredModalOpen(true);
      return;
    }

    if (targetCraving.status === 'UNLOCKED') {
      setActiveCravingId(id);
      setCurrentView('deal');
      return;
    }

    const res = joinCravingPool(targetCraving);

    if (!res.success) {
      showToast(res.message || 'Cannot join this craving pool.', targetCraving.restaurant, 'info');
      setActiveCravingId(id);
      setCurrentView('live');
      return;
    }

    setCravings((prev) => prev.map((c) => (c.id === id ? res.craving : c)));
    setActiveCravingId(id);

    if (res.justUnlocked) {
      showToast(
        `🎉 Congratulations! You reached ${res.craving.target} students and unlocked: ${res.craving.deal}`,
        'Deal Unlocked!'
      );
      setCurrentView('deal');
    } else {
      showToast(
        `You joined ${res.craving.restaurant}! Just ${res.craving.target - res.craving.count} more needed for maximum reward.`,
        'Joined Craving Pool'
      );
      setCurrentView('live');
    }
  };

  const handleLeaveCraving = (id: number) => {
    const targetCraving = cravings.find((c) => c.id === id);
    if (!targetCraving) return;

    const res = leaveCravingPool(targetCraving);
    if (!res.success) {
      showToast(res.message || 'Could not leave craving pool.', undefined, 'warning');
      return;
    }

    setCravings((prev) => prev.map((c) => (c.id === id ? res.craving : c)));
    setExpiredModalOpen(false);
    showToast('You left the craving pool.', undefined, 'info');
    setCurrentView('feed');
  };

  // ===================== JUDGE DEMO MODE CONTROLS =====================

  const handleDemoSimulateCount = (countToAdd: number) => {
    const res = simulateStudentsJoining(currentCraving, countToAdd);
    if (!res.success) {
      showToast(res.message || 'Simulation failed', undefined, 'warning');
      return;
    }

    setCravings((prev) => prev.map((c) => (c.id === currentCraving.id ? res.craving : c)));

    if (res.justUnlocked) {
      showToast(`Goal reached! Collective deal unlocked for ${res.craving.restaurant}!`, 'Deal Unlocked! 🚀');
    } else {
      showToast(`Simulated +${countToAdd} students joining ${res.craving.restaurant}!`, 'Demo Simulation');
    }
  };

  const handleDemoAdvanceTier = () => {
    const res = advanceToNextTier(currentCraving);
    if (!res.success) {
      showToast(res.message || 'Could not advance tier.', undefined, 'info');
      return;
    }
    setCravings((prev) => prev.map((c) => (c.id === currentCraving.id ? res.craving : c)));
    showToast(`Advanced ${res.craving.restaurant} to next reward tier!`, 'Tier Milestone Reached 🏆');
  };

  const handleDemoForceUnlock = () => {
    const res = forceInstantUnlock(currentCraving);
    if (!res.success) {
      showToast(res.message || 'Could not unlock.', undefined, 'info');
      return;
    }
    setCravings((prev) => prev.map((c) => (c.id === currentCraving.id ? res.craving : c)));
    showToast(`Instantly unlocked collective reward for ${res.craving.restaurant}!`, 'Judge Override: Deal Unlocked 🎉');
  };

  const handleDemoForceExpire = () => {
    const res = forceInstantExpiration(currentCraving);
    if (!res.success) {
      showToast(res.message || 'Could not expire deal.', undefined, 'warning');
      return;
    }
    setCravings((prev) => prev.map((c) => (c.id === currentCraving.id ? res.craving : c)));
    setExpiredModalOpen(true);
    showToast(`Window forced to expired for ${res.craving.restaurant}.`, 'Judge Override: Craving Expired', 'warning');
  };

  const handleDemoResetCraving = () => {
    const initial = INITIAL_CRAVINGS.find((c) => c.id === currentCraving.id) || INITIAL_CRAVINGS[0];
    const resetOne: Craving = {
      ...initial,
      createdAt: Date.now() - 5 * 60 * 1000,
      expiresAt: Date.now() + 10 * 60 * 1000,
      status: 'ACTIVE',
    };
    setCravings((prev) => prev.map((c) => (c.id === currentCraving.id ? resetOne : c)));
    setExpiredModalOpen(false);
    showToast(`Reset ${currentCraving.restaurant} back to demo state.`, 'Craving Reset');
  };

  // ===================== CREATION & MATCHING =====================

  const handleCheckAndCreate = (input: CravingInput) => {
    const matches = findCompatibleCravings(input, cravings);

    if (matches.length > 0) {
      setPendingCravingInput(input);
      setSmartMatches(matches);
      setCreateCravingOpen(false);
      setSmartMatchOpen(true);
    } else {
      createNewPoolDirectly(input);
    }
  };

  const createNewPoolDirectly = (input: CravingInput) => {
    const categoryImageMap: Record<string, string> = {
      Burgers: FOOD_IMAGES.burger,
      Pizza: FOOD_IMAGES.pizza,
      Momos: FOOD_IMAGES.momo,
      Biryani: FOOD_IMAGES.biryani,
      Chinese: FOOD_IMAGES.chinese,
      Snacks: FOOD_IMAGES.snacks,
      Desserts: FOOD_IMAGES.dessert,
      Healthy: FOOD_IMAGES.healthy,
    };

    const newCreatedAt = Date.now();
    const newExpiresAt = newCreatedAt + 20 * 60 * 1000; // 20 mins countdown
    const tiers = generateDefaultTiers(input.target, input.restaurant);

    const newCraving: Craving = {
      id: Date.now(),
      restaurant: input.restaurant,
      normalizedRestaurant: input.restaurant.toLowerCase(),
      food: input.food,
      category: input.category,
      campus: input.campus,
      zone: input.zone,
      timeWindow: input.timeWindow,
      count: 1,
      target: input.target,
      deal: 'Tier 3: 25% OFF Campus Group Unlock + Free Add-on',
      dealDiscount: 40,
      priceRange: `₹${input.budget - 30} - ₹${input.budget + 60}`,
      budgetPerPerson: input.budget,
      image: categoryImageMap[input.category] || FOOD_IMAGES.burger,
      deadlineMinutes: 20,
      status: 'ACTIVE',
      tiers,
      currentTierId: null,
      createdAt: newCreatedAt,
      expiresAt: newExpiresAt,
      joined: true,
      isUserCreated: true,
      participants: [
        {
          id: DEMO_USER_ID,
          name: 'Aastha Sharma (You)',
          initial: 'AS',
          avatarBg: 'bg-brand-500 text-white font-bold',
          role: 'Host',
          joinedAt: newCreatedAt,
        },
      ],
      menu: [
        { id: 'm-new-1', name: `${input.restaurant} Signature Combo`, price: input.budget + 20, desc: input.food, isVeg: false, popular: true },
        { id: 'm-new-2', name: 'Chef Special Plate', price: input.budget - 10, desc: 'Freshly prepared specialty dish with sides', isVeg: true },
        { id: 'm-new-3', name: 'Crispy Snack & Beverage', price: 99, desc: 'Crispy campus snack with chilled soft beverage', isVeg: true },
      ],
    };

    setCravings((prev) => [newCraving, ...prev]);
    setActiveCravingId(newCraving.id);
    setCreateCravingOpen(false);
    setSmartMatchOpen(false);
    setPendingCravingInput(null);
    setCurrentView('live');

    showToast(
      `Your craving for ${input.restaurant} is live! Students in ${input.zone} can now join.`,
      'Craving Pool Created'
    );
  };

  const handleJoinFromMatch = (cravingId: number) => {
    setSmartMatchOpen(false);
    setPendingCravingInput(null);
    handleJoinCraving(cravingId);
  };

  const handleProceedToCheckout = (items: OrderItem[], itemTotal: number, discount: number) => {
    setCheckoutData({ items, itemTotal, discount, isRegularPriceFallback: false });
    setCurrentView('checkout');
  };

  const handleOrderConfirmed = (order: PlacedOrder) => {
    setPlacedOrders((prev) => [order, ...prev]);
    setActiveOrder(order);
    setCurrentView('success');
    showToast('Your individual order has been registered!', 'Order Placed');
  };

  // Option B: Regular Price Fallback Checkout Handler
  const handleRegularPriceFallbackOrder = (expiredCraving: Craving) => {
    setExpiredModalOpen(false);
    const defaultItem = expiredCraving.menu[0];
    const items: OrderItem[] = [
      { id: defaultItem.id, name: defaultItem.name, price: defaultItem.price, quantity: 1 },
    ];
    setCheckoutData({
      items,
      itemTotal: defaultItem.price,
      discount: 0,
      isRegularPriceFallback: true,
    });
    setActiveCravingId(expiredCraving.id);
    setCurrentView('checkout');
    showToast('Proceeding with regular price order (no collective discount applied).', undefined, 'info');
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col selection:bg-brand-100 selection:text-brand-900">
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => setCurrentView(v)}
        selectedCampus={selectedCampus}
        selectedZone={selectedZone}
        onOpenCampusModal={() => setCampusModalOpen(true)}
        onOpenCreateCraving={() => setCreateCravingOpen(true)}
        joinedCount={joinedCount}
        ordersCount={placedOrders.length}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* VIEW: FEED */}
        {currentView === 'feed' && (
          <div className="animate-fade-in">
            {/* Impactful Hero Section */}
            <Hero
              campusName={selectedCampus.name}
              stats={stats}
              onExploreClick={() => {
                document.getElementById('cravings-feed')?.scrollIntoView({ behavior: 'smooth' });
              }}
              onStartCravingClick={() => setCreateCravingOpen(true)}
            />

            {/* Section Header */}
            <div id="cravings-feed" className="scroll-mt-24 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2">
                <div>
                  <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-brand-600 mb-1">
                    <Flame className="w-4 h-4 fill-brand-500" />
                    <span>Live Collective Pools</span>
                  </div>
                  <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-charcoal-900 tracking-tight">
                    What's your campus craving?
                  </h2>
                  <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
                    Join an active pool to unlock deals together. You still order and pay individually.
                  </p>
                </div>

                <button
                  onClick={() => setCreateCravingOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-50 text-brand-600 hover:text-brand-700 font-bold text-xs border border-brand-200 shadow-xs transition-all hover:border-brand-400 self-start sm:self-end"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start a Craving</span>
                </button>
              </div>
            </div>

            {/* Category Selector Bar */}
            <CategoryBar
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => setSelectedCategory(cat)}
              categoryCounts={categoryCounts}
            />

            {/* Search and Filter Row */}
            <FilterRow
              searchQuery={searchQuery}
              onSearchChange={(q) => setSearchQuery(q)}
              selectedFilter={selectedFilter}
              onSelectFilter={(f) => setSelectedFilter(f)}
              totalResults={filteredCravings.length}
            />

            {/* Craving Cards Grid */}
            {filteredCravings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {filteredCravings.map((craving) => (
                  <CravingCard
                    key={craving.id}
                    craving={craving}
                    now={now}
                    onJoin={(id) => handleJoinCraving(id)}
                    onCardClick={(id) => {
                      setActiveCravingId(id);
                      if (craving.status === 'EXPIRED') {
                        setExpiredModalOpen(true);
                      } else if (craving.status === 'UNLOCKED' && craving.joined) {
                        setCurrentView('deal');
                      } else {
                        setCurrentView('live');
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              /* Empty Search / Filter State */
              <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-12 text-center space-y-4 shadow-card">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                  <Compass className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display font-extrabold text-lg text-charcoal-900">
                    No active cravings match your criteria
                  </h3>
                  <p className="text-xs text-charcoal-500 max-w-sm mx-auto">
                    Try clearing your search query or switching filters to see other active campus pools.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('All');
                      setSelectedFilter('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-charcoal-800 font-bold text-xs transition-colors"
                  >
                    Reset Filters
                  </button>
                  <button
                    onClick={() => setCreateCravingOpen(true)}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Start this Craving Yourself
                  </button>
                </div>
              </div>
            )}

            {/* How It Works Explainer Strip */}
            <div className="mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-stone-200 shadow-card">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 text-center mb-1">
                HOW CAMPUS CRAVE WORKS
              </div>
              <h3 className="font-display font-extrabold text-xl text-charcoal-900 text-center mb-6">
                Never order alone to pay more.
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-2xl bg-cream-50 border border-brand-100/60 flex flex-col justify-between space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-500 text-white font-display font-extrabold text-xs flex items-center justify-center">
                    01
                  </span>
                  <h4 className="font-bold text-sm text-charcoal-900">Find or Start a Craving</h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Spot what other students in your hostel or academic block are craving tonight.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-cream-50 border border-brand-100/60 flex flex-col justify-between space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-500 text-white font-display font-extrabold text-xs flex items-center justify-center">
                    02
                  </span>
                  <h4 className="font-bold text-sm text-charcoal-900">Unlock Collective Deals</h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    As more students join the pool, restaurant discounts and free extras automatically unlock!
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-cream-50 border border-brand-100/60 flex flex-col justify-between space-y-2">
                  <span className="w-7 h-7 rounded-lg bg-brand-500 text-white font-display font-extrabold text-xs flex items-center justify-center">
                    03
                  </span>
                  <h4 className="font-bold text-sm text-charcoal-900">Order & Pay Individually</h4>
                  <p className="text-xs text-charcoal-600 leading-relaxed">
                    Pick your own items and checkout on your own. No splitting bills or collecting UPI payments.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: LIVE CRAVING */}
        {currentView === 'live' && (
          <LiveCravingView
            craving={currentCraving}
            now={now}
            onBack={() => setCurrentView('feed')}
            onSimulateJoin={(id) => handleDemoSimulateCount(1)}
            onLeave={(id) => handleLeaveCraving(id)}
            onClaimDeal={(id) => {
              setActiveCravingId(id);
              setCurrentView('deal');
            }}
            onOrderRegularPriceFallback={handleRegularPriceFallbackOrder}
          />
        )}

        {/* VIEW: UNLOCKED DEAL */}
        {currentView === 'deal' && (
          <UnlockedDealView
            craving={currentCraving}
            onBack={() => setCurrentView('live')}
            onProceedToCheckout={handleProceedToCheckout}
          />
        )}

        {/* VIEW: CHECKOUT */}
        {currentView === 'checkout' && checkoutData && (
          <CheckoutView
            craving={currentCraving}
            items={checkoutData.items}
            itemTotal={checkoutData.itemTotal}
            discount={checkoutData.discount}
            isRegularPriceFallback={checkoutData.isRegularPriceFallback}
            onBack={() => setCurrentView('deal')}
            onOrderPlaced={handleOrderConfirmed}
          />
        )}

        {/* VIEW: ORDER SUCCESS */}
        {currentView === 'success' && activeOrder && (
          <OrderSuccessView
            order={activeOrder}
            onGoToFeed={() => setCurrentView('feed')}
            onViewOrders={() => setCurrentView('orders')}
          />
        )}

        {/* VIEW: MY CRAVINGS */}
        {currentView === 'my-cravings' && (
          <MyCravingsView
            cravings={cravings}
            onSelectCraving={(id) => {
              setActiveCravingId(id);
              const target = cravings.find((c) => c.id === id);
              if (target?.status === 'EXPIRED') {
                setExpiredModalOpen(true);
              } else if (target?.status === 'UNLOCKED') {
                setCurrentView('deal');
              } else {
                setCurrentView('live');
              }
            }}
            onExploreClick={() => setCurrentView('feed')}
          />
        )}

        {/* VIEW: ORDERS */}
        {currentView === 'orders' && (
          <OrdersView
            orders={placedOrders}
            onExploreClick={() => setCurrentView('feed')}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500 text-white font-extrabold flex items-center justify-center text-xs">
              C
            </div>
            <span className="font-bold text-charcoal-900">Campus Crave</span>
            <span>— Your campus. Your cravings. Better deals together.</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Phase 3 Live Deal Engine Active · Client-side prototype simulation
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setCurrentView('feed')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-colors ${
            currentView === 'feed' ? 'text-brand-600' : 'text-charcoal-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setCurrentView('my-cravings')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-colors relative ${
            currentView === 'my-cravings' || currentView === 'live' ? 'text-brand-600' : 'text-charcoal-500'
          }`}
        >
          <Flame className="w-5 h-5" />
          <span>My Cravings</span>
          {joinedCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-brand-500 text-white text-[9px] font-bold flex items-center justify-center absolute top-0 right-2">
              {joinedCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setCreateCravingOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold text-brand-600"
        >
          <div className="w-8 h-8 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/30 -mt-3">
            <Plus className="w-5 h-5" />
          </div>
          <span>Create</span>
        </button>

        <button
          onClick={() => setCurrentView('orders')}
          className={`flex flex-col items-center gap-1 py-1 px-3 text-[10px] font-bold transition-colors ${
            currentView === 'orders' || currentView === 'checkout' || currentView === 'success'
              ? 'text-brand-600'
              : 'text-charcoal-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span>Orders</span>
        </button>
      </nav>

      {/* Judge Demo Mode Floating Controls Panel */}
      <DemoControlPanel
        activeCraving={currentCraving}
        onSimulateCount={handleDemoSimulateCount}
        onAdvanceTier={handleDemoAdvanceTier}
        onForceUnlock={handleDemoForceUnlock}
        onForceExpire={handleDemoForceExpire}
        onReset={handleDemoResetCraving}
        isDemoMode={isDemoMode}
        onToggleDemoMode={() => setIsDemoMode(!isDemoMode)}
      />

      {/* Campus Location Switcher Modal */}
      <CampusSelectorModal
        isOpen={campusModalOpen}
        onClose={() => setCampusModalOpen(false)}
        selectedCampus={selectedCampus}
        selectedZone={selectedZone}
        onSelect={(campus, zone) => {
          setSelectedCampus(campus);
          setSelectedZone(zone);
          showToast(`Switched campus to ${campus.name}`, undefined, 'info');
        }}
      />

      {/* Create Craving Modal */}
      <CreateCravingModal
        isOpen={createCravingOpen}
        onClose={() => setCreateCravingOpen(false)}
        selectedCampus={selectedCampus}
        selectedZone={selectedZone}
        onSubmit={handleCheckAndCreate}
      />

      {/* Smart Match Modal */}
      <SmartMatchModal
        isOpen={smartMatchOpen}
        onClose={() => setSmartMatchOpen(false)}
        matches={smartMatches}
        onJoinMatch={handleJoinFromMatch}
        onCreateAnyway={() => {
          if (pendingCravingInput) {
            createNewPoolDirectly(pendingCravingInput);
          }
        }}
      />

      {/* Deal Expired Failure Experience Modal */}
      <DealExpiredModal
        isOpen={expiredModalOpen}
        onClose={() => setExpiredModalOpen(false)}
        craving={currentCraving}
        onFindAnother={() => {
          setExpiredModalOpen(false);
          setCurrentView('feed');
        }}
        onOrderRegularPrice={() => handleRegularPriceFallbackOrder(currentCraving)}
        onLeaveCraving={() => handleLeaveCraving(currentCraving.id)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
