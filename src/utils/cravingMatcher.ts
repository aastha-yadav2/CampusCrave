import { Craving, CravingInput, MatchScoreBreakdown } from '../types';

/**
 * Normalizes restaurant string for fuzzy & alias matching
 * Handles casing, extra spaces, punctuation, prefixes like "The", "Cafe", etc.
 */
export function normalizeRestaurant(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/^the\s+/, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two restaurants are compatible (exact normalized, substring, or token overlap)
 */
export function isRestaurantMatch(resA: string, resB: string): { matches: boolean; score: number } {
  const normA = normalizeRestaurant(resA);
  const normB = normalizeRestaurant(resB);

  if (!normA || !normB) return { matches: false, score: 0 };
  if (normA === normB) return { matches: true, score: 40 };

  // Substring check (e.g. "Burger Barn" vs "Burger Barn Express")
  if (normA.includes(normB) || normB.includes(normA)) {
    return { matches: true, score: 36 };
  }

  // Token overlap check
  const tokensA = normA.split(' ').filter(t => t.length > 2);
  const tokensB = normB.split(' ').filter(t => t.length > 2);
  const common = tokensA.filter(t => tokensB.includes(t));

  if (common.length >= 2 || (tokensA.length === 1 && common.length === 1)) {
    return { matches: true, score: 32 };
  }

  return { matches: false, score: 0 };
}

/**
 * Calculates compatibility score between a newly requested craving and an existing craving pool
 */
export function calculateCompatibilityScore(
  input: CravingInput,
  pool: Craving
): MatchScoreBreakdown | null {
  // Reject if pool is full or completed or expired
  if (pool.count >= pool.target && pool.status !== 'ACTIVE') {
    // Note: If deal is unlocked but still accepting demo orders, we might allow joining,
    // but pools at cap are locked.
    if (pool.count >= pool.target) {
      return null;
    }
  }

  // Reject if different campus entirely
  if (input.campus && pool.campus && input.campus !== pool.campus) {
    return null;
  }

  // 1. Restaurant matching (40 points max - HARD requirement)
  const restCheck = isRestaurantMatch(input.restaurant, pool.restaurant);
  if (!restCheck.matches) {
    return null; // Hard rejection for different restaurants
  }

  let totalScore = restCheck.score;
  const reasons: string[] = [`Same restaurant: "${pool.restaurant}"`];

  // 2. Compatible time window (20 points max)
  if (input.timeWindow && pool.timeWindow) {
    const inputTimeLower = input.timeWindow.toLowerCase();
    const poolTimeLower = pool.timeWindow.toLowerCase();

    // Check if time references are similar (e.g. both "8:" or "Tonight" or "9:")
    const extractHour = (str: string) => {
      const match = str.match(/(\d{1,2}):/);
      return match ? parseInt(match[1], 10) : null;
    };

    const hourA = extractHour(inputTimeLower);
    const hourB = extractHour(poolTimeLower);

    if (hourA !== null && hourB !== null && Math.abs(hourA - hourB) <= 1) {
      totalScore += 20;
      reasons.push(`Compatible ordering time window (${pool.timeWindow.split('·')[1]?.trim() || pool.timeWindow})`);
    } else {
      totalScore += 10;
      reasons.push('Acceptable ordering time alignment');
    }
  } else {
    totalScore += 15;
  }

  // 3. Same campus zone (15 points max)
  if (input.zone === pool.zone) {
    totalScore += 15;
    reasons.push(`Exact same campus delivery zone: ${pool.zone}`);
  } else {
    // Nearby zones still get partial points
    totalScore += 8;
    reasons.push(`Close campus location: ${pool.zone}`);
  }

  // 4. Compatible budget range (15 points max)
  if (input.budget && pool.budgetPerPerson) {
    const diff = Math.abs(input.budget - pool.budgetPerPerson);
    if (diff <= 30) {
      totalScore += 15;
      reasons.push(`Target budget closely aligned (~₹${pool.budgetPerPerson}/person)`);
    } else if (diff <= 80) {
      totalScore += 10;
      reasons.push(`Compatible budget tier (within ₹${diff})`);
    } else {
      totalScore += 5;
    }
  } else {
    totalScore += 10;
  }

  // 5. Compatible food category (10 points max)
  if (input.category === pool.category || input.category === 'All') {
    totalScore += 10;
    reasons.push(`Shared craving category: ${pool.category}`);
  } else {
    // Check keyword overlap in food text
    const foodWords = input.food.toLowerCase().split(/\s+/);
    const poolWords = pool.food.toLowerCase();
    const hasOverlap = foodWords.some(w => w.length > 3 && poolWords.includes(w));
    if (hasOverlap) {
      totalScore += 8;
      reasons.push(`Matching food cravings & menu items`);
    }
  }

  // Normalization to 100 max
  totalScore = Math.min(100, Math.round(totalScore));

  // Determine tier
  let tier: 'STRONG' | 'COMPATIBLE' | 'WEAK' = 'WEAK';
  let tierLabel = 'Potential Match';

  if (totalScore >= 80) {
    tier = 'STRONG';
    tierLabel = 'Strong Match';
  } else if (totalScore >= 60) {
    tier = 'COMPATIBLE';
    tierLabel = 'Compatible Match';
  } else {
    return null; // Score below 60 is not suggested as per specification
  }

  return {
    score: totalScore,
    tier,
    tierLabel,
    reasons,
    matchedCraving: pool,
  };
}

/**
 * Searches active cravings for the best compatible pool(s)
 */
export function findCompatibleCravings(
  input: CravingInput,
  existingCravings: Craving[]
): MatchScoreBreakdown[] {
  const results: MatchScoreBreakdown[] = [];

  for (const craving of existingCravings) {
    const match = calculateCompatibilityScore(input, craving);
    if (match) {
      results.push(match);
    }
  }

  // Sort by highest score first, then by closest to unlock (target - count)
  return results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const remainingA = a.matchedCraving.target - a.matchedCraving.count;
    const remainingB = b.matchedCraving.target - b.matchedCraving.count;
    return remainingA - remainingB;
  });
}
