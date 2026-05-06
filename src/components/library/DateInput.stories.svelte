<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import DateInput from "./DateInput.svelte";

    const { Story } = defineMeta({
        component: DateInput,
        title: "Library/DateInput",
        tags: ["autodocs"],
        args: {
            value: new Date("2024-03-15"),
        },
        argTypes: {
            disabled: { control: "boolean" },
            required: { control: "boolean" },
        },
    });
</script>

<Story name="Default" />

<Story name="WithLabel" args={{ labelText: "Start date" }} />

<Story name="WithHelperText" args={{ labelText: "Start date", helperText: "Select a date in the future" }} />

<Story name="WithError" args={{ labelText: "Start date", error: "Date is required" }} />

<Story name="Disabled" args={{ labelText: "Start date", disabled: true }} />

<Story name="WithMinMax" args={{
    labelText: "Event date",
    min: new Date("2024-01-01"),
    max: new Date("2024-12-31"),
}} />