<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import ToggleSwitch from "./ToggleSwitch.svelte";

    const { Story } = defineMeta({
        component: ToggleSwitch,
        title: "Library/ToggleSwitch",
        tags: ["autodocs"],
        args: {
            options: [
                { value: "monthly", label: "Monthly" },
                { value: "annual", label: "Annual" },
            ],
            value: "monthly",
        },
    });
</script>

<Story name="Default" />

<Story name="SecondSelected" args={{ value: "annual" }} />

<Story
    name="YesNo"
    args={{
        options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
        ],
        value: "yes",
    }}
/>
