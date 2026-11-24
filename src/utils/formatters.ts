/**
 * Format currency in Indian Rupee format
 */
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

/**
 * Generate initial avatar letters
 */
export function getInitials(name: string): string {
  if (!name) return 'CC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate friendly countdown string
 */
export function formatMinutesLeft(minutes: number): string {
  if (minutes <= 0) return 'Ending now';
  if (minutes === 1) return '1 min left';
  return `${minutes} mins left`;
}
