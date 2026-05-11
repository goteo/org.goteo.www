<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import TextArea from "./TextArea.svelte";

    const { Story } = defineMeta({
        component: TextArea,
        title: "Library/TextArea",
        tags: ["autodocs"],
        args: {
            id: "textarea",
            label: "Description",
            placeholder: "Write something...",
            rows: 4,
        },
        argTypes: {
            error: { control: "boolean" },
            disabled: { control: "boolean" },
        },
    });
</script>

<Story name="Default" />

<Story name="WithValue" args={{ value: "This is some existing content in the textarea." }} />

<Story name="WithHelper" args={{ error: true, helper: "Description is required" }} />

<Story name="Error" args={{ error: true, helper: "This field is required" }} />

<Story name="Disabled" args={{ disabled: true, value: "Cannot edit this content" }} />
