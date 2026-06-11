<script module>
    import { defineMeta } from "@storybook/addon-svelte-csf";

    import CampaignStatusBadge from "./CampaignStatusBadge.svelte";

    const { Story } = defineMeta({
        component: CampaignStatusBadge,
        title: "Library/CampaignStatusBadge",
        tags: ["autodocs"],
        args: {
            text: "Active",
        },
    });
</script>

<Story name="Active" args={{ text: "Active" }} />
