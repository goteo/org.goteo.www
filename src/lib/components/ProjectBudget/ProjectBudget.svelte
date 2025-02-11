<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { _ } from "svelte-i18n";

  export let header: string = "";
  export let content: string = "";
  export let minimum: number = 0;
  export let target: number = 0;
</script>

<Card.Root class="w-full max-w-md drop-shadow-sm">
  <Card.Header>
    <Card.Title>{header}</Card.Title>
  </Card.Header>
  <Card.CardContent class="p-6 space-y-6">
    <Card.Description>{content}</Card.Description>
  </Card.CardContent>
  <Card.Footer class="flex gap-8">
    <div>
      <p class="text-base font-medium text-gray-500">{$_("campaignProgress.minimum")}</p>
      <p class="text-3xl font-bold">{minimum.toLocaleString()}€</p>
    </div>
    <div>
      <p class="text-base font-medium text-gray-500">{$_("campaignProgress.optimal")}</p>
      <p class="text-3xl font-bold">{target.toLocaleString()}€</p>
    </div>
  </Card.Footer>
</Card.Root>
