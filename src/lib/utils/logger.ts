import { isDev } from "@/constants/initial-values";

/**
 * Centralized Logger Utility
 *
 * ✅ Automatically disables logs in production.
 * ✅ Keeps warnings & errors if you prefer.
 * ✅ Helps you migrate away from raw console.* usage.
 */
export const Logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },

  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },

  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },

  error: (...args: unknown[]) => {
    // Always show errors, even in production
    console.error(...args);
  },

  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
};
