<script lang="ts">
    import iso3166 from "iso-3166-2";
    import { type ClassNameValue } from "tailwind-merge";

    import { locale } from "../../i18n/store";
    import MapIcon from "../icons/Location.svelte";
    import Tag from "../library/tags/Tag.svelte";

    import type { Locale } from "../../i18n/locales";
    import type { Territory } from "../../openapi/client";

    let {
        territory,
        lang: initialLang = undefined,
        class: classes = "",
        iconSize = "32",
    }: {
        territory: Territory;
        lang?: Locale;
        class?: ClassNameValue;
        iconSize?: string | number;
    } = $props();

    let lang = $derived(initialLang || $locale);

    function displayName(territory: Territory): string {
        const countryNames = new Intl.DisplayNames(lang, { type: "region" });
        const country = countryNames.of(territory.country!);

        const tag = territory.subLvl2 ?? territory.subLvl1;
        if (!tag) {
            return country!;
        }

        const iso = iso3166.subdivision(tag!);

        if (!iso) {
            return country!;
        }

        const subdivision = iso.name.split(",")[0];

        return `${subdivision}, ${country}`;
    }
</script>

<Tag class={classes}>
    <MapIcon width={iconSize} height={iconSize} />
    <span>{displayName(territory)}</span>
</Tag>
