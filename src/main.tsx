import React, { useMemo, useState } from 'react';
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
import { Toast, ToastMessage } from './components/Toast';

export function App() {
  // Navigation & View state
  const [currentView, setCurrentView] = useState<
    'feed' | 'live' | 'deal' | 'checkout' | 'success' | 'my-cravings' | 'orders'
  >('feed');

  // Campus location state
  const [selectedCampus, setSelectedCampus] = useState(CAMPUSES[0]);
  const [selectedZone, setSelectedZone] = useState(CAMPUSES[0].zones[0]);

  // Cravings and order state
  const [cravings, setCravings] = useState<Craving[]>(INITIAL_CRAVINGS);
  const [activeCravingId, setActiveCravingId] = useState<number>(1);
  const [placedOrders, setPlacedOrders] = useState<PlacedOrder[]>([]);
  const [activeOrder, setActiveOrder] = useState<PlacedOrder | null>(null);

  // Checkout intermediate state
  const [checkoutData, setCheckoutData] = useState<{
    items: OrderItem[];
    itemTotal: number;
    discount: number;
  } | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('All');
  const [selectedFilter, setSelectedFilter] = useState<FilterPreset>('all');

  // Modal states
  const [campusModalOpen, setCampusModalOpen] = useState(false);
  const [createCravingOpen, setCreateCravingOpen] = useState(false);
  const [smartMatchOpen, setSmartMatchOpen] = useState(false);
  const [smartMatches, setSmartMatches] = useState<MatchScoreBreakdown[]>([]);
  const [pendingCravingInput, setPendingCravingInput] = useState<CravingInput | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, title?: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ id: Date.now().toString(), message, title, type });
  };

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
    const unlocked = cravings.filter((c) => c.count >= c.target || c.status === 'DEAL_UNLOCKED').length;
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
        return craving.count >= craving.target - 2 && craving.count < craving.target;
      }
      if (selectedFilter === 'ending_soon') {
        return craving.deadlineMinutes <= 12;
      }
      if (selectedFilter === 'popular') {
        return craving.count >= 7;
      }
      if (selectedFilter === 'budget_friendly') {
        return craving.budgetPerPerson <= 160;
      }

      return true;
    });
  }, [cravings, selectedCategory, searchQuery, selectedFilter]);

  // Joined cravings count
  const joinedCount = useMemo(() => cravings.filter((c) => c.joined).length, [cravings]);

  // ===================== USER ACTIONS =====================

  const handleJoinCraving = (id: number) => {
    const targetCraving = cravings.find((c) => c.id === id);
    if (!targetCraving) return;

    if (targetCraving.joined) {
      showToast('You are already part of this craving pool!', targetCraving.restaurant, 'info');
      setActiveCravingId(id);
      setCurrentView('live');
      return;
    }

    if (targetCraving.count >= targetCraving.target) {
      showToast('This pool has reached capacity and unlocked!', targetCraving.restaurant, 'info');
      setActiveCravingId(id);
      setCurrentView('deal');
      return;
    }

    const nextCount = targetCraving.count + 1;
    const willUnlock = nextCount >= targetCraving.target;

    setCravings((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return {
          ...c,
          count: nextCount,
          joined: true,
          status: willUnlock ? 'DEAL_UNLOCKED' : c.status,
          participants: [
            ...c.participants,
            {
              id: 'user-aastha',
              name: 'Aastha Sharma (You)',
              initial: 'AS',
              avatarBg: 'bg-brand-500 text-white font-bold',
              role: 'You',
            },
          ],
        };
      })
    );

    setActiveCravingId(id);

    if (willUnlock) {
      showToast(
        `🎉 Congratulations! You reached ${targetCraving.target} students and unlocked: ${targetCraving.deal}`,
        'Deal Unlocked!'
      );
      setCurrentView('deal');
    } else {
      showToast(
        `You joined ${targetCraving.restaurant}! Just ${targetCraving.target - nextCount} more needed.`,
        'Joined Craving Pool'
      );
      setCurrentView('live');
    }
  };

  const handleLeaveCraving = (id: number) => {
    setCravings((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const newCount = Math.max(0, c.count - 1);
        return {
          ...c,
          count: newCount,
          joined: false,
          status: newCount < c.target ? 'ACTIVE' : c.status,
          participants: c.participants.filter((p) => p.id !== 'user-aastha'),
        };
      })
    );

    showToast('You left the craving pool.', undefined, 'info');
    setCurrentView('feed');
  };

  const handleSimulateStudentJoin = (id: number) => {
    const names = [
      { name: 'Devansh Kapoor', initial: 'DK', bg: 'bg-teal-100 text-teal-800' },
      { name: 'Ananya Mishra', initial: 'AM', bg: 'bg-purple-100 text-purple-800' },
      { name: 'Rishabh Saini', initial: 'RS', bg: 'bg-blue-100 text-blue-800' },
      { name: 'Natasha Varma', initial: 'NV', bg: 'bg-rose-100 text-rose-800' },
    ];
    const pick = names[Math.floor(Math.random() * names.length)];

    let unlockedNow = false;

    setCravings((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        if (c.count >= c.target) return c;

        const nextCount = c.count + 1;
        unlockedNow = nextCount >= c.target;

        return {
          ...c,
          count: nextCount,
          status: unlockedNow ? 'DEAL_UNLOCKED' : c.status,
          participants: [
            ...c.participants,
            {
              id: `sim-${Date.now()}`,
              name: pick.name,
              initial: pick.initial,
              avatarBg: pick.bg,
            },
          ],
        };
      })
    );

    if (unlockedNow) {
      showToast(
        'Goal reached! The collective restaurant deal is now unlocked!',
        'Deal Unlocked Today! 🚀'
      );
    } else {
      showToast(`${pick.name} joined this campus craving!`, 'New Craver Joined');
    }
  };

  // Craving creation & smart matching engine flow
  const handleCheckAndCreate = (input: CravingInput) => {
    const matches = findCompatibleCravings(input, cravings);

    if (matches.length > 0) {
      // Found matching pools! Show Smart Match Screen
      setPendingCravingInput(input);
      setSmartMatches(matches);
      setCreateCravingOpen(false);
      setSmartMatchOpen(true);
    } else {
      // No existing match -> create new pool directly
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
      deal: '20% OFF Campus Group Unlock + Free Add-on',
      dealDiscount: 40,
      priceRange: `₹${input.budget - 30} - ₹${input.budget + 60}`,
      budgetPerPerson: input.budget,
      image: categoryImageMap[input.category] || FOOD_IMAGES.burger,
      deadlineMinutes: 25,
      status: 'ACTIVE',
      joined: true,
      isUserCreated: true,
      participants: [
        {
          id: 'user-aastha',
          name: 'Aastha Sharma (You)',
          initial: 'AS',
          avatarBg: 'bg-brand-500 text-white font-bold',
          role: 'Host',
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
    setCheckoutData({ items, itemTotal, discount });
    setCurrentView('checkout');
  };

  const handleOrderConfirmed = (order: PlacedOrder) => {
    setPlacedOrders((prev) => [order, ...prev]);
    setActiveOrder(order);
    setCurrentView('success');
    showToast('Your individual order has been registered!', 'Order Placed');
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
                    onJoin={(id) => handleJoinCraving(id)}
                    onCardClick={(id) => {
                      setActiveCravingId(id);
                      if (craving.status === 'DEAL_UNLOCKED' && craving.joined) {
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
            onBack={() => setCurrentView('feed')}
            onSimulateJoin={(id) => handleSimulateStudentJoin(id)}
            onLeave={(id) => handleLeaveCraving(id)}
            onClaimDeal={(id) => {
              setActiveCravingId(id);
              setCurrentView('deal');
            }}
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
              if (target?.status === 'DEAL_UNLOCKED') {
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
      <footer className="border-t border-stone-200 bg-white py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-charcoal-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500 text-white font-extrabold flex items-center justify-center text-xs">
              C
            </div>
            <span className="font-bold text-charcoal-900">Campus Crave</span>
            <span>— Your campus. Your cravings. Better deals together.</span>
          </div>
          <div className="text-[11px] text-stone-400">
            Prototype demo · Not affiliated with Swiggy · Pure client-side simulation
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around shadow-lg">
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
