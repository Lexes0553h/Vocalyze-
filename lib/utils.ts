import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const envUrl = process.env.NEXT_PUBLIC_APP_URL.trim();
    if (envUrl) {
      return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
    }
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

