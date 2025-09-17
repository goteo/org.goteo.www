let runtimeEnv: Record<string, string>;

if (typeof import.meta !== "undefined" && import.meta.env) {
    runtimeEnv = import.meta.env;
} else if (typeof process !== "undefined" && process.env) {
    runtimeEnv = process.env as Record<string, string>;
} else {
    throw new Error("Runtime not supported");
}

export function getEnvVar(key: string): string {
    const val = runtimeEnv[key];

    if (!val) {
        throw new Error(`Missing env variable: ${key}`);
    }

    return val;
}

export function getBaseUrl(): string {
    return getEnvVar("PUBLIC_API_URL");
}

export function getApiVersion(): string {
    return getEnvVar("PUBLIC_API_VERSION");
}

export function getPlatoniqAccountingId(): string {
    return getEnvVar("PUBLIC_PLATONIQ_ACCOUNTING_ID");
}

export function getFacebookAppId(): string {
    return getEnvVar("PUBLIC_FACEBOOK_APP_ID");
}

export function getDefaultCurrency(): string {
    return getEnvVar("PUBLIC_DEFAULT_CURRENCY");
}

export function getDefaultLanguage(): string {
    if (typeof navigator !== "undefined" && navigator.language) {
        return navigator.language;
    }
    return getEnvVar("PUBLIC_DEFAULT_LANGUAGE");
}
