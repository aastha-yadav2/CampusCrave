import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import type { Craving, DealTier, Participant } from '../../types/index.ts';
import {
  canJoinDeal,
  canLeaveDeal,
  transitionCraving,
  isValidTransition,
} from '../dealLifecycle.ts';
import {
  calculateTierProgress,
  calculateOrderDiscount,
  getAchievedReward,
  getMinimumUnlockThreshold,
  generateDefaultTiers,
} from '../dealTiers.ts';
import {
  joinCravingPool,
  leaveCravingPool,
  simulateStudentsJoining,
  advanceToNextTier,
  forceInstantUnlock,
  forceInstantExpiration,
  evaluateCravingExpiry,
  DEMO_USER_ID,
  DEMO_USER_NAME,
} from '../dealEngine.ts';
import {
  calculateRemainingSeconds,
  formatCountdown,
  getCountdownStatus,
} from '../countdown.ts';
import {
  loadStoredCravings,
  saveStoredCravings,
  loadStoredOrders,
  saveStoredOrders,
  clearAndResetStorage,
} from '../storage.ts';

// Mock localStorage for Node.js test environment
const memoryStore = new Map<string, string>();
const mockLocalStorage = {
  getItem(key: string): string | null {
    return memoryStore.get(key) ?? null;
  },
  setItem(key: string, value: string): void {
    memoryStore.set(key, String(value));
  },
  removeItem(key: string): void {
    memoryStore.delete(key);
  },
  clear(): void {
    memoryStore.clear();
  },
  key(index: number): string | null {
    return Array.from(memoryStore.keys())[index] ?? null;
  },
  get length(): number {
    return memoryStore.size;
  },
};

if (typeof (globalThis as any).localStorage === 'undefined') {
  (globalThis as any).localStorage = mockLocalStorage;
}

// Helper mock craving factory
function createMockCraving(overrides?: Partial<Craving>): Craving {
  const now = Date.now();
  const tiers: DealTier[] = [
    {
      id: 't-1',
      tierNumber: 1,
      participantsRequired: 3,
      rewardType: 'discount',
      discountType: 'percent',
      rewardValue: 15,
      title: 'Tier 1: 15% OFF',
      description: '15% discount at 3 students',
    },
    {
      id: 't-2',
      tierNumber: 2,
      participantsRequired: 5,
      rewardType: 'discount',
      discountType: 'percent',
      rewardValue: 20,
      title: 'Tier 2: 20% OFF',
      description: '20% discount at 5 students',
    },
    {
      id: 't-3',
      tierNumber: 3,
      participantsRequired: 8,
      rewardType: 'free_item',
      discountType: 'percent',
      rewardValue: 0,
      title: 'Tier 3: Free Sides Platter',
      description: 'Free sides platter at 8 students',
    },
  ];

  const participants: Participant[] = [
    { id: 'p1', name: 'User 1', initial: 'U1', avatarBg: 'bg-stone-100 text-stone-800' },
    { id: 'p2', name: 'User 2', initial: 'U2', avatarBg: 'bg-stone-100 text-stone-800' },
  ];

  return {
    id: 101,
    restaurant: 'Burger Barn',
    normalizedRestaurant: 'burger barn',
    food: 'Smash burgers & waffle fries',
    category: 'Burgers',
    campus: 'SRHU Campus, Dehradun',
    zone: 'Hostel Block A',
    timeWindow: 'Tonight · 9:00 PM',
    count: participants.length,
    target: 8,
    deal: 'Tier 3: Free Sides Platter',
    dealDiscount: 0,
    priceRange: '₹150 - ₹250',
    budgetPerPerson: 180,
    image: 'https://example.com/burger.jpg',
    deadlineMinutes: 15,
    status: 'ACTIVE',
    tiers,
    currentTierId: null,
    createdAt: now - 5 * 60 * 1000,
    expiresAt: now + 15 * 60 * 1000,
    joined: false,
    participants,
    menu: [
      { id: 'm1', name: 'Classic Burger', price: 180, desc: 'Smash patty', isVeg: false },
      { id: 'm2', name: 'Crispy Fries', price: 90, desc: 'Golden fries', isVeg: true },
    ],
    ...overrides,
  };
}

