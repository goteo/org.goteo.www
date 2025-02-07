<script lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import CampaignProgress from "./CampaignProgress.svelte";

  const { Story } = defineMeta({
    title: "Components/CampaignProgress",
    component: CampaignProgress,
    argTypes: {
      obtained: { control: "number" },
      target: { control: "number" },
      donations: { control: "number" },
      minimum: { control: "number" },
    },
  });
</script>

<Story
  name="Default"
  args={{
    obtained: 150547,
    target: 999999,
    donations: 2128,
    minimum: 20000,
  }}
/>

<Story
  name="Not Reached Minimum"
  args={{
    obtained: 15000,
    target: 999999,
    donations: 128,
    minimum: 20000,
  }}
/>
