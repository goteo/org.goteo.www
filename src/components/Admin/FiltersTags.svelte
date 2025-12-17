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

    type FilterTag = { title: string; value?: string; values?: { from?: string; to?: string } };
    type FilterTags = FilterTag[];

    let tags: FilterTags | undefined = $state(undefined);
    let dateTag: FilterTag | undefined = $state(undefined);

    function closeTag(tag: FilterTag) {
        if (tag.values?.from && tag.values?.to) {
            onCloseFilter({
                ...filters,
                ["dateCreated[after]"]: undefined,
                ["dateCreated[before]"]: undefined,
            });

            dateTag = undefined;
        } else {
            onCloseFilter({
                ...filters,
                [tag.title]: undefined,
            });
        }
    }

    function formatTags(tags: FilterTags, locale?: Locale) {
        if (tags === undefined) return;

        tags.map((tag) => {
            if (tag.values?.from && tag.values?.to) {
                const options: Intl.DateTimeFormatOptions = {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                };

                tag.values.from = new Date(tag.values.from).toLocaleDateString(locale, options);
                tag.values.to = new Date(tag.values.to).toLocaleDateString(locale, options);
            }

            if (tag.title === "checkout.gateway") {
                tag.value = $t(`contributions.filters.paymentMethod.options.${tag.value}`);
            }

            if (tag.title === "status") {
                tag.value = $t(`contributions.filters.chargeStatus.options.${tag.value}`);
            }

            if (tag.title === "money.amount[between]") {
            }

            if (tag.title === "money.amount[gte]")
                tag.value = $t(`contributions.filters.rangeAmount.options.${tag.value}`);
        });

        return tags;
    }

    $effect(() => {
        if (filters !== undefined) {
            let dateFrom = "dateCreated[after]";
            let dateTo = "dateCreated[before]";

            let normalTags: FilterTags | undefined = Object.keys(filters)
                .map((filter) => {
                    if (filter === dateFrom || filter === dateTo) return { title: filter };
                    else return { title: filter, value: filters[filter] };
                })
                .filter((filter) => {
                    if (filter.title === dateFrom || filter.title === dateTo) return false;
                    if (filter.value === undefined) return filter.value !== undefined;
                    if (filter.value === "all") return false;
                    else return filter.value !== "";
                });

            if (
                filters[dateFrom] !== "" &&
                filters[dateTo] !== "" &&
                typeof filters[dateFrom] !== "undefined" &&
                typeof filters[dateTo] !== "undefined"
            ) {
                dateTag = {
                    title: "date",
                    values: {
                        from: filters[dateFrom],
                        to: filters[dateTo],
                    },
                };

                normalTags = [...normalTags, dateTag];
            }

            console.log(normalTags);
            tags = formatTags([...normalTags], $locale);
        }
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
            <button onclick={() => closeTag(tag)} class="size-auto">
                <CloseIcon class="size-[15px]" />
            </button>
        </Tag>
    {/each}
</div>
