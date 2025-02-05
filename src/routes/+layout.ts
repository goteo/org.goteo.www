import type { LayoutLoad } from "./$types";
import { initI18n } from "$lib/i18n";

export const load: LayoutLoad = async () => {
  await initI18n();
  return {};
};
