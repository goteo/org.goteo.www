<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import ReturnHeader from "./ReturnHeader.svelte";

    const { Story } = defineMeta({
        component: ReturnHeader,
        title: "Library/ReturnHeader",
        tags: ["autodocs"],
    });
</script>

<Story name="Default" />
