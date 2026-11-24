/**
 * Real timestamp-derived countdown calculation.
 * Prevents clock drift and ensures page reload preserves exact expiration.
 */

export interface CountdownResult {
  remainingSeconds: number;
  formatted: string;
  isExpired: boolean;
  isUrgent: boolean; // less than 2 minutes left
}

export function calculateRemainingSeconds(expiresAt: number, now: number = Date.now()): number {
  if (!expiresAt) return 0;
  const diffMs = expiresAt - now;
  return Math.max(0, Math.floor(diffMs / 1000));
}

export function formatCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');
  return `${mm}:${ss}`;
}

export function getCountdownStatus(expiresAt: number, now: number = Date.now()): CountdownResult {
  const remainingSeconds = calculateRemainingSeconds(expiresAt, now);
  return {
    remainingSeconds,
    formatted: formatCountdown(remainingSeconds),
    isExpired: remainingSeconds <= 0,
    isUrgent: remainingSeconds > 0 && remainingSeconds <= 120,
  };
}
