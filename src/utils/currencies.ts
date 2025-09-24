import { getDefaultCurrency, getDefaultLanguage } from "./consts";
import { currencySymbols } from "./currencyData";

function getSeparators(currency: string) {
    const locale = getDefaultLanguage();
    const example = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(1234567.89);

    const parts = example.match(/1(.+)234(.+)567(.+)89/);
    if (!parts) throw new Error("Unable to detect separators from locale");

    const groupSep = parts[1];
    const decimalSep = parts[3];

    return { groupSep, decimalSep };
}

/**
 * Parse a currency-like numeric string into a number
 * @param value {string}
 */
export function parseCurrency(value: string, currency?: string): number {
    if (currency === undefined) currency = getDefaultCurrency();
    const locale = getDefaultLanguage();

    const { groupSep, decimalSep } = getSeparators(currency);
    const { minimumFractionDigits: scale } = new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
    }).resolvedOptions();

    let cleaned = value
        .replace(new RegExp("\\" + groupSep, "g"), "")
        .replace(new RegExp("\\" + decimalSep), ".")
        .replace(/[^0-9.]/g, "");

    let [intPart, decPart = ""] = cleaned.split(".");

    decPart = decPart.padEnd(scale!, "0").slice(0, scale);

    const result = intPart + decPart;

    return parseInt(result, 10);
}


export function formatCurrency(
    amount?: number,
    currency?: string | null,
    options: { asLocaleString: boolean } = { asLocaleString: true },
): string {
    if (amount === undefined) return "";
    if (currency === undefined || currency === null) currency = getDefaultCurrency();

    const currencyData = currencySymbols[currency];
    if (!currencyData) return "";

    const { decimals } = currencyData;
    const rawAmount = amount / Math.pow(10, decimals);
    const hasDecimals = rawAmount % 1 !== 0;
    const formattedAmount = hasDecimals ? rawAmount.toFixed(decimals) : rawAmount.toFixed(0);

    const asLocaleString = options.asLocaleString;

    const locale = getDefaultLanguage();
    const formatter = new Intl.NumberFormat(locale, {
        currency,
        style: "currency",
        minimumFractionDigits: 0,
    });

    return asLocaleString ? formatter.format(rawAmount) : formattedAmount;
}

export function getUnit(currency?: string): number {
    if (!currency) return 0;
    const currencyData = currencySymbols[currency];
    if (!currencyData) return 0;

    const { decimals } = currencyData;

    return Math.pow(10, decimals);
}

export function defaultCurrency(): string {
    const defaultCurrency = getDefaultCurrency();
    return defaultCurrency;
}
