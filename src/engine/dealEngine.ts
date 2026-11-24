import { Craving, Participant } from '../types';
import { canJoinDeal, canLeaveDeal, canTransition } from './dealLifecycle';
import { calculateTierProgress } from './dealTiers';

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
 * 2. Evaluates if minimum tier or target reached
 * 3. Transitions to UNLOCKED or EXPIRED
 */
export function evaluateCravingExpiry(craving: Craving, now: number = Date.now()): {
  updated: boolean;
  craving: Craving;
  transition?: 'UNLOCKED' | 'EXPIRED';
} {
  // Already in terminal state or no expiration defined
  if (craving.status === 'UNLOCKED' || craving.status === 'EXPIRED' || craving.status === 'CANCELLED') {
    return { updated: false, craving };
  }

  // Not yet expired
  if (now < craving.expiresAt) {
    return { updated: false, craving };
  }

  // Window closed! Transition through LOCKING to final state
  const tierProgress = calculateTierProgress(craving);
  const reachedMinTier = tierProgress.unlockedTiersCount > 0 || craving.count >= (craving.tiers[0]?.participantsRequired || craving.target);

  if (reachedMinTier) {
    const updatedCraving: Craving = {
      ...craving,
      status: 'UNLOCKED',
      unlockedAt: now,
      lockedAt: now,
      currentTierId: tierProgress.currentTier?.id || craving.tiers[0]?.id || null,
      dealDiscount: tierProgress.currentTier ? (tierProgress.currentTier.rewardValue + 15) : craving.dealDiscount,
    };
    return { updated: true, craving: updatedCraving, transition: 'UNLOCKED' };
  } else {
    const updatedCraving: Craving = {
      ...craving,
      status: 'EXPIRED',
      expiredAt: now,
      lockedAt: now,
    };
    return { updated: true, craving: updatedCraving, transition: 'EXPIRED' };
  }
}

/**
 * Handles demo student joining an active craving pool
 */
export function joinCravingPool(
  craving: Craving,
  user: Participant = {
    id: DEMO_USER_ID,
    name: DEMO_USER_NAME,
    initial: 'AS',
    avatarBg: 'bg-brand-500 text-white font-bold',
    role: 'You',
  }
): DealEngineResult {
  const check = canJoinDeal(craving, user.id);
  if (!check.allowed) {
    return { craving, success: false, message: check.reason };
  }

  const newCount = craving.count + 1;
  const newParticipants = [...craving.participants, { ...user, joinedAt: Date.now() }];
  
  // Re-evaluate tier
  const tempCraving: Craving = {
    ...craving,
    count: newCount,
    participants: newParticipants,
    joined: user.id === DEMO_USER_ID ? true : craving.joined,
  };
  const tierProgress = calculateTierProgress(tempCraving);
  
  // Check if fully unlocked (hits max target)
  const isNowUnlocked = newCount >= craving.target;

  const updatedCraving: Craving = {
    ...tempCraving,
    status: isNowUnlocked ? 'UNLOCKED' : craving.status,
    unlockedAt: isNowUnlocked ? Date.now() : craving.unlockedAt,
    currentTierId: tierProgress.currentTier?.id || null,
    dealDiscount: tierProgress.currentTier ? (tierProgress.currentTier.rewardValue + 20) : craving.dealDiscount,
  };

  return {
    craving: updatedCraving,
    success: true,
    justUnlocked: isNowUnlocked,
  };
}

/**
 * Handles leaving an active craving pool
 */
export function leaveCravingPool(craving: Craving, userId: string = DEMO_USER_ID): DealEngineResult {
  const check = canLeaveDeal(craving, userId);
  if (!check.allowed) {
    return { craving, success: false, message: check.reason };
  }

  const newCount = Math.max(0, craving.count - 1);
  const newParticipants = craving.participants.filter((p) => p.id !== userId);

  const tempCraving: Craving = {
    ...craving,
    count: newCount,
    participants: newParticipants,
    joined: userId === DEMO_USER_ID ? false : craving.joined,
  };

  const tierProgress = calculateTierProgress(tempCraving);

  const updatedCraving: Craving = {
    ...tempCraving,
    currentTierId: tierProgress.currentTier?.id || null,
  };

  return { craving: updatedCraving, success: true };
}

/**
 * Judge Demo Action: Simulates multiple students joining at once (+1, +3, +5)
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
  ];

  let current = craving;
  let justUnlocked = false;

  for (let i = 0; i < countToAdd; i++) {
    if (current.count >= current.target) break;

    const pick = poolNames[(current.count + i) % poolNames.length];
    const newParticipant: Participant = {
      id: `sim-${Date.now()}-${i}`,
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
  const tierProgress = calculateTierProgress(craving);
  if (!tierProgress.nextTier) {
    return { craving, success: false, message: 'All tiers are already unlocked!' };
  }

  const needed = Math.max(1, tierProgress.nextTier.participantsRequired - craving.count);
  return simulateStudentsJoining(craving, needed);
}

/**
 * Judge Demo Action: Force instant unlock
 */
export function forceInstantUnlock(craving: Craving): DealEngineResult {
  if (craving.status === 'UNLOCKED') {
    return { craving, success: false, message: 'Deal is already unlocked.' };
  }

  const needed = Math.max(1, craving.target - craving.count);
  const res = simulateStudentsJoining(craving, needed);

  const forced: Craving = {
    ...res.craving,
    status: 'UNLOCKED',
    count: craving.target,
    unlockedAt: Date.now(),
    expiresAt: Date.now() + 3600000, // extend so it stays unlocked
  };

  return { craving: forced, success: true, justUnlocked: true };
}

/**
 * Judge Demo Action: Force instant expiration
 */
export function forceInstantExpiration(craving: Craving): DealEngineResult {
  if (craving.status === 'UNLOCKED') {
    return { craving, success: false, message: 'Cannot expire an already unlocked deal.' };
  }

  const expiredCraving: Craving = {
    ...craving,
    status: 'EXPIRED',
    expiresAt: Date.now() - 1000,
    expiredAt: Date.now(),
    lockedAt: Date.now(),
  };

  return { craving: expiredCraving, success: true };
}
