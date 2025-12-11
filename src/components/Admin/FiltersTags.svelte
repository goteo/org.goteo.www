<script lang="ts">
    import CloseIcon from "../../svgs/CloseIcon.svelte";
    import Tag from "../library/Tag.svelte";

    let { title, filters } = $props<{
        title: string;
        filters?: any;
    }>();

    let tags: { title: string; value: string }[] | undefined = $state(undefined);

    $effect(() => {
        tags = Object.keys(filters).map((filter: string) => {
            return { title: filter, value: filters[filter] };
        });
    });
</script>

<div class="flex gap-4">
    <h1 class="text-2xl/8 font-bold text-black">
        {title}
    </h1>
    {#if tags}
        {#each tags as tag}
            <Tag variant={"bold"}>
                {tag}
                <CloseIcon class="size-[15px]" />
            </Tag>
        {/each}
    {/if}
</div>
