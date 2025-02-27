import type { LayoutLoad } from "./$types";
import { initI18n } from "$lib/i18n";

export const load: LayoutLoad = async ({ data }) => {
  console.debug("/+layout#load", data);
  await initI18n();

  const { user } = data;
  return { user };
};
