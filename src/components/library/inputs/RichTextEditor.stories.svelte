<script module lang="ts">
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import RichTextEditor from "./RichTextEditor.svelte";

    const { Story } = defineMeta({
        component: RichTextEditor,
        title: "Library/RichTextEditor",
        tags: ["autodocs"],
        argTypes: {
            error: { control: "text" },
            placeholder: { control: "text" },
        },
    });
</script>

<Story
    name="Default"
    args={{
        id: "rte-default",
        format: "markdown",
        placeholder: "Escribe algo...",
        value: "",
        onChange: () => {},
    }}
/>

<Story
    name="MultiParagraph"
    args={{
        id: "rte-multiparagraph",
        format: "markdown",
        placeholder: "Escribe algo...",
        value: "Primer párrafo de ejemplo.\n\nSegundo párrafo separado con el mismo espaciado que en la página de campaña.\n\nTercer párrafo con **negrita** y *cursiva* para visualizar el estilo.",
        onChange: () => {},
    }}
/>
