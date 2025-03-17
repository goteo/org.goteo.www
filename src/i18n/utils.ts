import { labels } from "./ui";

const defaultLang = "es";

/**
 * Retrieves a nested value from an object using a dot-separated path.
 *
 * @param {Record<string, unknown>} obj - The object to search within.
 * @param {string} path - The dot-separated path to the desired value.
 * @returns {string | undefined} - The retrieved value or `undefined` if not found.
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
    return path
        .split(".")
        .reduce<unknown>(
            (acc, part) =>
                acc && typeof acc === "object" ? (acc as Record<string, unknown>)[part] : undefined,
            obj,
        ) as string | undefined;
}

/**
 * Hook to retrieve a translation function based on the selected language.
 *
 * @template T - The key of the language within the `labels` object.
 * @param {T} lang - The language code to use for translations.
 * @returns {(key: string) => string} - A function that takes a translation key and returns the translated string.
 */
export function useTranslations<T extends keyof typeof labels>(lang: T) {
    return (key: string): string => {
        return getNestedValue(labels[lang], key) ?? getNestedValue(labels[defaultLang], key) ?? key;
    };
}
