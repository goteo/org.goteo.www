<script lang="ts">
    import { _, number } from "svelte-i18n";

    import type { Money } from "$client";

    import * as Card from "$lib/components/ui/card";
    import * as Dialog from "$lib/components/ui/dialog";

    export let header: string = "";
    export let content: string = "";
    export let minimum: Money | undefined = undefined;
    export let optimum: Money | undefined = undefined;
</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Card.Root class="w-96 text-left drop-shadow-sm">
            <Card.Header>
                <Card.Title>{header}</Card.Title>
            </Card.Header>
            <Card.CardContent>
                <Card.Description class="line-clamp-3 h-16">
                    {content}
                </Card.Description>
            </Card.CardContent>
            <Card.Footer class="flex gap-8">
                {#if minimum}
                    <div>
                        <p class="text-base font-medium text-gray-500">
                            {$_("campaignProgress.minimum")}
                        </p>
                        <p class="text-xl font-bold">
                            {$number(minimum.amount, {
                                style: "currency",
                                currency: minimum.currency,
                            })}
                        </p>
                    </div>
                {/if}
                {#if optimum}
                    <div>
                        <p class="text-base font-medium text-gray-500">
                            {$_("campaignProgress.optimal")}
                        </p>
                        <p class="text-xl font-bold">
                            {$number(optimum.amount, {
                                style: "currency",
                                currency: optimum.currency,
                            })}
                        </p>
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
            {#if minimum}
                <div>
                    <p class="text-base font-medium text-gray-500">
                        {$_("campaignProgress.minimum")}
                    </p>
                    <p class="text-xl font-bold">
                        {$number(minimum.amount, { style: "currency", currency: minimum.currency })}
                    </p>
                </div>
            {/if}
            {#if optimum}
                <div>
                    <p class="text-base font-medium text-gray-500">
                        {$_("campaignProgress.optimal")}
                    </p>
                    <p class="text-xl font-bold">
                        {$number(optimum.amount, { style: "currency", currency: optimum.currency })}
                    </p>
                </div>
            {/if}
        </div>
    </Dialog.Content>
</Dialog.Root>
