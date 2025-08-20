import dotenv from "dotenv";

let dotenvLoaded = false;

function loadEnv() {
    if (typeof process !== "undefined" && !dotenvLoaded) {
        dotenv.config();
        dotenvLoaded = true;
    }
}

function getRuntimeEnv(request?: Request): Record<string, string> | undefined {
    if (request && typeof globalThis !== "undefined") {
        const astroGlobal = (globalThis as any).Astro;
        if (astroGlobal?.locals?.runtime?.env) {
            return astroGlobal.locals.runtime.env;
        }
    }

    if (typeof globalThis !== "undefined") {
        if ((globalThis as any).context?.env) {
            return (globalThis as any).context.env;
        }

        if ((globalThis as any).platform?.env) {
            return (globalThis as any).platform.env;
        }
    }

    return undefined;
}

export function getEnvVariable(key: string, request?: Request): string {
    loadEnv();

    if (request) {
        const runtimeEnv = getRuntimeEnv(request);
        if (runtimeEnv && runtimeEnv[key] !== undefined) {
            const envVar = runtimeEnv[key];
            if (envVar === null || envVar === "") {
                throw new Error(`Runtime env variable ${key} is empty`);
            }
            return envVar;
        }
    }

    const envVar = import.meta.env?.[key] ?? process.env?.[key];

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

    return getEnvVariable(key);
}

export function getBaseUrl(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("API_URL", astroRequest) : getEnvVariable("API_URL");
}

export function getApiVersion(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("API_VERSION", astroRequest) : getEnvVariable("API_VERSION");
}

export function getPlatoniqAccountingId(): string {
    return getEnvVariable("PUBLIC_PLATONIQ_ACCOUNTING_ID");
}

export function getFacebookAppId(): string {
    return getEnvVariable("PUBLIC_FACEBOOK_APP_ID");
}

export function getDefaultCurrency(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("CURRENCY_DEFAULT", astroRequest) : getEnvVariable("CURRENCY_DEFAULT");
}

export function getDefaultLanguage(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("LANGUAGE_DEFAULT", astroRequest) : getEnvVariable("LANGUAGE_DEFAULT");
}

export function getPrivateApiUrl(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("API_URL", astroRequest) : getEnvVariable("API_URL");
}

export function getPrivateApiVersion(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("API_VERSION", astroRequest) : getEnvVariable("API_VERSION");
}

export function getPrivateCurrencyDefault(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("CURRENCY_DEFAULT", astroRequest) : getEnvVariable("CURRENCY_DEFAULT");
}

export function getPrivateLanguageDefault(astroRequest?: any): string {
    return astroRequest ? getEnvFromAstroRequest("LANGUAGE_DEFAULT", astroRequest) : getEnvVariable("LANGUAGE_DEFAULT");
}