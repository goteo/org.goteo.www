<script lang="ts">
    import { date as formatDate } from "svelte-i18n";
    import type { ButtonEventHandler } from "bits-ui";

    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";

    export let image: string | undefined = undefined;
    export let date: Date;
    export let title: string;
    export let subtitle: string;
    export let description: string;

    $: styles = {
        title: image ? "text-3xl" : "text-6xl",
        subtitle: image ? "text-base" : "text-3xl",
        description: image ? "line-clamp-2" : "line-clamp-4",
    };

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
        <Card.Title tag="h1" class={`${styles.title} font-bold`}>{title}</Card.Title>
    </Card.Header>
    <Card.Content class="space-y-2">
        <h2 class={`${styles.subtitle} font-medium`}>{subtitle}</h2>
        <p class={`${styles.description}`}>{description}</p>
    </Card.Content>
    <Card.Footer class="mt-auto justify-end">
        <Button variant="outline" size="lg" class="" on:click={action}>Seguir leyendo</Button>
    </Card.Footer>
</Card.Root>
