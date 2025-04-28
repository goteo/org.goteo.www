import ca from "./ca.json";
import en from "./en.json";
import es from "./es.json";

export const labels = { es, en, ca };
export type Locale = keyof typeof labels;

export const languagesList: Record<Locale, string> = {
    es: "Español",
    en: "English",
    ca: "Català",
};
