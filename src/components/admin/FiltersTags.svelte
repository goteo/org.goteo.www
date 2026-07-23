<script lang="ts">
    import { locale } from "../../i18n/store";
    import { t } from "../../i18n/store";
    import { formatDate } from "../../utils/dates";
    import { getDisplayNameFromAccounting } from "../../utils/displayNameFromAccounting";
    import CloseIcon from "../icons/navigation/Close.svelte";
    import Tag from "../library/tags/Tag.svelte";

    import type { Locale } from "../../i18n/locales";
    import type { Accounting, User, Project, Tipjar } from "../../openapi/client/index.ts";
    import type { ApiGatewayChargesGetCollectionData } from "../../openapi/client/types.gen";

    type Filters = ApiGatewayChargesGetCollectionData["query"];

    let {
        title,
        filters,
        onCloseFilter,
        accountingsMap = new Map(),
        ownersMap = new Map(),
    } = $props<{
        title: string;
        filters: Filters;
        onCloseFilter: (filters: Filters) => void;
        accountingsMap?: Map<string, Accounting>;
        ownersMap?: Map<string, User | Project | Tipjar>;
    }>();

    type FilterTag = { title: string; value?: string; values?: { from?: string; to?: string } };
    type FilterTags = FilterTag[];

    let tags: FilterTags = $state([]);

    function closeTag(tag: FilterTag) {
        if (tag.values?.from && tag.values?.to) {
            onCloseFilter({
                ...filters,
                ["dateCreated[after]"]: undefined,
                ["dateCreated[before]"]: undefined,
            });
        } else {
            onCloseFilter({
                ...filters,
                [tag.title]: undefined,
            });
        }
    }

    function formatTags(
        tags: FilterTags,
        locale: Locale,
        accountingsMap: Map<string, Accounting>,
        ownersMap: Map<string, User | Project | Tipjar>,
    ) {
        if (tags === undefined) return;

        tags.map((tag) => {
            if (tag.values?.from && tag.values?.to) {
                tag.values.from = formatDate(new Date(tag.values.from), locale);
                tag.values.to = formatDate(new Date(tag.values.to), locale);
            }

            if (tag.title === "status") {
                const chargeLabel = $t(`contributions.filters.chargeStatus.options.${tag.value}`);
                tag.value =
                    chargeLabel !== tag.value
                        ? chargeLabel
                        : $t(`admin.projects.table.rows.status.${tag.value.replace(/\./g, "_")}`);
            }

            if (tag.title === "status[]" && Array.isArray(tag.value)) {
                tag.value = tag.value
                    .map((s: string) =>
                        $t(`admin.projects.table.rows.status.${s.replace(/\./g, "_")}`),
                    )
                    .join(", ");
            }

            if (tag.title === "money.amount[gte]")
                tag.value = $t(`pages.admin.charges.filters.rangeAmount.options.${tag.value}`);

            if (tag.title === "target") {
                const displayName = getDisplayNameFromAccounting(
                    accountingsMap.get(tag.value ?? ""),
                    ownersMap,
                );
                if (displayName) tag.value = displayName;
            }
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
                    else return { title: filter, value: filters[filter] as string | undefined };
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
                normalTags = [
                    ...normalTags,
                    {
                        title: "date",
                        values: {
                            from: filters[dateFrom] as string | undefined,
                            to: filters[dateTo] as string | undefined,
                        },
                    },
                ];
            }

            tags = formatTags([...normalTags], $locale, accountingsMap, ownersMap) ?? [];
        }
    });
</script>

<div class="flex gap-4">
    <h1 class="text-2xl/8 font-bold text-black">
        {title}
    </h1>

    {#each tags as tag}
        <Tag variant="bold">
            {#if tag.values}
                {`${tag.values.from} - ${tag.values.to}`}
            {:else}
                {tag.value}
            {/if}
            <button onclick={() => closeTag(tag)} class="size-auto cursor-pointer">
                <CloseIcon class="size-3.75" />
            </button>
        </Tag>
    {/each}
</div>
