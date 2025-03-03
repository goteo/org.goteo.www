<script lang="ts">
  import { _, number } from "svelte-i18n";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { cart } from "$lib/stores/cart";
  import boxIcon from "./box.svg";
  import userIcon from "./user.svg";
  import bagIcon from "./bag.svg";

  export let id: string = "";
  export let image: string = "";
  export let header: string = "";
  export let content: string = "";
  export let donate: number = 0;
  export let donors: number = 0;
  export let units: number | null = null;
  export let size: "sm" | "lg" = "lg";
  export let projectId: number | null = null;

  let open = false;
  let quantity = 1;

  function addToCart() {
    cart.addItem({
      id,
      type: "reward",
      name: header,
      amount: donate,
      quantity,
      image,
      project: projectId  // pass project id to the cart store
    });

    open = false;
  }

  function handleDirectDonate() {
    addToCart();
    // Redirect to checkout page
    window.location.href = "/checkout";
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger class="text-left">
    <Card.Root class="w-full max-w-md drop-shadow-sm">
      <Card.Header>
        {#if size === "lg"}
          <img src={image} alt="Reward" class="w-full h-40 object-cover" />
        {/if}
        <Card.Title class="text-2xl">{header}</Card.Title>
      </Card.Header>
      <Card.CardContent class={`flex flex-col gap-4 ${size === "lg" ? "h-44" : "h-28"}`}>
        <Card.Description class={size === "lg" ? "line-clamp-6" : "line-clamp-3"}>
          {content}
        </Card.Description>
      </Card.CardContent>
      <Card.Footer class="grid grid-cols-1 gap-4">
        {#if size === "lg"}
          <div class="flex justify-between gap-4">
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
        <Button variant="secondary" size="lg" class="w-full">{$_("reward.donate")} {$number(donate)}€</Button>
      </Card.Footer>
    </Card.Root>
  </Dialog.Trigger>
  <Dialog.Content class="w-full max-w-2xl gap-8">
    <Dialog.Header class="gap-2">
      <img src={image} alt="Reward" class="w-full h-80 object-cover" />
    </Dialog.Header>
    <Dialog.Description class="grid grid-cols-1 gap-4">
      <Dialog.Title class="text-2xl text-primary-foreground">{header}</Dialog.Title>
      {content}
    </Dialog.Description>
    <Dialog.Footer class="grid grid-cols-1 gap-6">
      <div class="flex gap-4">
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
      <div class="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          size="lg"
          class="w-full"
          on:click={() => addToCart()}
          disabled={units !== null && units <= 0}
        >
          <img src={bagIcon} alt="Bag" class="h-6 mr-4" />
          {$_("reward.addAndContinue")}
        </Button>
        <Button
          variant="default"
          size="lg"
          class="w-full"
          on:click={handleDirectDonate}
          disabled={units !== null && units <= 0}
        >
          {$_("reward.donate")}
          {$number(donate * quantity)}€
        </Button>
      </div>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
