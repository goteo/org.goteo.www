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
    message: string;
    originalError?: Error;
    shouldRetry?: boolean;
}

/**
 * Creates authentication error from various error sources
 */
export function createAuthError(error: unknown): AuthError {
    if (error instanceof Response) {
        switch (error.status) {
            case 401:
                return {
                    type: AuthErrorType.INVALID_TOKEN,
                    message: "Authentication failed. Please check your credentials.",
                    shouldRetry: false,
                };
            case 403:
                return {
                    type: AuthErrorType.EXPIRED_TOKEN,
                    message: "Authentication token has expired. Please refresh your session.",
                    shouldRetry: true,
                };
            case 0:
                return {
                    type: AuthErrorType.NETWORK_ERROR,
                    message: "Network connection failed. Please check your internet connection.",
                    shouldRetry: true,
                };
            default:
                return {
                    type: AuthErrorType.SERVER_ERROR,
                    message: `Server error (${error.status}). Please try again later.`,
                    shouldRetry: true,
                };
        }
    }

    if (error instanceof Error) {
        if (error.name === "AbortError") {
            return {
                type: AuthErrorType.NETWORK_ERROR,
                message: "Request was cancelled.",
                originalError: error,
                shouldRetry: false,
            };
        }

        if (error.message.includes("fetch")) {
            return {
                type: AuthErrorType.NETWORK_ERROR,
                message: "Network connection failed. Please check your internet connection.",
                originalError: error,
                shouldRetry: true,
            };
        }
    }

    return {
        type: AuthErrorType.SERVER_ERROR,
        message: "An unexpected error occurred. Please try again.",
        originalError: error instanceof Error ? error : new Error(String(error)),
        shouldRetry: true,
    };
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
