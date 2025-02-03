import { locale, waitLocale } from "svelte-i18n";
import { browser } from "$app/environment";
import "$lib/i18n";
import type { LayoutLoad } from "./$types";
import { defaultLocale } from "$lib/i18n";

export const load: LayoutLoad = async () => {
  try {
    if (browser) {
      await locale.set(window.navigator.language);
    }
    await waitLocale();
  } catch (error) {
    console.error("Failed to load locale:", error);
    if (browser) {
      await locale.set(defaultLocale);
    }
  }
  return {};
};
