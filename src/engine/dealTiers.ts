import type { Craving, DealTier, TierProgressSummary } from '../types/index.ts';

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

/**
 * Calculates the exact rupee discount for an order based on current pool tier.
 * Completely eliminates arbitrary additions like `+15` or `+20`.
 * Single source of truth for all checkout calculations.
 */
export function calculateOrderDiscount(craving: Craving, itemTotal: number): number {
  if (itemTotal <= 0) return 0;
  if (craving.status === 'EXPIRED' || craving.status === 'CANCELLED') return 0;

  const progress = calculateTierProgress(craving);
  const tier = progress.currentTier;

  // If no tier is unlocked yet, but craving is UNLOCKED (e.g. at target), use first tier or default 15%
  if (!tier) {
    if (craving.status === 'UNLOCKED') {
      return Math.round(itemTotal * 0.15);
    }
    return 0;
  }

  // Detect discount type (explicit or from title/value)
  const isFixed = tier.discountType === 'fixed' || tier.title.includes('₹');
  const isPercent = tier.discountType === 'percent' || tier.title.includes('%') || tier.rewardValue <= 50;

  if (isFixed && !tier.title.includes('%')) {
    return Math.min(itemTotal, tier.rewardValue);
  }

  if (isPercent) {
    const percentage = tier.rewardValue;
    return Math.round(itemTotal * (percentage / 100));
  }

  // Fallback to tier value capped at item total
  return Math.min(itemTotal, tier.rewardValue);
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
      rewardValue: 25,
      title: 'Tier 3: 25% OFF + Free Sides Combo',
      description: `Full unlock: 25% discount and complimentary sides platter`,
    },
  ];
}
