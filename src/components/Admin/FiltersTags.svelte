<script lang="ts">
    import CloseIcon from "../../svgs/CloseIcon.svelte";
    import Tag from "../library/Tag.svelte";
    import { locale } from "../../i18n/store";
    import type { Locale } from "../../i18n/locales";
    import { t } from "../../i18n/store";
    import type { ApiGatewayChargesGetCollectionData } from "../../openapi/client";

    let { title, filters, onCloseFilter } = $props<{
        title: string;
        filters: ApiGatewayChargesGetCollectionData["query"];
        onCloseFilter: (filters: ApiGatewayChargesGetCollectionData["query"]) => void;
    }>();

    type FilterTags = { title: string; value?: string; values?: { from?: string; to?: string } }[];

    let tags: FilterTags | undefined = $state(undefined);
    let isVisible = $state(true);

    function closeTag(filter: any, index: number) {
        filter.value = "";
        onCloseFilter(filter);
        isVisible = false;
    }

    function formatTags(tags: FilterTags, locale?: Locale) {
        if (tags === undefined) return;
        tags.forEach((tag) => {
            if (tag.title === "rangeAmount") {
            } else if (tag.values?.from && tag.values?.to) {
                const options: Intl.DateTimeFormatOptions = {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                };

                tag.values.from = new Date(tag.values.from).toLocaleDateString(locale, options);
                tag.values.to = new Date(tag.values.to).toLocaleDateString(locale, options);
            } else tag.value = $t(`contributions.filters.${tag.title}.options.${tag.value}`);
        });

        return tags;
    }

    $effect(() => {
        if (filters["dateCreated[after]"] || filters["dateCreated[before]"]) {
            let date = { from: filters["dateCreated[after]"], to: filters["dateCreated[before]"] };
            let indexDateFrom = filters.indexOf("dateCreated[after]");
            let indexDateTo = filters.indexOf("dateCreated[before]");

            filters.push(date);
            filters.splice(indexDateFrom, 1);
            filters.splice(indexDateTo, 1);
        }

        tags = formatTags(
            Object.keys(filters)
                .map((filter) => {
                    let filterType: keyof ApiGatewayChargesGetCollectionData[`query`];
                    if (typeof filterType) {
                        return { title: filter, values: { ...filters[filter] } };
                    } else return { title: filter, value: filters[filter] };
                })
                .filter((filter) => {
                    if (filter.value === undefined || filter.values)
                        return filter.value !== undefined;
                    else return filter.value !== "";
                }),
            $locale,
        );
    });
</script>

<div class="flex gap-4">
    <h1 class="text-2xl/8 font-bold text-black">
        {title}
    </h1>

    {#each tags as tag, i}
        <Tag variant={"bold"}>
            {#if tag.values}
                {`${tag.values.from} - ${tag.values.to}`}
            {:else}
                {tag.value}
            {/if}
            <button onclick={() => closeTag(tag.title, i)} class="size-auto">
                <CloseIcon class="size-[15px]" />
            </button>
        </Tag>
    {/each}
</div>
