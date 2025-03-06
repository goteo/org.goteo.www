<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";
    import CampaignProgress from "./CampaignProgress.svelte";

    const defaultTimeSeriesData = [
        { date: new Date("2024-01-01"), amount: 50000 },
        { date: new Date("2024-02-01"), amount: 75000 },
        { date: new Date("2024-03-01"), amount: 100000 },
        { date: new Date("2024-04-01"), amount: 150000 },
        { date: new Date("2024-05-01"), amount: 200000 },
    ];

    const { Story } = defineMeta({
        title: "Components/CampaignProgress",
        component: CampaignProgress,
        argTypes: {
            obtained: { control: "number" },
            optimum: { control: "number" },
            donations: { control: "number" },
            minimum: { control: "number" },
            timeSeriesData: { control: "object" },
        },
    });
</script>

<script>
    import { waitLocale } from "svelte-i18n";
    import { onMount } from "svelte";

    onMount(async () => {
        await waitLocale();
    });
</script>

<!-- Default state with all values -->
<Story
    name="Default"
    args={{
        obtained: 150547,
        optimum: 300000,
        donations: 2128,
        minimum: 100000,
        timeSeriesData: defaultTimeSeriesData,
    }}
/>

<!-- Campaign just starting -->
<Story
    name="Campaign Start"
    args={{
        obtained: 0,
        optimum: 300000,
        donations: 0,
        minimum: 100000,
        timeSeriesData: [],
    }}
/>

<!-- Minimum not reached -->
<Story
    name="Below Minimum"
    args={{
        obtained: 75000,
        optimum: 300000,
        donations: 128,
        minimum: 100000,
        timeSeriesData: defaultTimeSeriesData.slice(0, 2),
    }}
/>

<!-- Just reached minimum -->
<Story
    name="Just Reached Minimum"
    args={{
        obtained: 100000,
        optimum: 300000,
        donations: 1500,
        minimum: 100000,
        timeSeriesData: defaultTimeSeriesData.slice(0, 3),
    }}
/>

<!-- optimum exceeded -->
<Story
    name="Optimum Exceeded"
    args={{
        obtained: 350000,
        optimum: 300000,
        donations: 3500,
        minimum: 100000,
        timeSeriesData: [
            ...defaultTimeSeriesData,
            { date: new Date("2024-06-01"), amount: 350000 },
        ],
    }}
/>

<!-- High volume campaign -->
<Story
    name="High Volume"
    args={{
        obtained: 1500000,
        optimum: 2000000,
        donations: 15000,
        minimum: 500000,
        timeSeriesData: defaultTimeSeriesData.map((d) => ({ ...d, amount: d.amount * 10 })),
    }}
/>
