import type { Craving, Participant } from '../types/index.ts';
import { canJoinDeal, canLeaveDeal, transitionCraving } from './dealLifecycle.ts';
import {
  calculateTierProgress,
  calculateOrderDiscount,
  getMinimumUnlockThreshold,
} from './dealTiers.ts';

export interface DealEngineResult {
  craving: Craving;
  success: boolean;
  message?: string;
  justUnlocked?: boolean;
}

export const DEMO_USER_ID = 'user-aastha';
export const DEMO_USER_NAME = 'Aastha Sharma (You)';

/**
 * Checks and updates a craving's lifecycle state based on wall-clock time.
 * If active time expires:
 * 1. Enters LOCKING
 * 2. Evaluates if minimum unlock threshold is met
 * 3. Transitions to UNLOCKED or EXPIRED
 */
export function evaluateCravingExpiry(craving: Craving, now: number = Date.now()): {
  updated: boolean;
  craving: Craving;
  transition?: 'UNLOCKED' | 'EXPIRED';
} {
  // Terminal states cannot expire
  if (craving.status === 'UNLOCKED' || craving.status === 'EXPIRED' || craving.status === 'CANCELLED') {
    return { updated: false, craving };
  }

  // Not yet expired
  if (now < craving.expiresAt) {
    return { updated: false, craving };
  }

  // Window closed! Transition through centralized state machine
  const minRequired = getMinimumUnlockThreshold(craving);
  const reachedMinThreshold = craving.count >= minRequired;

  if (reachedMinThreshold) {
    const trans = transitionCraving(craving, 'UNLOCKED', { now });
    if (trans.success) {
      const tierProgress = calculateTierProgress(trans.craving);
      const updated: Craving = {
        ...trans.craving,
        currentTierId: tierProgress.currentTier?.id || null,
        dealDiscount: calculateOrderDiscount(trans.craving, craving.budgetPerPerson),
      };
      return { updated: true, craving: updated, transition: 'UNLOCKED' };
    }
  } else {
    const trans = transitionCraving(craving, 'EXPIRED', { now });
    if (trans.success) {
      return { updated: true, craving: trans.craving, transition: 'EXPIRED' };
    }
  }

  return { updated: false, craving };
}

/**
 * Handles student joining an active craving pool.
 * Enforces participant count strictly matching participant collection length.
 */
export function joinCravingPool(
  craving: Craving,
  user: Participant = {
    id: DEMO_USER_ID,
    name: DEMO_USER_NAME,
    initial: 'AS',
    avatarBg: 'bg-brand-500 text-white font-bold',
    role: 'You',
  },
  now: number = Date.now()
): DealEngineResult {
  const check = canJoinDeal(craving, user.id, now);
  if (!check.allowed) {
    return { craving, success: false, message: check.reason };
  }

  // Avoid duplicate ID in participants array
  if (craving.participants.some((p) => p.id === user.id)) {
    return { craving, success: false, message: 'You have already joined this craving pool.' };
  }

  const newParticipants = [...craving.participants, { ...user, joinedAt: now }];
  const newCount = newParticipants.length;

  let updated: Craving = {
    ...craving,
    participants: newParticipants,
    count: newCount,
    joined: user.id === DEMO_USER_ID ? true : craving.joined,
  };

  const tierProgress = calculateTierProgress(updated);
  updated.currentTierId = tierProgress.currentTier?.id || null;
  updated.dealDiscount = calculateOrderDiscount(updated, updated.budgetPerPerson);

  // Check if fully unlocked (reached final target)
  let justUnlocked = false;
  if (newCount >= craving.target) {
    const trans = transitionCraving(updated, 'UNLOCKED', { now });
    if (trans.success) {
      updated = trans.craving;
      justUnlocked = true;
    }
  }

  return {
    craving: updated,
    success: true,
    justUnlocked,
  };
}

/**
 * Handles leaving an active craving pool.
 * Correctly recalculates tiers and updates count parity.
 */
export function leaveCravingPool(
  craving: Craving,
  userId: string = DEMO_USER_ID,
  now: number = Date.now()
): DealEngineResult {
  const check = canLeaveDeal(craving, userId, now);
  if (!check.allowed) {
    return { craving, success: false, message: check.reason };
  }

  const newParticipants = craving.participants.filter((p) => p.id !== userId);
  const newCount = newParticipants.length;

  let updated: Craving = {
    ...craving,
    participants: newParticipants,
    count: newCount,
    joined: userId === DEMO_USER_ID ? false : craving.joined,
  };

  const tierProgress = calculateTierProgress(updated);
  updated.currentTierId = tierProgress.currentTier?.id || null;
  updated.dealDiscount = calculateOrderDiscount(updated, updated.budgetPerPerson);

  return { craving: updated, success: true };
}

/**
 * Judge Demo Action: Simulates multiple students joining at once (+1, +3, +5).
 * Guaranteed to generate distinct non-duplicate participant IDs.
 */
