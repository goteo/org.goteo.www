<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import Select from "./Select.svelte";

    const { Story } = defineMeta({
        component: Select,
        title: "Library/Select",
        tags: ["autodocs"],
        argTypes: {
            disabled: { control: "boolean" },
            required: { control: "boolean" },
        },
    });
</script>

<Story name="Default">
    <option value="">Select an option</option>
    <option value="local">Local</option>
    <option value="nacional">Nacional</option>
    <option value="internacional">Internacional</option>
</Story>

<Story name="WithLabel" args={{ labelText: "Geographic scope" }}>
    <option value="">Select scope</option>
    <option value="local">Local</option>
    <option value="nacional">Nacional</option>
    <option value="internacional">Internacional</option>
</Story>

<Story name="WithHelperText" args={{ labelText: "Category", helperText: "Choose the campaign category" }}>
    <option value="">Select category</option>
    <option value="tech">Technology</option>
    <option value="health">Health</option>
    <option value="energy">Energy</option>
</Story>

<Story name="WithError" args={{ labelText: "Category", error: "This field is required" }}>
    <option value="">Select category</option>
    <option value="tech">Technology</option>
    <option value="health">Health</option>
</Story>

<Story name="Disabled" args={{ labelText: "Category", disabled: true }}>
    <option value="">Select category</option>
    <option value="tech">Technology</option>
</Story>
