<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Button } from "$lib/components/ui/button";
    import type { ButtonEventHandler } from "bits-ui";
    import { date as formatDate } from "svelte-i18n";

    export let image: string;
    export let date: Date;
    export let title: string;
    export let subtitle: string;
    export let description : string;

    function action(e: ButtonEventHandler<MouseEvent>): void {
        throw new Error("Function not implemented.");
    }
</script>

<Card.Root class="flex h-full w-full min-w-[512px] max-w-2xl flex-col drop-shadow-sm">
    <Card.Header class="space-y-4">
        <p class="text-2xl font-bold">{$formatDate(date, { format: "medium" })}</p>
        <img src={image} alt="Reward" class="h-64 w-full rounded-3xl object-cover" />
        <Card.Title tag="h1" class="text-3xl font-bold">{title}</Card.Title>
    </Card.Header>
    <Card.Content>
        <h2 class="text-base font-medium">{subtitle}</h2>
        <p class="line-clamp-2">{description}</p>
    </Card.Content>
    <Card.Footer class="mt-auto justify-end">
        <Button variant="outline" size="lg" class="" on:click={action}>Seguir leyendo</Button>
    </Card.Footer>
</Card.Root>
