<script lang="ts">
    import CloseIcon from "../../svgs/CloseIcon.svelte";
    import Tag from "../library/Tag.svelte";
    import { locale } from "../../i18n/store";
    import type { Locale } from "../../i18n/locales";
    import { t } from "../../i18n/store";
    import { apiGatewayChargesGetCollection } from "../../openapi/client";
    import type { GatewayCharge } from "../../openapi/client";

    let { title, filters } = $props<{
        title: string;
        filters?: any;
    }>();

    type FilterTags = { title: string; value?: string; values?: { from: string; to: string } }[];

    let tags: FilterTags | undefined = $state(undefined);

    function closeTag() {}

    function formatTags(tags: FilterTags, locale?: Locale) {
        if (tags === undefined) return;
        tags.forEach((tag) => {
            if (tag.title === "rangeAmount") {
            } else if (tag.values) {
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

    $effect(async (): Promise<void> => {
        const { data: charges, error: chargesError } = await apiGatewayChargesGetCollection({
            query: {
                
            },
        });

        tags = formatTags(
            Object.keys(filters)
                .map((filter: string) => {
                    
                    if (filter === "date") return { title: filter, values: { ...filters[filter] } };
                    else return { title: filter, value: filters[filter] };
                })
                .filter((filter) => {
                    if (filter.values)
                        return filter.values.from !== undefined || filter.values.to !== undefined;
                    else if (filter.title === "target") return filter.value !== undefined;
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

    {#each tags as tag}
        <Tag variant={"bold"}>
            {#if tag.values}
                {`${tag.values.from} - ${tag.values.to}`}
            {:else}
                {tag.value}
            {/if}
            <button onclick={closeTag} class="size-auto">
                <CloseIcon class="size-[15px]" />
            </button>
        </Tag>
    {/each}
</div>
