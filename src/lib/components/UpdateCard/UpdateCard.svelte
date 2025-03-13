<script lang="ts">
    import { _, date as formatDate } from "svelte-i18n";
    import { Share2 } from "lucide-svelte";

    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";
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
        <Dialog.Root>
            <Dialog.Trigger class="text-left">
                <Button variant="outline" size="lg">
                    {$_("updateCard.readMore")}
                </Button>
            </Dialog.Trigger>
            <Dialog.Content class="w-full max-w-2xl gap-8">
                <Dialog.Header class="gap-2">
                    {#if image}
                        <img
                            src={image}
                            alt="Reward"
                            class="h-64 w-full rounded-3xl object-cover"
                        />
                    {/if}
                    <Dialog.Title class="text-3xl text-primary-foreground">{title}</Dialog.Title>
                </Dialog.Header>
                <Dialog.Description class="grid grid-cols-1 gap-4">
                    <Dialog.Title class="text-2xl text-primary-foreground">{subtitle}</Dialog.Title>
                    {description}
                </Dialog.Description>
                <Dialog.Footer>
                    <Button variant="default" size="lg">
                        <Share2 class="mr-2 h-4" />
                        {$_("project.actions.share")}
                    </Button>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog.Root>
    </Card.Footer>
</Card.Root>
