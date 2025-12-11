<script lang="ts">
    import CloseIcon from "../../svgs/CloseIcon.svelte";
    import Tag from "../library/Tag.svelte";

    let { title, tags } = $props<{
        title: string;
        tags?: any;
    }>();
</script>

<div class="flex gap-4">
    <h1 class="text-2xl/8 text-black font-bold">
        {title}
    </h1>
    <div class="flex gap-2">
        {#each tags as tag}
            <Tag variant={"bold"}>
                {tag}
                <CloseIcon class="size-[15px]" />
            </Tag>
        {/each}
    </div>
</div>