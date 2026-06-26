<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import RadioButton from "./RadioButton.svelte";

    const { Story } = defineMeta({
        component: RadioButton,
        title: "Library/RadioButton",
        tags: ["autodocs"],
        args: {
            label: "Option A",
            value: "a",
        },
        argTypes: {
            disabled: { control: "boolean" },
        },
    });
</script>

<Story name="Default" />

<Story name="Disabled" args={{ disabled: true, label: "Disabled option" }} />

<Story name="DisabledChecked" args={{ disabled: true, checked: true, label: "Disabled checked" }} />

<Story name="NoLabel" args={{ label: undefined, value: "no-label" }} />
