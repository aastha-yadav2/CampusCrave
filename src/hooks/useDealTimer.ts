import { useState, useEffect, useRef } from 'react';
import { getCountdownStatus, CountdownResult } from '../engine/countdown';
import { Craving } from '../types';

/**
 * Custom hook to drive real second-by-second countdowns for active cravings.
 * Avoids interval drift by deriving remaining seconds from Date.now() wall-clock time.
 */
export function useDealTimer(
  cravings: Craving[],
  onCravingExpired?: (cravingId: number) => void
) {
  const [now, setNow] = useState<number>(Date.now());
  const onCravingExpiredRef = useRef(onCravingExpired);
  onCravingExpiredRef.current = onCravingExpired;

  useEffect(() => {
    const timer = setInterval(() => {
      const currentNow = Date.now();
      setNow(currentNow);

      // Check if any active craving just crossed expiration
      cravings.forEach((c) => {
        if (c.status === 'ACTIVE' && c.expiresAt && currentNow >= c.expiresAt) {
          onCravingExpiredRef.current?.(c.id);
        }
      });
    }, 1000);

    return () => clearInterval(timer);
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
