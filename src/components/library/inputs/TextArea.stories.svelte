<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import TextArea from "./TextArea.svelte";

    const { Story } = defineMeta({
        component: TextArea,
        title: "Library/TextArea",
        tags: ["autodocs"],
        args: {
            labelText: "Description",
            placeholder: "Write something...",
            rows: 4,
        },
        argTypes: {
            error: { control: "text" },
            disabled: { control: "boolean" },
        },
    });
</script>

<Story name="Default" />

<Story name="WithValue" args={{ value: "This is some existing content in the textarea." }} />

<Story name="WithHelper" args={{ helperText: "Max 500 characters" }} />

<Story name="Error" args={{ error: "This field is required" }} />

<Story name="Disabled" args={{ disabled: true, value: "Cannot edit this content" }} />
