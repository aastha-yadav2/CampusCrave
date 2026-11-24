import { Craving, PlacedOrder } from '../types';
import { INITIAL_CRAVINGS } from '../data/mockCravings';
import { evaluateCravingExpiry } from './dealEngine';

const CRAVINGS_KEY = 'campus_crave_live_cravings_v3';
const ORDERS_KEY = 'campus_crave_placed_orders_v3';
const DEMO_MODE_KEY = 'campus_crave_demo_mode_active';

export function loadStoredCravings(): Craving[] {
  try {
    const raw = localStorage.getItem(CRAVINGS_KEY);
    if (!raw) {
      return INITIAL_CRAVINGS;
    }
    const parsed: Craving[] = JSON.parse(raw);
    const now = Date.now();

    // Re-evaluate expiry for any active cravings on page reload
    return parsed.map((c) => {
      const { craving } = evaluateCravingExpiry(c, now);
      return craving;
    });
  } catch (e) {
    console.error('Failed to parse stored cravings:', e);
    return INITIAL_CRAVINGS;
  }
}

export function saveStoredCravings(cravings: Craving[]): void {
  try {
    localStorage.setItem(CRAVINGS_KEY, JSON.stringify(cravings));
  } catch (e) {
    console.error('Failed to save cravings to localStorage:', e);
  }
}

export function loadStoredOrders(): PlacedOrder[] {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredOrders(orders: PlacedOrder[]): void {
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders to localStorage:', e);
  }
}

export function loadDemoModeState(): boolean {
  try {
    const raw = localStorage.getItem(DEMO_MODE_KEY);
    return raw ? JSON.parse(raw) : true; // Default to true so judges can immediately see demo mode
  } catch {
    return true;
  }
}

export function saveDemoModeState(isActive: boolean): void {
  try {
    localStorage.setItem(DEMO_MODE_KEY, JSON.stringify(isActive));
  } catch {}
}

export function clearAndResetStorage(): Craving[] {
  try {
    localStorage.removeItem(CRAVINGS_KEY);
    localStorage.removeItem(ORDERS_KEY);
  } catch {}
  return INITIAL_CRAVINGS;
}