describe('Campus Crave — Engine Audit & Phase 3.2 Hardening Suite', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  // ==========================================
  // SECTION 1: REWARD INTEGRITY & CALCULATIONS
  // ==========================================
  describe('1. Reward Integrity & Calculations', () => {
    test('Unlocked deal with no achieved tier returns strictly 0 discount (no arbitrary 15% fallback)', () => {
      // Pool unlocked at target 2, but tiers require 4, 6, 8
      const craving = createMockCraving({
        status: 'UNLOCKED',
        count: 2,
        target: 2,
        tiers: [
          {
            id: 't-high',
            tierNumber: 1,
            participantsRequired: 4,
            rewardType: 'discount',
            discountType: 'percent',
            rewardValue: 20,
            title: 'Tier 1: 20% OFF',
            description: 'Requires 4 students',
          },
        ],
      });

      const discount = calculateOrderDiscount(craving, 200);
      assert.equal(discount, 0, 'Must return strictly 0 discount when no tier is met');

      const achieved = getAchievedReward(craving, 200);
      assert.equal(achieved.discountAmount, 0);
      assert.equal(achieved.currentTier, null);
    });

    test('Percentage discount calculation is non-negative and capped at item total', () => {
      const craving = createMockCraving({
        count: 5, // Achieved Tier 2 (20% OFF)
      });

      // 20% of 250 is 50
      assert.equal(calculateOrderDiscount(craving, 250), 50);

      // Total 0 returns 0
      assert.equal(calculateOrderDiscount(craving, 0), 0);

      // Negative total returns 0
      assert.equal(calculateOrderDiscount(craving, -50), 0);

      // Tier with 150% discount capped at itemTotal
      const overTierCraving = createMockCraving({
        count: 3,
        tiers: [
          {
            id: 't-over',
            tierNumber: 1,
            participantsRequired: 3,
            rewardType: 'discount',
            discountType: 'percent',
            rewardValue: 150,
            title: 'Super discount',
            description: '150% off',
          },
        ],
      });
      assert.equal(calculateOrderDiscount(overTierCraving, 100), 100);
    });

    test('Fixed discount calculation is capped at item total', () => {
      const fixedCraving = createMockCraving({
        count: 3,
        tiers: [
          {
            id: 'fix-1',
            tierNumber: 1,
            participantsRequired: 3,
            rewardType: 'discount',
            discountType: 'fixed',
            rewardValue: 80,
            title: 'Tier 1: ₹80 OFF',
            description: 'Flat ₹80 off',
          },
        ],
      });

      // Order total ₹200 -> discount ₹80
      assert.equal(calculateOrderDiscount(fixedCraving, 200), 80);

      // Order total ₹50 -> discount capped at ₹50 (cannot exceed subtotal)
      assert.equal(calculateOrderDiscount(fixedCraving, 50), 50);
    });

    test('Free-item reward provides 0 monetary discount and returns complimentary description', () => {
      const freeItemCraving = createMockCraving({
        count: 8, // Achieved Tier 3 (Free Sides Platter, rewardType: free_item)
      });

      // Strict rule: Free-item reward gives 0 monetary discount on food subtotal
      const discount = calculateOrderDiscount(freeItemCraving, 200);
      assert.equal(discount, 0);

      const reward = getAchievedReward(freeItemCraving, 200);
      assert.equal(reward.rewardType, 'free_item');
      assert.equal(reward.discountAmount, 0);
      assert.equal(reward.freeItemDescription, 'Tier 3: Free Sides Platter');
    });

    test('Expired and cancelled deals return 0 discount at checkout', () => {
      const expiredCraving = createMockCraving({
        count: 5,
        status: 'EXPIRED',
      });
      assert.equal(calculateOrderDiscount(expiredCraving, 200), 0);

      const rewardExpired = getAchievedReward(expiredCraving, 200);
      assert.equal(rewardExpired.discountAmount, 0);
      assert.equal(rewardExpired.rewardType, 'none');

      const cancelledCraving = createMockCraving({
        count: 5,
        status: 'CANCELLED',
      });
      assert.equal(calculateOrderDiscount(cancelledCraving, 200), 0);
    });

    test('Single source of truth: getAchievedReward and calculateOrderDiscount agree', () => {
      const craving = createMockCraving({ count: 5 }); // Tier 2 (20% OFF)
      const orderTotal = 300;

      const directDiscount = calculateOrderDiscount(craving, orderTotal);
      const achieved = getAchievedReward(craving, orderTotal);

      assert.equal(directDiscount, 60);
      assert.equal(achieved.discountAmount, directDiscount);
      assert.equal(achieved.currentTier?.id, 't-2');
    });

    test('Backwards compatibility for legacy tiers without explicit discountType', () => {
      const legacyCraving = createMockCraving({
        count: 4,
        tiers: [
          {
            id: 'legacy-1',
            tierNumber: 1,
            participantsRequired: 4,
            rewardType: 'discount',
            rewardValue: 25, // percentage without discountType specified
            title: 'Legacy 25% Off',
            description: '25% off meal',
          } as DealTier,
        ],
      });

      // 25% of 200 = 50
      assert.equal(calculateOrderDiscount(legacyCraving, 200), 50);
    });
  });

  // ==========================================
  // SECTION 2: UNLOCK AND EXPIRY RULES
  // ==========================================
  describe('2. Unlock and Expiry Rules', () => {
    test('getMinimumUnlockThreshold returns lowest tier requirement or target', () => {
      const craving = createMockCraving();
      assert.equal(getMinimumUnlockThreshold(craving), 3); // Tier 1 requires 3

      const noTierCraving = createMockCraving({ tiers: [], target: 10 });
      assert.equal(getMinimumUnlockThreshold(noTierCraving), 10);
    });

    test('Deal reaching final target transitions to UNLOCKED without altering original expiresAt', () => {
      const expiresAt = Date.now() + 600000;
      let craving = createMockCraving({ target: 3, count: 2, expiresAt });

      const res = joinCravingPool(craving);
      assert.equal(res.success, true);
      assert.equal(res.craving.count, 3);
      assert.equal(res.craving.status, 'UNLOCKED');
      assert.ok(res.craving.unlockedAt);
      assert.equal(res.craving.expiresAt, expiresAt, 'Must not extend expiry timestamp');
    });

    test('Active deal expiring with count >= minimum threshold transitions to UNLOCKED', () => {
      const pastTime = Date.now() - 1000;
      // count is 3, which equals Tier 1 minimum threshold of 3, but target is 8
      const craving = createMockCraving({
        count: 3,
        participants: [
          { id: 'p1', name: 'U1', initial: '1', avatarBg: 'bg-stone-100' },
          { id: 'p2', name: 'U2', initial: '2', avatarBg: 'bg-stone-100' },
          { id: 'p3', name: 'U3', initial: '3', avatarBg: 'bg-stone-100' },
        ],
        target: 8,
        expiresAt: pastTime,
        status: 'ACTIVE',
      });

      const res = evaluateCravingExpiry(craving, Date.now());
      assert.equal(res.updated, true);
      assert.equal(res.transition, 'UNLOCKED');
      assert.equal(res.craving.status, 'UNLOCKED');
      assert.equal(res.craving.currentTierId, 't-1');
    });

    test('Active deal expiring with count < minimum threshold transitions to EXPIRED', () => {
      const pastTime = Date.now() - 1000;
      // count is 2, Tier 1 minimum threshold is 3
      const craving = createMockCraving({
        count: 2,
        expiresAt: pastTime,
        status: 'ACTIVE',
      });

      const res = evaluateCravingExpiry(craving, Date.now());
      assert.equal(res.updated, true);
      assert.equal(res.transition, 'EXPIRED');
      assert.equal(res.craving.status, 'EXPIRED');
    });

    test('Terminal states (UNLOCKED, EXPIRED, CANCELLED) remain terminal and reject repeat evaluation', () => {
      const now = Date.now();

      // UNLOCKED terminal check
      const unlockedCraving = createMockCraving({
        status: 'UNLOCKED',
        expiresAt: now - 5000,
      });
      const evalUnlocked = evaluateCravingExpiry(unlockedCraving, now);
      assert.equal(evalUnlocked.updated, false);
      assert.equal(evalUnlocked.craving.status, 'UNLOCKED');

      // EXPIRED terminal check
      const expiredCraving = createMockCraving({
        status: 'EXPIRED',
        expiresAt: now - 5000,
      });
      const evalExpired = evaluateCravingExpiry(expiredCraving, now);
      assert.equal(evalExpired.updated, false);
      assert.equal(evalExpired.craving.status, 'EXPIRED');

      // CANCELLED terminal check
      const cancelledCraving = createMockCraving({
        status: 'CANCELLED',
        expiresAt: now - 5000,
      });
      const evalCancelled = evaluateCravingExpiry(cancelledCraving, now);
      assert.equal(evalCancelled.updated, false);
      assert.equal(evalCancelled.craving.status, 'CANCELLED');
    });

    test('State transition guards prevent illegal transitions', () => {
      assert.equal(isValidTransition('UNLOCKED', 'ACTIVE'), false);
      assert.equal(isValidTransition('UNLOCKED', 'EXPIRED'), false);
      assert.equal(isValidTransition('EXPIRED', 'ACTIVE'), false);
      assert.equal(isValidTransition('EXPIRED', 'UNLOCKED'), false);
      assert.equal(isValidTransition('CANCELLED', 'ACTIVE'), false);
      assert.equal(isValidTransition('CANCELLED', 'UNLOCKED'), false);
      assert.equal(isValidTransition('ACTIVE', 'LOCKING'), true);
      assert.equal(isValidTransition('ACTIVE', 'CANCELLED'), true);
      assert.equal(isValidTransition('LOCKING', 'UNLOCKED'), true);
      assert.equal(isValidTransition('LOCKING', 'EXPIRED'), true);

      // transitionCraving properly routes ACTIVE -> UNLOCKED through LOCKING
      const active = createMockCraving({ status: 'ACTIVE' });
      const transition = transitionCraving(active, 'UNLOCKED');
      assert.equal(transition.success, true);
      assert.equal(transition.craving.status, 'UNLOCKED');
      assert.ok(transition.craving.lockedAt);
      assert.ok(transition.craving.unlockedAt);
    });
  });

  // ==========================================
  // SECTION 3: DEMO CONTROLS & PARTICIPANT PARITY
  // ==========================================
  describe('3. Demo Controls & Participant Parity', () => {
    test('Demo actions (+1, +3, next tier, force unlock, force expire) succeed on ACTIVE pools', () => {
      let craving = createMockCraving({ target: 6, count: 2 });

      // +1
      let res = simulateStudentsJoining(craving, 1);
      assert.equal(res.success, true);
      assert.equal(res.craving.count, 3);
      assert.equal(res.craving.count, res.craving.participants.length);

      // Next tier (target 5)
      res = advanceToNextTier(res.craving);
      assert.equal(res.success, true);
      assert.equal(res.craving.count, 5);
      assert.equal(res.craving.count, res.craving.participants.length);

      // Force Instant Unlock (fills to 6 and unlocks)
      res = forceInstantUnlock(res.craving);
      assert.equal(res.success, true);
      assert.equal(res.craving.count, 6);
      assert.equal(res.craving.status, 'UNLOCKED');
      assert.equal(res.craving.count, res.craving.participants.length);

      // Force instant expire on fresh active craving
      const freshActive = createMockCraving({ status: 'ACTIVE' });
      const expRes = forceInstantExpiration(freshActive);
      assert.equal(expRes.success, true);
      assert.equal(expRes.craving.status, 'EXPIRED');
    });

    test('forceInstantUnlock is rejected on LOCKING, EXPIRED, CANCELLED, and UNLOCKED states', () => {
      const locking = createMockCraving({ status: 'LOCKING' });
      const resLocking = forceInstantUnlock(locking);
      assert.equal(resLocking.success, false);
      assert.equal(resLocking.craving, locking);

      const expired = createMockCraving({ status: 'EXPIRED' });
      const resExpired = forceInstantUnlock(expired);
      assert.equal(resExpired.success, false);
      assert.equal(resExpired.craving, expired);

      const cancelled = createMockCraving({ status: 'CANCELLED' });
      const resCancelled = forceInstantUnlock(cancelled);
      assert.equal(resCancelled.success, false);
      assert.equal(resCancelled.craving, cancelled);

      const unlocked = createMockCraving({ status: 'UNLOCKED' });
      const resUnlocked = forceInstantUnlock(unlocked);
      assert.equal(resUnlocked.success, false);
      assert.equal(resUnlocked.craving, unlocked);
    });

    test('forceInstantExpiration is rejected on LOCKING, EXPIRED, CANCELLED, and UNLOCKED states', () => {
      const locking = createMockCraving({ status: 'LOCKING' });
      const resLocking = forceInstantExpiration(locking);
      assert.equal(resLocking.success, false);
      assert.equal(resLocking.craving, locking);

      const expired = createMockCraving({ status: 'EXPIRED' });
      const resExpired = forceInstantExpiration(expired);
      assert.equal(resExpired.success, false);
      assert.equal(resExpired.craving, expired);

      const cancelled = createMockCraving({ status: 'CANCELLED' });
      const resCancelled = forceInstantExpiration(cancelled);
      assert.equal(resCancelled.success, false);
      assert.equal(resCancelled.craving, cancelled);

      const unlocked = createMockCraving({ status: 'UNLOCKED' });
      const resUnlocked = forceInstantExpiration(unlocked);
      assert.equal(resUnlocked.success, false);
      assert.equal(resUnlocked.craving, unlocked);
    });

    test('Duplicate participant joins are strictly prevented', () => {
      const craving = createMockCraving();
      const firstJoin = joinCravingPool(craving);
      assert.equal(firstJoin.success, true);

      // Second join with same user ID
      const secondJoin = joinCravingPool(firstJoin.craving);
      assert.equal(secondJoin.success, false);
      assert.match(secondJoin.message || '', /already joined/i);
      assert.equal(secondJoin.craving.count, firstJoin.craving.count);
    });

    test('Participant count strictly equals participants.length across all actions', () => {
      let craving = createMockCraving();
      assert.equal(craving.count, craving.participants.length);

      craving = joinCravingPool(craving).craving;
      assert.equal(craving.count, craving.participants.length);

      craving = simulateStudentsJoining(craving, 3).craving;
      assert.equal(craving.count, craving.participants.length);

      craving = leaveCravingPool(craving, DEMO_USER_ID).craving;
      assert.equal(craving.count, craving.participants.length);
    });

    test('Leaving pool correctly updates participants and downgrades achieved tier', () => {
      let craving = createMockCraving({ count: 2 });
      craving = joinCravingPool(craving).craving; // count 3 -> Tier 1 achieved
      assert.equal(craving.count, 3);
      assert.equal(calculateTierProgress(craving).currentTier?.id, 't-1');

      // Leave -> count drops to 2 (below Tier 1 requirement)
      craving = leaveCravingPool(craving, DEMO_USER_ID).craving;
      assert.equal(craving.count, 2);
      assert.equal(craving.count, craving.participants.length);
      assert.equal(calculateTierProgress(craving).currentTier, null);
    });
  });

  // ==========================================
  // SECTION 4: COUNTDOWN & TIMERS
  // ==========================================
  describe('4. Countdown & Timers', () => {
    test('Countdown math does not drift or become negative', () => {
      const baseNow = 1700000000000;
      const expiresAt = baseNow + 125 * 1000; // 2m 05s

      const status = getCountdownStatus(expiresAt, baseNow);
      assert.equal(status.remainingSeconds, 125);
      assert.equal(status.formatted, '02:05');
      assert.equal(status.isExpired, false);
      assert.equal(status.isUrgent, false);

      // Urgent (< 2 mins)
      const urgentStatus = getCountdownStatus(baseNow + 90 * 1000, baseNow);
      assert.equal(urgentStatus.isUrgent, true);

      // Past expiry
      const pastStatus = getCountdownStatus(expiresAt, baseNow + 130 * 1000);
      assert.equal(pastStatus.remainingSeconds, 0);
      assert.equal(pastStatus.formatted, '00:00');
      assert.equal(pastStatus.isExpired, true);
    });

    test('formatCountdown formats mm:ss accurately', () => {
      assert.equal(formatCountdown(0), '00:00');
      assert.equal(formatCountdown(-10), '00:00');
      assert.equal(formatCountdown(59), '00:59');
      assert.equal(formatCountdown(60), '01:00');
      assert.equal(formatCountdown(605), '10:05');
    });
  });

  // ==========================================
  // SECTION 5: STORAGE PERSISTENCE & AUTO-REPAIR
  // ==========================================
  describe('5. Storage Persistence & Auto-Repair', () => {
    test('Valid cravings array persists and reloads accurately', () => {
      const mockList = [createMockCraving({ id: 991, restaurant: 'Campus Biryani' })];
      saveStoredCravings(mockList);

      const loaded = loadStoredCravings();
      assert.equal(loaded.length, 1);
      assert.equal(loaded[0].id, 991);
      assert.equal(loaded[0].restaurant, 'Campus Biryani');
    });

    test('Corrupted count parity is automatically repaired to participants.length on load', () => {
      const corruptedItem = createMockCraving({
        id: 992,
        count: 777, // Corrupted count
        participants: [
          { id: 'p1', name: 'U1', initial: '1', avatarBg: 'bg-stone-100' },
          { id: 'p2', name: 'U2', initial: '2', avatarBg: 'bg-stone-100' },
        ],
      });
      mockLocalStorage.setItem('campus_crave_live_cravings_v3', JSON.stringify([corruptedItem]));

      const loaded = loadStoredCravings();
      assert.equal(loaded[0].count, 2, 'Corrupted count must be repaired to participants.length');
      assert.equal(loaded[0].count, loaded[0].participants.length);
    });

    test('Malformed JSON gracefully falls back to initial cravings without throwing', () => {
      mockLocalStorage.setItem('campus_crave_live_cravings_v3', '{ invalid_json ::: broken');

      const loaded = loadStoredCravings();
      assert.ok(Array.isArray(loaded));
      assert.ok(loaded.length > 0, 'Falls back safely to initial cravings');
    });

    test('Invalid object shapes are ignored and filtered out', () => {
      const corruptData = [
        { invalid: 'random object' },
        null,
        12345,
        createMockCraving({ id: 993, restaurant: 'Valid Joint' }),
      ];
      mockLocalStorage.setItem('campus_crave_live_cravings_v3', JSON.stringify(corruptData));

      const loaded = loadStoredCravings();
      assert.equal(loaded.length, 1);
      assert.equal(loaded[0].id, 993);
      assert.equal(loaded[0].restaurant, 'Valid Joint');
    });

    test('Expired active timestamps are automatically evaluated and updated upon load', () => {
      const expiredItem = createMockCraving({
        id: 994,
        status: 'ACTIVE',
        expiresAt: Date.now() - 10000, // Passed timestamp
        count: 1, // Below minimum threshold
        participants: [{ id: 'p1', name: 'U1', initial: '1', avatarBg: 'bg-stone-100' }],
      });
      mockLocalStorage.setItem('campus_crave_live_cravings_v3', JSON.stringify([expiredItem]));

      const loaded = loadStoredCravings();
      assert.equal(loaded[0].status, 'EXPIRED', 'Must be evaluated to EXPIRED on load');
    });

    test('clearAndResetStorage cleans keys and restores INITIAL_CRAVINGS', () => {
      saveStoredCravings([createMockCraving({ id: 995 })]);
      saveStoredOrders([
        {
          orderId: 'CC-123456',
          cravingId: 995,
          restaurant: 'Test',
          zone: 'Hostel',
          items: [],
          itemTotal: 100,
          dealDiscount: 20,
          finalTotal: 80,
          isRegularPriceFallback: false,
          placedAt: 'Now',
          estimatedDelivery: '30m',
          status: 'ORDER_PLACED',
        },
      ]);

      assert.ok(mockLocalStorage.getItem('campus_crave_live_cravings_v3'));
      assert.ok(mockLocalStorage.getItem('campus_crave_placed_orders_v3'));

      const reset = clearAndResetStorage();
      assert.ok(Array.isArray(reset));
      assert.equal(mockLocalStorage.getItem('campus_crave_live_cravings_v3'), null);
      assert.equal(mockLocalStorage.getItem('campus_crave_placed_orders_v3'), null);
    });
  });
});
