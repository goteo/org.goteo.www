import { getBaseUrl } from "../utils/consts";

import type { CreateClientConfig } from "./client/client.gen";

// Authentication error types for better error handling
export enum AuthErrorType {
    INVALID_TOKEN = "INVALID_TOKEN",
    EXPIRED_TOKEN = "EXPIRED_TOKEN",
    MISSING_TOKEN = "MISSING_TOKEN",
    NETWORK_ERROR = "NETWORK_ERROR",
    SERVER_ERROR = "SERVER_ERROR",
}

export interface AuthError {
    type: AuthErrorType;
    status?: number;
    originalError?: Error;
    shouldRetry?: boolean;
}

/**
 * Creates authentication error from various error sources.
 * Note: This is an API-layer utility. Components should map the error type
 * to user-facing translated messages using the i18n system.
 */
export function createAuthError(error: unknown): AuthError {
    if (error instanceof Response) {
        switch (error.status) {
            case 401:
                return {
                    type: AuthErrorType.INVALID_TOKEN,
                    status: error.status,
                    shouldRetry: false,
                };
            case 403:
                return {
                    type: AuthErrorType.EXPIRED_TOKEN,
                    status: error.status,
                    shouldRetry: true,
                };
            case 0:
                return {
                    type: AuthErrorType.NETWORK_ERROR,
                    status: error.status,
                    shouldRetry: true,
                };
            default:
                return {
                    type: AuthErrorType.SERVER_ERROR,
                    status: error.status,
                    shouldRetry: true,
                };
        }
    }

    if (error instanceof Error) {
        if (error.name === "AbortError") {
            return {
                type: AuthErrorType.NETWORK_ERROR,
                originalError: error,
                shouldRetry: false,
            };
        }

        if (error.message.includes("fetch")) {
            return {
                type: AuthErrorType.NETWORK_ERROR,
                originalError: error,
                shouldRetry: true,
            };
        }
    }

    return {
        type: AuthErrorType.SERVER_ERROR,
        originalError: error instanceof Error ? error : new Error(String(error)),
        shouldRetry: true,
    };
}

/**
 * Get translation key for error type.
 * Components should use this with their i18n system to display user-facing messages.
 * Example: const message = t(getErrorTranslationKey(error.type));
 */
export function getErrorTranslationKey(errorType: AuthErrorType): string {
    const keyMap: Record<AuthErrorType, string> = {
        [AuthErrorType.INVALID_TOKEN]: "errors.api.invalidToken",
        [AuthErrorType.EXPIRED_TOKEN]: "errors.api.expiredToken",
        [AuthErrorType.MISSING_TOKEN]: "errors.api.missingToken",
        [AuthErrorType.NETWORK_ERROR]: "errors.api.networkError",
        [AuthErrorType.SERVER_ERROR]: "errors.api.serverError",
    };
    return keyMap[errorType];
}

/**
 * Simple client configuration
 */
export const createClientConfig: CreateClientConfig = (config) => {
    return {
        ...config,
        baseUrl: getBaseUrl(),
    };
};
