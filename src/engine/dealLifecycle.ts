import { Craving, DealLifecycleState } from '../types';

/**
 * Valid state transitions table:
 * ACTIVE -> LOCKING, CANCELLED
 * LOCKING -> UNLOCKED, EXPIRED
 * UNLOCKED -> (terminal state for pooling; orders can now be placed)
 * EXPIRED -> (terminal state; fallback options available)
 * CANCELLED -> (terminal state)
 */
const ALLOWED_TRANSITIONS: Record<DealLifecycleState, DealLifecycleState[]> = {
  ACTIVE: ['LOCKING', 'CANCELLED', 'UNLOCKED', 'EXPIRED'], // Direct UNLOCKED/EXPIRED permitted for instant demo triggers
  LOCKING: ['UNLOCKED', 'EXPIRED', 'CANCELLED'],
  UNLOCKED: [], // Once unlocked, deals do not expire
  EXPIRED: [],  // Once expired, deals do not unlock
  CANCELLED: [],
};

export function canTransition(
  from: DealLifecycleState,
  to: DealLifecycleState
): boolean {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function canJoinDeal(craving: Craving, userId: string = 'user-aastha'): {
  allowed: boolean;
  reason?: string;
} {
  if (craving.status === 'EXPIRED') {
    return { allowed: false, reason: 'This craving pool has expired and is no longer accepting students.' };
  }
  if (craving.status === 'UNLOCKED') {
    return { allowed: false, reason: 'Goal reached! This deal has already unlocked.' };
  }
  if (craving.status === 'LOCKING') {
    return { allowed: false, reason: 'Joining has locked while orders are finalized.' };
  }
  if (craving.status === 'CANCELLED') {
    return { allowed: false, reason: 'This craving pool has been cancelled.' };
  }
  if (craving.status !== 'ACTIVE') {
    return { allowed: false, reason: 'This pool is not currently active.' };
  }

  // Check timestamp expiration
  if (Date.now() >= craving.expiresAt) {
    return { allowed: false, reason: 'Joining window has closed.' };
  }

  // Check if student already joined
  const alreadyJoined = craving.participants.some((p) => p.id === userId);
  if (alreadyJoined || craving.joined) {
    return { allowed: false, reason: 'You have already joined this craving pool.' };
  }

  // Check if at maximum capacity
  if (craving.count >= craving.target) {
    return { allowed: false, reason: 'This craving pool has already reached its full target.' };
  }

  return { allowed: true };
}

export function canLeaveDeal(craving: Craving, userId: string = 'user-aastha'): {
  allowed: boolean;
  reason?: string;
} {
  if (craving.status !== 'ACTIVE') {
    return { allowed: false, reason: 'You can only leave an active craving pool.' };
  }

  const isJoined = craving.participants.some((p) => p.id === userId) || craving.joined;
  if (!isJoined) {
    return { allowed: false, reason: 'You are not a participant in this craving pool.' };
  }

  return { allowed: true };
}

export function isAlmostUnlocked(craving: Craving): boolean {
  if (craving.status !== 'ACTIVE') return false;
  const progressRatio = craving.count / craving.target;
  return progressRatio >= 0.7 && progressRatio < 1;
}
