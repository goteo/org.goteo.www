<script lang="ts">
    import BookmarkIcon from "../svgs/BookmarkIcon.svelte";
    import MapIcon from "../svgs/MapIcon.svelte";
    import { t } from "../i18n/store";
    import type { Project, Territory } from "../openapi/client";
    import iso3166 from "iso-3166-2";
    import { getTerritoryTag } from "../utils/getTerritoryTag";

    export let lang: string;
    export let project: Project;

    function displayName(territory: Territory) {
        const countryNames = new Intl.DisplayNames(lang, { type: "region" });
        const country = countryNames.of(territory.country);

        const tag = getTerritoryTag(territory);
        if (!tag || tag === territory.country) {
            return country;
        }

        const iso = iso3166.subdivision(tag!);

        return iso?.name;
    }
</script>

<div class="flex w-auto gap-2">
    <div class="border-tertiary flex items-center gap-2 rounded-sm border px-2 py-1">
        <BookmarkIcon />
        {$t(`categories.${project.category}`)}
    </div>
    <div class="border-tertiary flex items-center gap-2 rounded-sm border px-2 py-1">
        <MapIcon />{displayName(project.territory)}
    </div>
</div>
