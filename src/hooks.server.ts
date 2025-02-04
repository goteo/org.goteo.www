import { sequence } from "@sveltejs/kit/hooks";
import { init, locale } from "svelte-i18n";
import type { Handle } from "@sveltejs/kit";
import { config, hasTranslations, isValidLocale } from "$lib/i18n";

const i18n: Handle = async ({ event, resolve }) => {
  const urlLocale = event.params.locale;
  const acceptLang = event.request.headers.get("accept-language")?.split(",")[0]?.split("-")[0];

  let resolvedLocale = config.defaultLocale;

  if (urlLocale && isValidLocale(urlLocale) && hasTranslations(urlLocale)) {
    resolvedLocale = urlLocale;
  } else if (acceptLang && isValidLocale(acceptLang) && hasTranslations(acceptLang)) {
    resolvedLocale = acceptLang;
  }

  // Initialize i18n for SSR if not already initialized
  try {
    locale.set(resolvedLocale);
  } catch {
    init({
      fallbackLocale: config.defaultLocale,
      initialLocale: resolvedLocale,
    });
  }

  event.locals.locale = resolvedLocale;
  return resolve(event);
};

export const handle = sequence(i18n);
