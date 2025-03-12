<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import type { ButtonEventHandler } from "bits-ui";
    import { date as formatDate } from "svelte-i18n";

    export let image: string | undefined = undefined;
    export let date: Date;
    export let title: string;
    export let subtitle: string;
    export let description: string;

    let titleStyles = image ? "text-3xl" : "text-6xl";
    let subtitleStyles = image ? "text-base" : "text-3xl";
    let descriptionStyles = image ? "line-clamp-2" : "line-clamp-4";

    function action(e: ButtonEventHandler<MouseEvent>): void {
        throw new Error("Function not implemented.");
    }
</script>

<Card.Root class="flex h-full w-full min-w-[512px] max-w-2xl flex-col drop-shadow-sm">
    <Card.Header class="space-y-4">
        <p class="text-2xl font-bold">{$formatDate(date, { format: "medium" })}</p>
        {#if image}
            <img src={image} alt="Reward" class="h-64 w-full rounded-3xl object-cover" />
        {/if}
        <Card.Title tag="h1" class={`${titleStyles} font-bold`}>{title}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2">
        <h2 class={`${subtitleStyles} font-medium`}>{subtitle}</h2>
        <p class={`${descriptionStyles}`}>{description}</p>
    </Card.Content>
    <Card.Footer class="mt-auto justify-end">
        <Button variant="outline" size="lg" class="" on:click={action}>Seguir leyendo</Button>
    </Card.Footer>
</Card.Root>
