<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import ReturnButton from "./ReturnButton.svelte";

    const { Story } = defineMeta({
        component: ReturnButton,
        title: "Library/ReturnButton",
        tags: ["autodocs"],
        args: {
            text: "Back",
        },
    });
</script>

<Story name="Default" />

<Story name="CustomText" args={{ text: "Go back to campaigns" }} />
