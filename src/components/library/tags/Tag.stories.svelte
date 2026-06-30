<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Tag from "./Tag.svelte";

    const { Story } = defineMeta({
        component: Tag,
        title: "Library/Tag",
        tags: ["autodocs"],
        argTypes: {
            variant: {
                control: "select",
                options: [undefined, "success", "warning", "error", "bold"],
            },
        },
    });
</script>

<Story name="Default">Technology</Story>

<Story name="Success" args={{ variant: "success" }}>Funded</Story>

<Story name="Warning" args={{ variant: "warning" }}>Ending soon</Story>

<Story name="Error" args={{ variant: "error" }}>Cancelled</Story>

<Story name="Bold" args={{ variant: "bold" }}>Featured</Story>
