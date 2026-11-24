import { useState, useEffect, useRef } from 'react';
import { getCountdownStatus, CountdownResult } from '../engine/countdown';
import { Craving } from '../types';

/**
 * Custom hook to drive second-by-second countdowns for active cravings.
 * Prevents duplicate expiration triggers using an internal processed set.
 */
export function useDealTimer(
  cravings: Craving[],
  onCravingExpired?: (cravingId: number) => void
) {
  const [now, setNow] = useState<number>(Date.now());
  const onCravingExpiredRef = useRef(onCravingExpired);
  onCravingExpiredRef.current = onCravingExpired;

  // Track cravings that have already had their expiration dispatched
  const processedExpirationsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      cravings.forEach((c) => {
        if (
          c.status === 'ACTIVE' &&
          c.expiresAt &&
          currentNow >= c.expiresAt &&
          !processedExpirationsRef.current.has(c.id)
        ) {
          processedExpirationsRef.current.add(c.id);
          onCravingExpiredRef.current?.(c.id);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cravings]);

  // Clean up processed set if a craving was reset back to active
  useEffect(() => {
    cravings.forEach((c) => {
      if (c.status === 'ACTIVE' && c.expiresAt > Date.now()) {
        processedExpirationsRef.current.delete(c.id);
      }
    });
  }, [cravings]);

  const getTimerForCraving = (expiresAt: number, status: string): CountdownResult => {
    if (status === 'UNLOCKED') {
      return { remainingSeconds: 0, formatted: 'UNLOCKED', isExpired: false, isUrgent: false };
    }
    if (status === 'EXPIRED') {
      return { remainingSeconds: 0, formatted: 'ENDED', isExpired: true, isUrgent: false };
    }
    return getCountdownStatus(expiresAt, now);
  };

  return { now, getTimerForCraving };
}
