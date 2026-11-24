import type { Craving, PlacedOrder, DealLifecycleState } from '../types/index.ts';
import { INITIAL_CRAVINGS } from '../data/mockCravings.ts';
import { evaluateCravingExpiry } from './dealEngine.ts';

const CRAVINGS_KEY = 'campus_crave_live_cravings_v3';
const ORDERS_KEY = 'campus_crave_placed_orders_v3';
const DEMO_MODE_KEY = 'campus_crave_demo_mode_active';

const VALID_STATUSES: DealLifecycleState[] = ['ACTIVE', 'LOCKING', 'UNLOCKED', 'EXPIRED', 'CANCELLED'];

/**
 * Validates whether an object adheres to a valid Craving shape
 */
function isValidCravingShape(obj: any): obj is Craving {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.id !== 'number') return false;
  if (typeof obj.restaurant !== 'string' || !obj.restaurant.trim()) return false;
  if (!VALID_STATUSES.includes(obj.status)) return false;
  if (typeof obj.target !== 'number' || obj.target <= 0) return false;
  if (!Array.isArray(obj.participants)) return false;
  if (typeof obj.expiresAt !== 'number') return false;
  return true;
}

/**
 * Loads, validates, repairs, and restores cravings from LocalStorage.
 */
export function loadStoredCravings(): Craving[] {
  try {
    const raw = localStorage.getItem(CRAVINGS_KEY);
    if (!raw) {
      return INITIAL_CRAVINGS;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return INITIAL_CRAVINGS;
    }

    const now = Date.now();
    const validated: Craving[] = [];

    for (const item of parsed) {
      if (!isValidCravingShape(item)) {
        continue;
      }

      // Repair count parity: participant count must match array length
      const repaired: Craving = {
        ...item,
        count: item.participants.length,
      };

      // Re-evaluate expiry for active items if timestamp has passed
      const { craving } = evaluateCravingExpiry(repaired, now);
      validated.push(craving);
    }

    return validated.length > 0 ? validated : INITIAL_CRAVINGS;
  } catch (e) {
    console.warn('Failed to parse or validate stored cravings, falling back to initial data:', e);
    return INITIAL_CRAVINGS;
  }
}

/**
 * Persists validated cravings array to LocalStorage.
 */
export function saveStoredCravings(cravings: Craving[]): void {
  try {
    if (!Array.isArray(cravings)) return;
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(cravings));
  } catch (e) {
    console.error('Failed to save cravings to localStorage:', e);
  }
}

/**
 * Loads and validates order history from LocalStorage.
 */
export function loadStoredOrders(): PlacedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    // Filter valid orders
    return parsed.filter(
      (o: any) =>
        o &&
        typeof o === 'object' &&
        typeof o.orderId === 'string' &&
        typeof o.finalTotal === 'number' &&
        Array.isArray(o.items)
    );
  } catch {
    return [];
  }
}

/**
 * Persists orders to LocalStorage.
 */
export function saveStoredOrders(orders: PlacedOrder[]): void {
  try {
    if (!Array.isArray(orders)) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage:', e);
  }
}

export function loadDemoModeState(): boolean {
  try {
    const raw = localStorage.getItem(DEMO_MODE_KEY);
    return raw ? JSON.parse(raw) : true;
  } catch {
    return true;
  }
}

export function saveDemoModeState(isActive: boolean): void {
  try {
    localStorage.setItem(DEMO_MODE_KEY, JSON.stringify(isActive));
  } catch {}
}

/**
 * Resets local storage and returns clean seeded cravings.
 */
export function clearAndResetStorage(): Craving[] {
  try {
    localStorage.removeItem(CRAVINGS_KEY);
    localStorage.removeItem(ORDERS_KEY);
  } catch {}
  return INITIAL_CRAVINGS;
}
