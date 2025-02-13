<script lang="ts">
  import type { PageProps } from "./$types";
  import CampaignProgress from "$lib/components/CampaignProgress/CampaignProgress.svelte";

  let { data }: PageProps = $props();
  let { project } = data;
</script>

<CampaignProgress {...project} />
