const currencySymbols: Record<string, string> = {
    EUR: "€",
    USD: "$",
};

export function getCurrencySymbol(currency: string): string {
    return currencySymbols[currency] ?? currency;
}
