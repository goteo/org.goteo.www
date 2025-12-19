import type { Locale } from "../i18n/locales";

export function formatDate(date: Date, locale: Locale) {
    const options: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "short",
        year: "numeric",
    };

    return date.toLocaleDateString(locale, options);
}
