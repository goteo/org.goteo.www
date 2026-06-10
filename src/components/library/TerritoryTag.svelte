<script lang="ts">
    import iso3166 from "iso-3166-2";

    import MapIcon from "../icons/Location.svelte";
    import { locale } from "../../i18n/store";
    import { getTerritoryTag } from "../../utils/getTerritoryTag";
    import Tag from "./Tag.svelte";

    import type { Locale } from "../i18n/locales";
    import type { Territory } from "../openapi/client";

    let {
        territory,
        lang: initialLang = undefined,
    }: {
        territory: Territory;
        lang?: Locale;
    } = $props();

    const lang = initialLang || $locale;

    function displayName(territory: Territory) {
        const countryNames = new Intl.DisplayNames(lang, { type: "region" });
        const country = countryNames.of(territory.country!);

        const tag = getTerritoryTag(territory);
        if (!tag || tag === territory.country) {
            return country;
        }

        const iso = iso3166.subdivision(tag!);

        if (!iso) {
            return country;
        }

        const subdivision = iso.name.split(",")[0];

        return `${subdivision}, ${country}`;
    }
</script>

<Tag>
    <MapIcon width="24" height="24" />
    <span>{displayName(territory)}</span>
</Tag>
