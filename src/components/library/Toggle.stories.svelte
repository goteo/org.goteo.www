<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Toggle from "./Toggle.svelte";

    const { Story } = defineMeta({
        component: Toggle,
        title: "Library/Toggle",
        tags: ["autodocs"],
        argTypes: {
            disabled: { control: "boolean" },
        },
    });
</script>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true }} />
