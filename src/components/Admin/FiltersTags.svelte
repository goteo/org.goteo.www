<script lang="ts">
    import CloseIcon from "../../svgs/CloseIcon.svelte";
    import Tag from "../library/Tag.svelte";
    import { t } from "../../i18n/store";

    let { title, filters } = $props<{
        title: string;
        filters?: any;
    }>();

    let tags:
        | { title: string; value?: string; values?: { from: string; to: string } }[]
        | undefined = $state(undefined);

    function closeTag() {
        
    }

    $effect(() => {
        tags = Object.keys(filters)
            .map((filter: string) => {
                if (filter === "date") return { title: filter, values: { ...filters[filter] } };
                else return { title: filter, value: filters[filter] };
            })
            .filter((filter) => {
                if (filter.title === "date")
                    return filter.values.from !== undefined || filter.values.to !== undefined;
                else if (filter.title === "target") return filter.value !== undefined;
                else return filter.value !== "";
            });
    });
</script>

<div class="flex gap-4">
    <h1 class="text-2xl/8 font-bold text-black">
        {title}
    </h1>

    {#each tags as tag}
        <Tag variant={"bold"}>
            {#if tag.title === "date"}
                {`${tag.values?.from} - ${tag.values?.to}`}
            {:else}
                {tag.value}
            {/if}
            <button onclick={closeTag} class="size-auto">
                <CloseIcon class="size-[15px]" />
            </button>
        </Tag>
    {/each}
</div>
