import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS classes with conflict resolution.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an amount in Rwandan Francs.
 */
export function formatRWF(amount: number, currency = 'RWF'): string {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats a date for display.
 */
export function formatDate(date: string | Date, locale = 'en'): string {
  return new Intl.DateTimeFormat(locale === 'rw' ? 'rw-RW' : 'en-RW', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}
