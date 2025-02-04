import { isValidLocale } from "$lib/i18n";

export const match = (param: string) => {
  return isValidLocale(param);
};
