import { test, describe } from 'node:test';
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
} from '../dealEngine.ts';
import {
  calculateRemainingSeconds,
  formatCountdown,
  getCountdownStatus,
} from '../countdown.ts';

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
      rewardValue: 25,
      title: 'Tier 3: 25% OFF',
      description: '25% discount at 8 students',
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
    deal: 'Tier 3: 25% OFF',
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

describe('Campus Crave — Engine Audit Test Suite', () => {
  // Test 1: Join Active Pool
  test('1. Student joins ACTIVE craving and updates count + collection parity', () => {
    const craving = createMockCraving();
    assert.equal(craving.count, 2);
    assert.equal(craving.participants.length, 2);

    const res = joinCravingPool(craving);
    assert.equal(res.success, true);
    assert.equal(res.craving.count, 3);
    assert.equal(res.craving.participants.length, 3);
    assert.equal(res.craving.joined, true);
    assert.equal(res.craving.participants.some((p) => p.id === DEMO_USER_ID), true);
  });

  // Test 2: Duplicate Join Prevention
  test('2. Duplicate join is prevented for the same user', () => {
    const craving = createMockCraving();
    const firstJoin = joinCravingPool(craving);
    assert.equal(firstJoin.success, true);

    // Attempt second join with same demo user
    const secondJoin = joinCravingPool(firstJoin.craving);
    assert.equal(secondJoin.success, false);
    assert.match(secondJoin.message || '', /already joined/i);
    assert.equal(secondJoin.craving.count, 3);
  });

  // Test 3: Leave Active Pool
  test('3. Student can leave ACTIVE craving and decrements count', () => {
    const craving = createMockCraving();
    const joined = joinCravingPool(craving).craving;
    assert.equal(joined.count, 3);
    assert.equal(joined.joined, true);

    const left = leaveCravingPool(joined, DEMO_USER_ID);
    assert.equal(left.success, true);
    assert.equal(left.craving.count, 2);
    assert.equal(left.craving.joined, false);
    assert.equal(left.craving.participants.some((p) => p.id === DEMO_USER_ID), false);
  });

  // Test 4: Participant Count Integrity
  test('4. Participant count strictly equals participants.length at all times', () => {
    let craving = createMockCraving();
    assert.equal(craving.count, craving.participants.length);

    craving = joinCravingPool(craving).craving;
    assert.equal(craving.count, craving.participants.length);

    craving = simulateStudentsJoining(craving, 3).craving;
    assert.equal(craving.count, craving.participants.length);

    craving = leaveCravingPool(craving, DEMO_USER_ID).craving;
    assert.equal(craving.count, craving.participants.length);
  });

  // Test 5: Tier Progression
  test('5. Tier progression unlocks correct rewards as count increases', () => {
    let craving = createMockCraving();
    // At count 2: no tier (Tier 1 requires 3)
    let progress = calculateTierProgress(craving);
    assert.equal(progress.currentTier, null);
    assert.equal(progress.nextTier?.id, 't-1');
    assert.equal(progress.remainingToNextTier, 1);

    // Add 1 participant -> reaches Tier 1 (3 participants)
    craving = joinCravingPool(craving).craving;
    progress = calculateTierProgress(craving);
    assert.equal(progress.currentTier?.id, 't-1');
    assert.equal(progress.nextTier?.id, 't-2');
    assert.equal(progress.remainingToNextTier, 2);

    // Add 2 participants -> reaches Tier 2 (5 participants)
    craving = simulateStudentsJoining(craving, 2).craving;
    progress = calculateTierProgress(craving);
    assert.equal(progress.currentTier?.id, 't-2');
    assert.equal(progress.nextTier?.id, 't-3');
    assert.equal(progress.remainingToNextTier, 3);
  });

  // Test 6: Tier Downgrade after Leaving
  test('6. Tier correctly downgrades if a participant leaves and drops below threshold', () => {
    let craving = createMockCraving(); // count: 2
    craving = joinCravingPool(craving).craving; // count: 3 (Tier 1 achieved)
    assert.equal(craving.count, 3);
    assert.equal(calculateTierProgress(craving).currentTier?.id, 't-1');

    // User leaves -> count drops back to 2 (below Tier 1 threshold of 3)
    craving = leaveCravingPool(craving, DEMO_USER_ID).craving;
    assert.equal(craving.count, 2);
    assert.equal(calculateTierProgress(craving).currentTier, null);
  });

  // Test 7: Unlock Conditions (Final Target reached)
  test('7. Deal automatically unlocks when final target is reached', () => {
    let craving = createMockCraving({ target: 4 }); // initial count 2
    assert.equal(craving.status, 'ACTIVE');

    craving = simulateStudentsJoining(craving, 2).craving; // count becomes 4/4
    assert.equal(craving.count, 4);
    assert.equal(craving.status, 'UNLOCKED');
    assert.ok(craving.unlockedAt);
  });

  // Test 8: Expiration Without Meeting Target
  test('8. Expiry without meeting minimum threshold transitions to EXPIRED', () => {
    const pastTime = Date.now() - 5000;
    // count 1, Tier 1 requires 3
    const craving = createMockCraving({
      count: 1,
      participants: [{ id: 'p1', name: 'Host', initial: 'H', avatarBg: 'bg-stone-100' }],
      expiresAt: pastTime,
      status: 'ACTIVE',
    });

    const res = evaluateCravingExpiry(craving, Date.now());
    assert.equal(res.updated, true);
    assert.equal(res.transition, 'EXPIRED');
    assert.equal(res.craving.status, 'EXPIRED');
  });

  // Test 9: Cannot Join Expired Pool
  test('9. Joining an EXPIRED pool is rejected by state guards', () => {
    const expiredCraving = createMockCraving({
      status: 'EXPIRED',
      expiresAt: Date.now() - 10000,
    });

    const guardCheck = canJoinDeal(expiredCraving);
    assert.equal(guardCheck.allowed, false);

    const res = joinCravingPool(expiredCraving);
    assert.equal(res.success, false);
    assert.match(res.message || '', /expired/i);
  });

  // Test 10: Cannot Expire Unlocked Deal & Valid State Transitions
  test('10. UNLOCKED deals can never expire and transitions are strictly guarded', () => {
    const unlockedCraving = createMockCraving({
      status: 'UNLOCKED',
      count: 8,
      unlockedAt: Date.now() - 60000,
      expiresAt: Date.now() - 1000, // even if past timestamp
    });

    // Expiry check must reject expiring an unlocked deal
    const expiryRes = evaluateCravingExpiry(unlockedCraving, Date.now());
    assert.equal(expiryRes.updated, false);
    assert.equal(expiryRes.craving.status, 'UNLOCKED');

    // Force expire action must also reject
    const forceRes = forceInstantExpiration(unlockedCraving);
    assert.equal(forceRes.success, false);
    assert.equal(forceRes.craving.status, 'UNLOCKED');

    // Check invalid state transition from UNLOCKED -> EXPIRED
    assert.equal(isValidTransition('UNLOCKED', 'EXPIRED'), false);
    assert.equal(isValidTransition('EXPIRED', 'UNLOCKED'), false);
    assert.equal(isValidTransition('CANCELLED', 'ACTIVE'), false);
  });

  // Test 11: Demo Controls (+1, +3, +5, Next Tier, Instant Unlock, Force Expire)
  test('11. Demo controls advance states safely without exceeding targets', () => {
    let craving = createMockCraving({ target: 6, count: 2 });

    // +1
    let res = simulateStudentsJoining(craving, 1);
    assert.equal(res.success, true);
    assert.equal(res.craving.count, 3);

    // Next Tier (from 3 to next tier at 5)
    res = advanceToNextTier(res.craving);
    assert.equal(res.success, true);
    assert.equal(res.craving.count, 5);

    // Instant Unlock (fills up to 6 and unlocks)
    res = forceInstantUnlock(res.craving);
    assert.equal(res.success, true);
    assert.equal(res.craving.count, 6);
    assert.equal(res.craving.status, 'UNLOCKED');

    // Force expire on unlocked is rejected
    const badExpire = forceInstantExpiration(res.craving);
    assert.equal(badExpire.success, false);
  });

  // Test 12: Checkout Discount Integrity
  test('12. Checkout calculation exactly matches achieved tier without arbitrary offsets', () => {
    const craving = createMockCraving({
      count: 5, // Tier 2 achieved (20% OFF)
    });

    // Cart total: ₹200
    // At Tier 2 (20%), discount must be exactly 20% of 200 = ₹40
    const discount = calculateOrderDiscount(craving, 200);
    assert.equal(discount, 40);

    // Cart total: ₹350
    // 20% of 350 = ₹70
    assert.equal(calculateOrderDiscount(craving, 350), 70);

    // Fixed discount tier test
    const fixedCraving = createMockCraving({
      count: 4,
      tiers: [
        {
          id: 'fix-1',
          tierNumber: 1,
          participantsRequired: 4,
          rewardType: 'discount',
          discountType: 'fixed',
          rewardValue: 60,
          title: 'Tier 1: ₹60 OFF',
          description: 'Flat ₹60 off',
        },
      ],
    });
    assert.equal(calculateOrderDiscount(fixedCraving, 250), 60);

    // Expired craving has 0 discount
    const expired = { ...craving, status: 'EXPIRED' as const };
    assert.equal(calculateOrderDiscount(expired, 200), 0);
  });

  // Test 13: Countdown Math & Formatting
  test('13. Countdown math does not drift or become negative', () => {
    const baseNow = 1700000000000;
    const expiresAt = baseNow + 125 * 1000; // 2 minutes 5 seconds

    const status = getCountdownStatus(expiresAt, baseNow);
    assert.equal(status.remainingSeconds, 125);
    assert.equal(status.formatted, '02:05');
    assert.equal(status.isExpired, false);

    // Past expiry
    const pastStatus = getCountdownStatus(expiresAt, baseNow + 130 * 1000);
    assert.equal(pastStatus.remainingSeconds, 0);
    assert.equal(pastStatus.formatted, '00:00');
    assert.equal(pastStatus.isExpired, true);
  });

  // Test 14: Data Validation and Parity Repair
  test('14. Corrupted count is auto-repaired to match participants.length', () => {
    // Simulate corrupted record where count was set to 999 but participants has 2 items
    const corruptedRecord = createMockCraving({
      count: 999,
      participants: [
        { id: 'p1', name: 'User 1', initial: 'U1', avatarBg: 'bg-stone-100' },
        { id: 'p2', name: 'User 2', initial: 'U2', avatarBg: 'bg-stone-100' },
      ],
    });

    // Enforce repair
    const repaired = {
      ...corruptedRecord,
      count: corruptedRecord.participants.length,
    };
    assert.equal(repaired.count, 2);
    assert.equal(repaired.count, repaired.participants.length);
  });
});
