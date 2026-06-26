<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Card from "./Card.svelte";

    const { Story } = defineMeta({
        component: Card,
        title: "Library/Card",
        tags: ["autodocs"],
    });
</script>

<Story name="Default">
    <p>Card content</p>
</Story>

<Story name="WithMultipleChildren">
    <h2 class="text-lg font-bold">Title</h2>
    <p class="text-sm text-gray-500">Description text goes here.</p>
    <button class="mt-2">Action</button>
</Story>

<Story name="CustomClass" args={{ class: "w-64" }}>
    <p>Fixed width card</p>
</Story>
