<script lang="ts">
  import { _, number } from "svelte-i18n";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";

  export let header: string = "";
  export let content: string = "";
  export let minimum: number = 0;
  export let optimum: number = 0;
</script>

<Dialog.Root>
  <Dialog.Trigger class="text-left">
    <Card.Root class="w-full max-w-md drop-shadow-sm">
      <Card.Header>
        <Card.Title>{header}</Card.Title>
      </Card.Header>
      <Card.CardContent>
        <Card.Description>
          {content?.slice(0, 170)}{content?.length > 170 ? "..." : ""}
        </Card.Description>
      </Card.CardContent>

      <Card.Footer class="flex gap-8">
        <div>
          <p class="text-base font-medium text-gray-500">{$_("campaignProgress.minimum")}</p>
          <p class="text-xl font-bold">{$number(minimum, { style: "currency", currency: "EUR" })}</p>
        </div>
        {#if optimum}
          <div>
            <p class="text-base font-medium text-gray-500">{$_("campaignProgress.optimal")}</p>
            <p class="text-xl font-bold">{$number(optimum, { style: "currency", currency: "EUR" })}</p>
          </div>
        {/if}
      </Card.Footer>
    </Card.Root>
  </Dialog.Trigger>
  <Dialog.Content>
    <Dialog.Header>
      <Dialog.Title>{header}</Dialog.Title>
    </Dialog.Header>
    <Dialog.Description>
      {content}
    </Dialog.Description>
    <div class="flex justify-start gap-8">
      <div>
        <p class="text-base font-medium text-gray-500">{$_("campaignProgress.minimum")}</p>
        <p class="text-xl font-bold">{$number(minimum, { style: "currency", currency: "EUR" })}</p>
      </div>
      {#if optimum}
        <div>
          <p class="text-base font-medium text-gray-500">{$_("campaignProgress.optimal")}</p>
          <p class="text-xl font-bold">{$number(optimum, { style: "currency", currency: "EUR" })}</p>
        </div>
      {/if}
    </div>
  </Dialog.Content>
</Dialog.Root>
