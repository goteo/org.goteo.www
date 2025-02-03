import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";
import type { SupportedLocale } from "./types";

const defaultLocale: SupportedLocale = "es";
const supportedLocales: SupportedLocale[] = ["en", "es"];

register("en", () => import("./locales/en.json").catch(() => ({})));
register("es", () => import("./locales/es.json").catch(() => ({})));

/**
 * Determines the initial locale based on the following priority:
 * 1. Previously saved locale in localStorage
 * 2. Browser's language
 * 3. Default locale
 */
const getInitialLocale = (): SupportedLocale => {
  if (!browser) return defaultLocale;

  try {
    const savedLocale = localStorage.getItem("locale") as SupportedLocale;
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }

    const browserLocale = window.navigator.language.split(
      "-",
    )[0] as SupportedLocale;
    return supportedLocales.includes(browserLocale)
      ? browserLocale
      : defaultLocale;
  } catch {
    return defaultLocale;
  }
};

init({
  fallbackLocale: defaultLocale,
  initialLocale: getInitialLocale(),
});

export { supportedLocales, defaultLocale };
