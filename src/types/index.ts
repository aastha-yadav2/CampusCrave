export type FoodCategory =
  | 'All'
  | 'Burgers'
  | 'Pizza'
  | 'Momos'
  | 'Biryani'
  | 'Chinese'
  | 'Snacks'
  | 'Desserts'
  | 'Drinks'
  | 'Healthy';

export type FilterPreset =
  | 'all'
  | 'almost_unlocked'
  | 'ending_soon'
  | 'popular'
  | 'budget_friendly';

export type DealLifecycleState =
  | 'ACTIVE'
  | 'LOCKING'
  | 'UNLOCKED'
  | 'EXPIRED'
  | 'CANCELLED';

export interface DealTier {
  id: string;
  tierNumber: number;
  participantsRequired: number;
  rewardType: 'discount' | 'free_item' | 'cashback';
  discountType?: 'percent' | 'fixed';
  rewardValue: number; // e.g. 20 for 20%, or 50 for ₹50
  title: string;
  description: string;
}

export interface Participant {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  role?: string;
  joinedAt?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  desc: string;
  isVeg: boolean;
  popular?: boolean;
}

export interface Craving {
  id: number;
  restaurant: string;
  normalizedRestaurant: string;
  food: string;
  category: FoodCategory;
  campus: string;
  zone: string;
  timeWindow: string;
  count: number;
  target: number; // Maximum / final tier target
  deal: string; // Dynamic based on tier
  dealDiscount: number; // Applied discount at current tier
  priceRange: string;
  budgetPerPerson: number;
  image: string;
  deadlineMinutes: number;
  status: DealLifecycleState;
  tiers: DealTier[];
  currentTierId: string | null;
  createdAt: number;
  expiresAt: number;
  joined?: boolean;
  isUserCreated?: boolean;
  participants: Participant[];
  menu: MenuItem[];
  unlockedAt?: number;
  lockedAt?: number;
  expiredAt?: number;
  celebrationShown?: boolean;
}

export interface TierProgressSummary {
  currentTier: DealTier | null;
  nextTier: DealTier | null;
  remainingToNextTier: number;
  tierProgressPercentage: number;
  overallProgressPercentage: number;
  bestAvailableReward: string;
  isFullyUnlocked: boolean;
  unlockedTiersCount: number;
}

export interface CravingInput {
  restaurant: string;
  food: string;
  category: FoodCategory;
  campus: string;
  zone: string;
  timeWindow: string;
  budget: number;
  target: number;
}

export interface MatchScoreBreakdown {
  score: number;
  tier: 'STRONG' | 'COMPATIBLE' | 'WEAK';
  tierLabel: string;
  reasons: string[];
  matchedCraving: Craving;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PlacedOrder {
  orderId: string;
  cravingId: number;
  restaurant: string;
  zone: string;
  items: OrderItem[];
  itemTotal: number;
  dealDiscount: number;
  finalTotal: number;
  isRegularPriceFallback?: boolean;
  placedAt: string;
  estimatedDelivery: string;
  status: 'ORDER_PLACED' | 'KITCHEN_ACCEPTED' | 'ON_THE_WAY';
}

export interface CampusOption {
  id: string;
  name: string;
  city: string;
  zones: string[];
  activeCravingsCount: number;
  studentsCount: number;
}
