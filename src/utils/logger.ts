/**
 * Logger Utility
 *
 * Provides consistent logging across the application with environment-aware behavior.
 * - info: Only logs in DEV mode
 * - warn: Always logs
 * - error: Always logs
 *
 * Usage:
 * ```ts
 * import { logger } from '@/utils/logger';
 *
 * logger.info('[Component]', 'Debug message');
 * logger.warn('[Component]', 'Warning message');
 * logger.error('[Component]', 'Error message', error);
 * ```
 */

const isDev = import.meta.env.DEV;

export const logger = {
    /**
     * Log informational messages (only in DEV mode)
     */
    info: (...args: unknown[]): void => {
        if (isDev) {
            console.log(...args);
        }
    },

    /**
     * Log warning messages (always logged)
     */
    warn: (...args: unknown[]): void => {
        console.warn(...args);
    },

    /**
     * Log error messages (always logged)
     */
    error: (...args: unknown[]): void => {
        console.error(...args);
    },
};
