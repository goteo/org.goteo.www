<script lang="ts">
    import { locale } from "../../i18n/store";
    import { t } from "../../i18n/store";
    import { formatDate } from "../../utils/dates";
    import { getDisplayNameFromAccounting } from "../../utils/displayNameFromAccounting";
    import { getAllFilterSubjects } from "../../utils/filterComposer";
    import CloseIcon from "../icons/navigation/Close.svelte";
    import Tag from "../library/tags/Tag.svelte";

    import type { Locale } from "../../i18n/locales";
    import type { Accounting, User, Project, Tipjar } from "../../openapi/client/index.ts";
    import type { FilterResource, FilterSubject } from "../../utils/filterComposer";

    type FilterTag = { title: string; value?: string; values?: { from?: string; to?: string } };

    let {
        title,
        filters,
        onCloseFilter,
        resource = undefined,
        accountingsMap = new Map(),
        ownersMap = new Map(),
    } = $props<{
        title: string;
        filters: Record<string, any>;
        onCloseFilter: (filters: Record<string, any>) => void;
        resource?: FilterResource;
        accountingsMap?: Map<string, Accounting>;
        ownersMap?: Map<string, User | Project | Tipjar>;
    }>();

    let tags: FilterTag[] = $state([]);

    let subjects = $derived(getAllFilterSubjects(resource));
    let subjectByParam = $derived(new Map(subjects.map((s) => [s.param ?? s.key, s] as const)));

    function closeTag(tag: FilterTag) {
        const result = { ...filters };
        if (tag.values?.from && tag.values?.to) {
            result["dateCreated[after]"] = undefined;
            result["dateCreated[before]"] = undefined;
        } else {
            result[tag.title] = undefined;
        }
        onCloseFilter(result);
    }

    function formatSubjectValue(subject: FilterSubject, value: string): string {
        if (subject.options) {
            const option = subject.options.find((o) => o.value === value);
            if (option) return $t(option.label);
        }
        return value;
    }

    function formatTags(tags: FilterTag[], loc: Locale): FilterTag[] {
        return tags.map((tag) => {
            if (tag.values?.from && tag.values?.to) {
                tag.values.from = formatDate(new Date(tag.values.from), loc);
                tag.values.to = formatDate(new Date(tag.values.to), loc);
            }

            const subject = subjectByParam.get(tag.title);
            if (subject && tag.value) {
                const formatted = formatSubjectValue(subject, tag.value);
                if (formatted !== tag.value) {
                    tag.value = formatted;
                } else if (tag.title === "target") {
                    const displayName = getDisplayNameFromAccounting(
                        accountingsMap.get(tag.value),
                        ownersMap,
                    );
                    if (displayName) tag.value = displayName;
                }
            }

            return tag;
        });
    }

    $effect(() => {
        if (!filters) {
            tags = [];
            return;
        }

        const dateFrom = "dateCreated[after]";
        const dateTo = "dateCreated[before]";

        let normalTags: FilterTag[] = Object.keys(filters)
            .map((key) => {
                if (key === dateFrom || key === dateTo) return { title: key };
                return { title: key, value: String(filters[key] ?? "") };
            })
            .filter((tag) => {
                if (tag.title === dateFrom || tag.title === dateTo) return false;
                if (tag.value === undefined || tag.value === "") return false;
                if (tag.value === "all") return false;
                return true;
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

        tags = formatTags(normalTags, $locale);
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
