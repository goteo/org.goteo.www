<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import RangeSlider from "./RangeSlider.svelte";

    const { Story } = defineMeta({
        component: RangeSlider,
        title: "Library/RangeSlider",
        tags: ["autodocs"],
        args: {
            min: 0,
            max: 100000,
            values: [0, 100000],
        },
    });
</script>

<Story name="Default" />

<Story
    name="WithCurrency"
    args={{ min: 0, max: 100000, values: [10000, 80000], currency: "EUR" }}
/>

<Story name="SmallRange" args={{ min: 0, max: 100, values: [20, 80] }} />

<Story name="Preseted" args={{ min: 0, max: 1000000, values: [50000, 500000], currency: "EUR" }} />
