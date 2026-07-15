<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Search from "./Search.svelte";

    const { Story } = defineMeta({
        component: Search,
        title: "Library/Search",
        tags: ["autodocs"],
        args: {
            placeholder: "Search...",
            name: "search",
            id: "search",
        },
    });
</script>

<Story name="Default" />

<Story name="WithLabel" args={{ label: "Search campaigns" }} />

<Story name="WithValue" args={{ value: "renewable energy" }} />
