import { labels } from "./locales/index";

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

type TranslationOptions = {
    allowHTML?: boolean;
};

/**
 * Hook to retrieve a translation function based on the selected language, supporting interpolation and optional HTML escaping.
 *
 * @template T - The key of the language within the `labels` object.
 * @param {T} lang - The language code to use for translations.
 * @returns {(key: string, vars?: Record<string, string | number>, options?: TranslationOptions) => string} - A function that takes a translation key, optional interpolation variables, and optional settings.
 */
export function useTranslations<T extends keyof typeof labels>(lang: T) {
    return (
        key: string,
        vars?: Record<string, string | number>,
        options?: TranslationOptions,
    ): string => {
        let text =
            getNestedValue(labels[lang], key) ?? getNestedValue(labels[defaultLang], key) ?? key;

        const allowHTML = options?.allowHTML ?? false;

        if (vars) {
            const escape = allowHTML ? (v: string) => v : escapeHTML;
            Object.entries(vars).forEach(([varKey, value]) => {
                text = text.replace(
                    new RegExp(`\\{\\{\\s*${varKey}\\s*\\}\\}`, "g"),
                    escape(String(value)),
                );
            });
        }

        return text;
    };
}

/**
 * Escapes HTML special characters to prevent XSS.
 *
 * @param {string} unsafe - The string to escape.
 * @returns {string} - The escaped string.
 */
function escapeHTML(unsafe: string): string {
    return unsafe.replace(/[&<>"']/g, (match) => {
        const map: Record<string, string> = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
        };
        return map[match];
    });
}
