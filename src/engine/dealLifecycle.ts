import type { Craving, DealLifecycleState } from '../types/index.ts';

/**
 * Centralized State Transition Matrix:
 * - ACTIVE can only transition to LOCKING or CANCELLED
 * - LOCKING can only transition to UNLOCKED or EXPIRED
 * - UNLOCKED is terminal (deals secured; orders available; can NEVER expire)
 * - EXPIRED is terminal (cannot unlock)
 * - CANCELLED is terminal
 */
const VALID_TRANSITIONS: Record<DealLifecycleState, DealLifecycleState[]> = {
  ACTIVE: ['LOCKING', 'CANCELLED'],
  LOCKING: ['UNLOCKED', 'EXPIRED'],
  UNLOCKED: [], // Terminal
  EXPIRED: [],  // Terminal
  CANCELLED: [], // Terminal
};

export function isValidTransition(from: DealLifecycleState, to: DealLifecycleState): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export interface TransitionResult {
  success: boolean;
  craving: Craving;
  error?: string;
}

/**
 * Centralized State Machine Transition Function.
 * Ensures every state change strictly follows the transition matrix
 * and sets appropriate timestamps.
 */
export function transitionCraving(
  craving: Craving,
  targetState: DealLifecycleState,
  options?: { now?: number; reason?: string }
): TransitionResult {
  const now = options?.now ?? Date.now();
  const currentState = craving.status;

  if (currentState === targetState) {
    return { success: true, craving };
  }

  // Check if direct transition is valid
  if (!isValidTransition(currentState, targetState)) {
    // If attempting to go from ACTIVE -> UNLOCKED or ACTIVE -> EXPIRED, route through LOCKING
    if (currentState === 'ACTIVE' && (targetState === 'UNLOCKED' || targetState === 'EXPIRED')) {
      const lockingCraving: Craving = {
        ...craving,
        status: 'LOCKING',
        lockedAt: now,
      };
      return transitionCraving(lockingCraving, targetState, options);
    }

    return {
      success: false,
      craving,
      error: `Illegal state transition from ${currentState} to ${targetState}`,
    };
  }

  // Build the transitioned craving
  const updated: Craving = {
    ...craving,
    status: targetState,
  };

  if (targetState === 'LOCKING') {
    updated.lockedAt = now;
  } else if (targetState === 'UNLOCKED') {
    updated.unlockedAt = now;
    if (!updated.lockedAt) updated.lockedAt = now;
  } else if (targetState === 'EXPIRED') {
    updated.expiredAt = now;
    if (!updated.lockedAt) updated.lockedAt = now;
  }

  return { success: true, craving: updated };
}

/**
 * Guard: Can a student join this pool?
 */
export function canJoinDeal(
  craving: Craving,
  userId: string = 'user-aastha',
  now: number = Date.now()
): { allowed: boolean; reason?: string } {
  // Check lifecycle state
  if (craving.status === 'EXPIRED') {
    return { allowed: false, reason: 'This craving pool has expired and is closed to new participants.' };
  }
  if (craving.status === 'UNLOCKED') {
    return { allowed: false, reason: 'This deal is already unlocked and ordering is open.' };
  }
  if (craving.status === 'LOCKING') {
    return { allowed: false, reason: 'This pool is finalizing its target count and is locked.' };
  }
  if (craving.status === 'CANCELLED') {
    return { allowed: false, reason: 'This craving pool has been cancelled.' };
  }
  if (craving.status !== 'ACTIVE') {
    return { allowed: false, reason: `Pool status is ${craving.status}; joining is not allowed.` };
  }

  // Check timestamp expiration
  if (now >= craving.expiresAt) {
    return { allowed: false, reason: 'The joining window for this craving pool has closed.' };
  }

  // Check capacity
  if (craving.count >= craving.target) {
    return { allowed: false, reason: 'This craving pool has reached maximum capacity.' };
  }

  // Check duplicate participant
  const isDuplicate = craving.participants.some((p) => p.id === userId);
  if (isDuplicate || (userId === 'user-aastha' && craving.joined)) {
    return { allowed: false, reason: 'You have already joined this craving pool.' };
  }

  return { allowed: true };
}

/**
 * Guard: Can a student leave this pool?
 */
export function canLeaveDeal(
  craving: Craving,
  userId: string = 'user-aastha',
  now: number = Date.now()
): { allowed: boolean; reason?: string } {
  if (craving.status !== 'ACTIVE') {
    return { allowed: false, reason: `Cannot leave a craving pool with status ${craving.status}.` };
  }

  if (now >= craving.expiresAt) {
    return { allowed: false, reason: 'Cannot leave once the ordering window has closed.' };
  }

  const isMember = craving.participants.some((p) => p.id === userId) || (userId === 'user-aastha' && craving.joined);
  if (!isMember) {
    return { allowed: false, reason: 'You are not a participant in this craving pool.' };
  }

  return { allowed: true };
}

/**
 * Guard: Check if pool is almost unlocked (progress >= 70% and still active)
 */
export function isAlmostUnlocked(craving: Craving): boolean {
  if (craving.status !== 'ACTIVE') return false;
  if (craving.target <= 0) return false;
  const progressRatio = craving.count / craving.target;
  return progressRatio >= 0.7 && progressRatio < 1.0;
}
