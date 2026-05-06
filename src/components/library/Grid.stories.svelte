<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Grid from "./Grid.svelte";

    const { Story } = defineMeta({
        component: Grid,
        title: "Library/Grid",
        tags: ["autodocs"],
    });
</script>

<Story name="Default">
    {#each Array.from({length: 6}, (_, i) => i) as i}
        <div class="rounded-lg bg-gray-100 p-6 text-center text-sm font-medium text-gray-500">
            Item {i + 1}
        </div>
    {/each}
</Story>

<Story name="ThreeItems">
    {#each Array.from({length: 3}, (_, i) => i) as i}
        <div class="rounded-lg bg-gray-100 p-6 text-center text-sm font-medium text-gray-500">
            Item {i + 1}
        </div>
    {/each}
</Story>

<Story name="CustomClass" args={{ class: "gap-2" }}>
    {#each Array.from({length: 4}, (_, i) => i) as i}
        <div class="rounded-lg bg-gray-100 p-6 text-center text-sm font-medium text-gray-500">
            Item {i + 1}
        </div>
    {/each}
</Story>