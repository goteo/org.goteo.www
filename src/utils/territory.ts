import type { Territory } from "../openapi/client";
import iso3166 from "iso-3166-2";

export function getTerritoryDisplayName(territory: Territory, lang: Intl.LocalesArgument): string {
    const countryNames = new Intl.DisplayNames(lang, { type: "region" });
    const country = countryNames.of(territory.country!);

    const tag = territory.subLvl2 ?? territory.subLvl1;
    if (!tag) {
        return country!;
    }

    const iso = iso3166.subdivision(tag!);
    if (!iso || !iso.name) {
        return country!;
    }

    const subdivision = iso.name.split(",")[0];

    return `${subdivision}, ${country}`;
}