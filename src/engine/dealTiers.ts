import { Craving, DealTier, TierProgressSummary } from '../types';

/**
 * Calculates progressive tier information for any craving.
 * Identifies:
 * - Highest tier currently unlocked
 * - Next tier to be unlocked
 * - Participants remaining to reach next tier
 * - Progress percentage
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

  // Tier progress percentage (relative to next tier, or 100% if all tiers unlocked)
  let tierProgressPercentage = 0;
  if (nextTier) {
    const prevThreshold = currentTier ? currentTier.participantsRequired : 0;
    const range = nextTier.participantsRequired - prevThreshold;
    const progressInRange = count - prevThreshold;
    tierProgressPercentage = Math.min(100, Math.max(0, Math.round((progressInRange / range) * 100)));
  } else {
    tierProgressPercentage = 100;
  }

  // Overall progress against final target
  const overallProgressPercentage = Math.min(100, Math.max(0, Math.round((count / target) * 100)));

  // Best available reward string
  const bestAvailableReward = currentTier
    ? currentTier.title
    : (nextTier ? `Unlocks at ${nextTier.participantsRequired} students: ${nextTier.title}` : craving.deal);

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
 * Generates balanced 3-tier milestones for any pool target size.
 */
export function generateDefaultTiers(target: number, restaurantName: string): DealTier[] {
  const tier1Req = Math.max(3, Math.round(target * 0.5));
  const tier2Req = Math.max(tier1Req + 2, Math.round(target * 0.8));
  const tier3Req = target;

  return [
    {
      id: 'tier-1',
      tierNumber: 1,
      participantsRequired: tier1Req,
      rewardType: 'discount',
      rewardValue: 15,
      title: 'Tier 1: 15% OFF Group Deal',
      description: `Unlocks 15% discount for everyone at ${restaurantName}`,
    },
    {
      id: 'tier-2',
      tierNumber: 2,
      participantsRequired: tier2Req,
      rewardType: 'discount',
      rewardValue: 25,
      title: 'Tier 2: 25% OFF + Free Dips',
      description: `Unlocks 25% discount and complimentary dips/add-on`,
    },
    {
      id: 'tier-3',
      tierNumber: 3,
      participantsRequired: tier3Req,
      rewardType: 'free_item',
      rewardValue: 35,
      title: 'Tier 3: 35% OFF + Free Sides Combo',
      description: `Maximum collective reward: 35% OFF and free sides platter`,
    },
  ];
}
