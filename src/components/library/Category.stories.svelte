<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Category from "./Category.svelte";

    const { Story } = defineMeta({
        component: Category,
        title: "Library/Category",
        tags: ["autodocs"],
        args: {
            type: "default",
            disabled: false,
        },
        argTypes: {
            type: { control: "select", options: ["default", "active", "ghost"] },
            disabled: { control: "boolean" },
        },
    });
</script>

<Story name="Default">Technology</Story>

<Story name="Active" args={{ type: "active" }}>Technology</Story>

<Story name="Ghost" args={{ type: "ghost" }}>Technology</Story>

<Story name="Disabled" args={{ disabled: true }}>Technology</Story>