export function simulateStudentsJoining(
  craving: Craving,
  countToAdd: number
): DealEngineResult {
  if (craving.status !== 'ACTIVE') {
    return { craving, success: false, message: `Cannot add students to a ${craving.status} pool.` };
  }

  const poolNames = [
    { name: 'Devansh Kapoor', initial: 'DK', bg: 'bg-teal-100 text-teal-800' },
    { name: 'Ananya Mishra', initial: 'AM', bg: 'bg-purple-100 text-purple-800' },
    { name: 'Rishabh Saini', initial: 'RS', bg: 'bg-blue-100 text-blue-800' },
    { name: 'Natasha Varma', initial: 'NV', bg: 'bg-rose-100 text-rose-800' },
    { name: 'Sameer Khan', initial: 'SK', bg: 'bg-amber-100 text-amber-800' },
    { name: 'Pooja Hegde', initial: 'PH', bg: 'bg-lime-100 text-lime-800' },
    { name: 'Varun Grover', initial: 'VG', bg: 'bg-indigo-100 text-indigo-800' },
    { name: 'Sanya Mirza', initial: 'SM', bg: 'bg-cyan-100 text-cyan-800' },
    { name: 'Karan Johar', initial: 'KJ', bg: 'bg-emerald-100 text-emerald-800' },
    { name: 'Mehak Sethi', initial: 'MS', bg: 'bg-violet-100 text-violet-800' },
  ];

  let current = craving;
  let justUnlocked = false;

  for (let i = 0; i < countToAdd; i++) {
    if (current.count >= current.target) break;

    const uniqueId = `sim-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 7)}`;
    const pick = poolNames[(current.participants.length + i) % poolNames.length];
    const newParticipant: Participant = {
      id: uniqueId,
      name: pick.name,
      initial: pick.initial,
      avatarBg: pick.bg,
      joinedAt: Date.now(),
    };

    const res = joinCravingPool(current, newParticipant);
    if (res.success) {
      current = res.craving;
      if (res.justUnlocked) justUnlocked = true;
    }
  }

  return { craving: current, success: true, justUnlocked };
}

/**
 * Judge Demo Action: Instantly advance to the next tier or full unlock
 */
export function advanceToNextTier(craving: Craving): DealEngineResult {
  if (craving.status !== 'ACTIVE') {
    return { craving, success: false, message: `Pool is ${craving.status}; cannot advance tier.` };
  }

  const tierProgress = calculateTierProgress(craving);
  if (!tierProgress.nextTier) {
    return { craving, success: false, message: 'All tiers are already unlocked!' };
  }

  const needed = Math.max(1, tierProgress.nextTier.participantsRequired - craving.count);
  return simulateStudentsJoining(craving, needed);
}

/**
 * Judge Demo Action: Force instant unlock.
 * Only permitted on ACTIVE pools. Rejected on LOCKING, EXPIRED, CANCELLED, and UNLOCKED.
 * Preserves original expiresAt timestamp without artificial extensions.
 */
export function forceInstantUnlock(craving: Craving): DealEngineResult {
  if (craving.status === 'UNLOCKED') {
    return { craving, success: false, message: 'Deal is already unlocked.' };
  }
  if (craving.status === 'LOCKING' || craving.status === 'EXPIRED' || craving.status === 'CANCELLED') {
    return { craving, success: false, message: `Cannot force unlock a pool with status ${craving.status}.` };
  }

  const needed = Math.max(0, craving.target - craving.count);
  let intermediate = craving;

  if (needed > 0) {
    const res = simulateStudentsJoining(craving, needed);
    intermediate = res.craving;
  }

  const now = Date.now();
  const trans = transitionCraving(intermediate, 'UNLOCKED', { now });
  if (!trans.success) {
    return { craving, success: false, message: trans.error };
  }

  const tierProgress = calculateTierProgress(trans.craving);
  const unlocked: Craving = {
    ...trans.craving,
    count: trans.craving.participants.length,
    currentTierId: tierProgress.currentTier?.id || null,
    dealDiscount: calculateOrderDiscount(trans.craving, trans.craving.budgetPerPerson),
    // Preserve original expiresAt timestamp!
  };

  return { craving: unlocked, success: true, justUnlocked: true };
}

/**
 * Judge Demo Action: Force instant expiration.
 * Only permitted on ACTIVE pools. Rejected on LOCKING, EXPIRED, CANCELLED, and UNLOCKED.
 */
export function forceInstantExpiration(craving: Craving): DealEngineResult {
  if (craving.status === 'UNLOCKED') {
    return { craving, success: false, message: 'Cannot expire an already unlocked deal.' };
  }
  if (craving.status === 'LOCKING' || craving.status === 'EXPIRED' || craving.status === 'CANCELLED') {
    return { craving, success: false, message: `Cannot force expire a pool with status ${craving.status}.` };
  }

  const now = Date.now();
  const trans = transitionCraving(craving, 'EXPIRED', { now });
  if (!trans.success) {
    return { craving, success: false, message: trans.error };
  }

  const expired: Craving = {
    ...trans.craving,
    expiresAt: now - 1000,
  };

  return { craving: expired, success: true };
}
