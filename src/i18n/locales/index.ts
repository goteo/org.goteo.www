import en from "./en.json";
import es from "./es.json";

export const labels = { es, en };
export type Locale = keyof typeof labels;

export const languagesList: Record<Locale, string> = {
    es: "Español",
    en: "English",
};
