<script lang="ts">
  import { _, number } from "svelte-i18n";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import boxIcon from "./box.svg";
  import userIcon from "./user.svg";

  export let image: string = "";
  export let header: string = "";
  export let content: string = "";
  export let donate: number = 0;
  export let donors: number = 0;
  export let units: number | null = null;
  export let size: "sm" | "lg" = "lg";
</script>

<Dialog.Root>
  <Dialog.Trigger class="text-left">
    <Card.Root class="w-full max-w-md drop-shadow-sm">
      <Card.Header>
        {#if size === "lg"}
          <img src={image} alt="Reward" class="w-full h-40 object-cover" />
        {/if}
        <Card.Title>{header}</Card.Title>
      </Card.Header>
      <Card.CardContent class="flex flex-col gap-4 h-28">
        <Card.Description>
          {content}
        </Card.Description>
      </Card.CardContent>
      <Card.Footer class="grid grid-cols-1 gap-4">
        {#if size === "lg"}
          <div class="grid grid-cols-2 gap-4">
            <p class="flex items-center gap-2 text-sm">
              <img alt="donors" src={userIcon} class="w-6 h-6" />
              {$number(donors)}
              {$_("reward.donors")}
            </p>

            {#if units !== null}
              <p class="flex items-center gap-2 text-sm">
                <img alt="donors" src={boxIcon} class="w-6 h-6" />
                {#if units > 0}
                  {$_("reward.units", {
                    values: { units: $number(units, { format: "compactShort", locale: "en-US" }) },
                  })}
                {:else}
                  {$_("reward.noUnits")}
                {/if}
              </p>
            {/if}
          </div>
        {/if}
        <Button size="lg" class="w-full">{$_("reward.donate")} {$number(donate)}€</Button>
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
    <Dialog.Footer class="grid grid-cols-1 gap-4">
      <div class="flex justify-between">
        <p>{donors} {$_("reward.donors")}</p>
        <p>{($_("reward.units"), { units: $number(units || 0) })}</p>
      </div>
      <Button size="lg" class="w-full">{$_("reward.donate")} {$number(donate)}€</Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
