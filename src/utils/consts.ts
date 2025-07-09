import dotenv from "dotenv";

let dotenvLoaded = false;

function loadEnv() {
    if (typeof process !== "undefined" && !dotenvLoaded) {
        dotenv.config();
        dotenvLoaded = true;
    }
}

export function getEnvVariable(key: string): string {
    loadEnv();

    const envVar = import.meta.env?.[key] ?? process.env?.[key];

    if (envVar === undefined) {
        throw new Error(`Missing env variable: ${key}`);
    }

    if (envVar === null || envVar === "") {
        throw new Error(`Env variable ${key} is empty`);
    }

    return envVar;
}

export function getBaseUrl(): string {
    return getEnvVariable("PUBLIC_API_URL");
}

export function getApiVersion(): string {
    return getEnvVariable("PUBLIC_API_VERSION");
}

export function getPlatoniqAccountingId(): string {
    return getEnvVariable("PUBLIC_PLATONIQ_ACCOUNTING_ID");
}

export function getFacebookAppId(): string {
    return getEnvVariable("PUBLIC_FACEBOOK_APP_ID");
}

export function getDefaultCurrency(): string {
    return getEnvVariable("PUBLIC_CURRENCY_DEFAULT");
}

export function getDefaultLanguage(): string {
    return getEnvVariable("PUBLIC_LANGUAGE_DEFAULT");
}
