import type { Craving, DealTier, TierProgressSummary } from '../types/index.ts';

/**
 * Defines and documents the exact minimum participation threshold required to unlock a pool.
 * A pool unlocks upon window expiry if and only if count >= minimum unlock threshold.
 * Default is Tier 1 requirement (first milestone). If no tiers, defaults to final target.
 */
export function getMinimumUnlockThreshold(craving: Craving): number {
  if (craving.tiers && craving.tiers.length > 0) {
    const sorted = [...craving.tiers].sort((a, b) => a.participantsRequired - b.participantsRequired);
    return sorted[0].participantsRequired;
  }
  return craving.target;
}

/**
 * Calculates progressive tier information for any craving.
 * Identifies:
 * - Current highest tier unlocked
 * - Next tier to be unlocked
 * - Participants remaining to reach next tier
 * - Progress percentage
 * - Best available reward
 */
export function calculateTierProgress(craving: Craving): TierProgressSummary {
  const tiers = (craving.tiers && craving.tiers.length > 0)
    ? [...craving.tiers].sort((a, b) => a.participantsRequired - b.participantsRequired)
    : generateDefaultTiers(craving.target, craving.restaurant);

  const count = craving.count;
  const target = craving.target;

  // Find all unlocked tiers
  const unlockedTiers = tiers.filter((t) => count >= t.participantsRequired);
  const currentTier = unlockedTiers.length > 0 ? unlockedTiers[unlockedTiers.length - 1] : null;

  // Next tier to unlock
  const nextTier = tiers.find((t) => count < t.participantsRequired) || null;

  const remainingToNextTier = nextTier
    ? Math.max(0, nextTier.participantsRequired - count)
    : 0;

  // Tier progress percentage (relative to step between tiers)
  let tierProgressPercentage = 0;
  if (nextTier) {
    const prevThreshold = currentTier ? currentTier.participantsRequired : 0;
    const range = Math.max(1, nextTier.participantsRequired - prevThreshold);
    const progressInRange = count - prevThreshold;
    tierProgressPercentage = Math.min(100, Math.max(0, Math.round((progressInRange / range) * 100)));
  } else {
    tierProgressPercentage = 100;
  }

  // Overall progress against final target
  const overallProgressPercentage = target > 0
    ? Math.min(100, Math.max(0, Math.round((count / target) * 100)))
    : 0;

  // Best available reward string
  const bestAvailableReward = currentTier
    ? currentTier.title
    : (nextTier ? `Target: ${nextTier.title} (at ${nextTier.participantsRequired} students)` : craving.deal);

  const isFullyUnlocked = count >= target || craving.status === 'UNLOCKED';

  return {
    currentTier,
    nextTier,
    remainingToNextTier,
    tierProgressPercentage,
    overallProgressPercentage,
    bestAvailableReward,
    isFullyUnlocked,
    unlockedTiersCount: unlockedTiers.length,
  };
}

export interface AchievedRewardDetails {
  currentTier: DealTier | null;
  rewardType: 'discount' | 'free_item' | 'cashback' | 'none';
  discountAmount: number;
  freeItemDescription: string | null;
  summaryTitle: string;
}

/**
 * Resolves detailed reward information for deal cards, modals, and checkout.
 */
export function getAchievedReward(craving: Craving, itemTotal: number = 0): AchievedRewardDetails {
  const progress = calculateTierProgress(craving);
  const tier = progress.currentTier;

  if (!tier || craving.status === 'EXPIRED' || craving.status === 'CANCELLED') {
    return {
      currentTier: null,
      rewardType: 'none',
      discountAmount: 0,
      freeItemDescription: null,
      summaryTitle: craving.deal,
    };
  }

  const discountAmount = calculateOrderDiscount(craving, itemTotal);
  const freeItemDescription = tier.rewardType === 'free_item' ? tier.title : null;

  return {
    currentTier: tier,
    rewardType: tier.rewardType,
    discountAmount,
    freeItemDescription,
    summaryTitle: tier.title,
  };
}

/**
 * Calculates the exact monetary discount for an order based on current pool tier.
 * Strict rules:
 * - If no eligible tier is unlocked, monetary discount is strictly 0 (no arbitrary 15% fallback).
 * - If tier rewardType is 'free_item', monetary discount is 0 (free item is separate).
 * - If tier rewardType is 'discount' with 'percent', computes Math.round(itemTotal * (tier.rewardValue / 100)).
 * - If tier rewardType is 'discount' with 'fixed', uses Math.min(itemTotal, tier.rewardValue).
 * - Capped between 0 and itemTotal at all times.
 */
export function calculateOrderDiscount(craving: Craving, itemTotal: number): number {
  if (itemTotal <= 0) return 0;
  if (craving.status === 'EXPIRED' || craving.status === 'CANCELLED') return 0;

  const progress = calculateTierProgress(craving);
  const tier = progress.currentTier;

  // Strict Rule: No eligible discount tier means zero monetary discount.
  if (!tier) {
    return 0;
  }

  // Strict Rule: Free-item rewards provide zero monetary discount on subtotal.
  if (tier.rewardType === 'free_item') {
    return 0;
  }

  // Explicit structured discountType evaluation
  if (tier.discountType === 'fixed') {
    return Math.min(itemTotal, Math.max(0, tier.rewardValue));
  }

  if (tier.discountType === 'percent') {
    const rawDiscount = Math.round(itemTotal * (tier.rewardValue / 100));
    return Math.min(itemTotal, Math.max(0, rawDiscount));
  }

  // Backwards compatibility for tiers where discountType was omitted
  if (tier.rewardValue <= 50) {
    const rawDiscount = Math.round(itemTotal * (tier.rewardValue / 100));
    return Math.min(itemTotal, Math.max(0, rawDiscount));
  }

  return Math.min(itemTotal, Math.max(0, tier.rewardValue));
}

/**
 * Generates default 3-tier milestones for any pool target size.
 */
export function generateDefaultTiers(target: number, restaurantName: string): DealTier[] {
  const safeTarget = Math.max(2, target);
  const tier1Req = Math.max(2, Math.round(safeTarget * 0.5));
  const tier2Req = Math.max(tier1Req + 1, Math.round(safeTarget * 0.8));
  const tier3Req = safeTarget;

  return [
    {
      id: 'tier-1',
      tierNumber: 1,
      participantsRequired: tier1Req,
      rewardType: 'discount',
      discountType: 'percent',
      rewardValue: 15,
      title: 'Tier 1: 15% OFF Group Deal',
      description: `Unlocks 15% discount for everyone at ${restaurantName}`,
    },
    {
      id: 'tier-2',
      tierNumber: 2,
      participantsRequired: tier2Req,
      rewardType: 'discount',
      discountType: 'percent',
      rewardValue: 20,
      title: 'Tier 2: 20% OFF + House Dips',
      description: `Unlocks 20% discount and complimentary house dips`,
    },
    {
      id: 'tier-3',
      tierNumber: 3,
      participantsRequired: tier3Req,
      rewardType: 'free_item',
      discountType: 'percent',
      rewardValue: 0, // Free item has 0 monetary discount
      title: 'Tier 3: Free Sides Platter Unlocked',
      description: `Full unlock: complimentary sides platter for every participant`,
    },
  ];
}
