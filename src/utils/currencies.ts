import { getDefaultCurrency, getDefaultLanguage } from "./consts";
import { currencySymbols } from "./currencyData";

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
