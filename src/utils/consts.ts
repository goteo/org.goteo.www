import dotenv from "dotenv";

export function getRuntimeEnvs() {
    if (typeof process !== "undefined") {
        if (import.meta.env.DEV) {
            dotenv.config({ override: true });
        }

        return process.env;
    }

    if (typeof import.meta.env !== "undefined") {
        return import.meta.env;
    }

    throw new Error("Runtime not supported");
}

export function getEnv(key: string): string {
    const envs = getRuntimeEnvs();
    const envVar = envs[key];

    if (envVar === undefined) {
        throw new Error(`Missing env variable: ${key}`);
    }

    if (envVar === null || envVar === "") {
        throw new Error(`Env variable ${key} is empty`);
    }

    return envVar;
}

export function getEnvFromAstroRequest(key: string, astroRequest: any): string {
    if (astroRequest?.locals?.runtime?.env?.[key]) {
        const envVar = astroRequest.locals.runtime.env[key];
        if (envVar === null || envVar === "") {
            throw new Error(`Runtime env variable ${key} is empty`);
        }
        return envVar;
    }

    return getEnv(key);
}

export function getApiUrl(): string {
    return getEnv("PUBLIC_API_URL");
}

export function getApiVersion(): string {
    return getEnv("PUBLIC_API_VERSION");
}

export function getPlatoniqAccountingId(): string {
    return getEnv("PUBLIC_PLATONIQ_ACCOUNTING_ID");
}

export function getFacebookAppId(): string {
    return getEnv("PUBLIC_FACEBOOK_APP_ID");
}

export function getDefaultCurrency(): string {
    return getEnv("PUBLIC_CURRENCY_DEFAULT");
}

export function getDefaultLanguage(): string {
    return getEnv("PUBLIC_LANGUAGE_DEFAULT");
}
