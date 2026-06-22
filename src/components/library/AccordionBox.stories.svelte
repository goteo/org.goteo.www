<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import AccordionBox from "./AccordionBox.svelte";

    export const AccordionBoxData = {};

    const { Story } = defineMeta({
        component: AccordionBox,
        title: "Library/AccordionBox",
        tags: ["autodocs"],
        excludeStories: /.*Data$/,
        args: {
            ...AccordionBoxData,
        },
        argTypes: {
            open: { control: "boolean" },
            heading: { control: "text" },
        },
    });
</script>

<Story name="Close" args={{ heading: "Prueba 1", open: false }}>
    Goteo supports projects in culture, education, science, technology, community development, and
    social innovation. Projects must have a social return — a benefit shared with the commons beyond
    the direct backers.
</Story>
<Story name="Open" args={{ heading: "Prueba 2", open: true }}>
    Goteo supports projects in culture, education, science, technology, community development, and
    social innovation. Projects must have a social return — a benefit shared with the commons beyond
    the direct backers.
</Story>
