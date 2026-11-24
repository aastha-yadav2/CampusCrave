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

export interface Participant {
  id: string;
  name: string;
  initial: string;
  avatarBg: string;
  role?: string;
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
  target: number;
  deal: string;
  dealDiscount: number; // e.g. ₹35 or ₹40 off
  priceRange: string;
  budgetPerPerson: number;
  image: string;
  deadlineMinutes: number;
  status: 'ACTIVE' | 'DEAL_UNLOCKED' | 'ORDERING' | 'EXPIRED';
  joined?: boolean;
  isUserCreated?: boolean;
  participants: Participant[];
  menu: MenuItem[];
  unlockedAt?: number;
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
