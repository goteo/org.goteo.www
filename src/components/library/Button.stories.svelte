<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Button from "./Button.svelte";

    const { Story } = defineMeta({
        component: Button,
        title: "Library/Button",
        tags: ["autodocs"],
        args: {
            size: "md",
            kind: "primary",
            disabled: false,
        },
        argTypes: {
            size: { control: "select", options: ["md", "sm"] },
            kind: { control: "select", options: ["primary", "secondary", "ghost", "invert"] },
            disabled: { control: "boolean" },
        },
    });
</script>

<Story name="Primary">Lorem ipsum</Story>

<Story name="Secondary" args={{ kind: "secondary" }}>Lorem ipsum</Story>

<Story name="Ghost" args={{ kind: "ghost" }}>Lorem ipsum</Story>

<Story name="Invert" args={{ kind: "invert" }}>Lorem ipsum</Story>

<Story name="Small" args={{ size: "sm" }}>Lorem ipsum</Story>

<Story name="Disabled" args={{ disabled: true }}>Lorem ipsum</Story>
