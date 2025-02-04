import { redirect } from "@sveltejs/kit";
import type { LayoutLoad } from "./$types";
import { getBrowserLocale, hasTranslations, isValidLocale } from "$lib/i18n";
import { config } from "$lib/i18n/config";

export const load: LayoutLoad = async ({ params, url, parent }) => {
  const parentData = await parent();
  const urlLocale = params.locale;

  if (!urlLocale) {
    const browserLocale = getBrowserLocale();
    const locale = browserLocale || config.defaultLocale;
    return { locale, ...parentData };
  }

  if (!isValidLocale(urlLocale) || !hasTranslations(urlLocale)) {
    const redirectUrl = url.pathname.replace(`/${urlLocale}`, "");
    throw redirect(301, redirectUrl);
  }

  return { locale: urlLocale, ...parentData };
};
