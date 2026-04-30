<script lang="ts">
    import { onMount } from "svelte";
    import { writable } from "svelte/store";

    import CartItem from "./CartItem.svelte";
    import Tipjar from "./Tipjar.svelte";
    import { t } from "../../i18n/store";
    import {
        apiProjectsIdOrSlugGet,
        apiTipjarsIdGet,
        apiUsersIdOrHandleGet,
    } from "../../openapi/client";
    import {
        apiProjectsGetCollectionUrl,
        apiTipjarsGetCollectionUrl,
        apiUsersGetCollectionUrl,
    } from "../../openapi/client/paths.gen";
    import { cart, cartByRecipient } from "../../stores/cart";
    import { extractId } from "../../utils/extractId";
    import * as tipping from "../../utils/tipping";

    const displayNames = writable<Record<string, string>>({});

    async function getOwnerName(owner: string): Promise<string> {
        try {
            if (owner.startsWith(apiUsersGetCollectionUrl)) {
                const { data: user } = await apiUsersIdOrHandleGet({
                    path: { idOrHandle: extractId(owner)! },
                });

                return user?.displayName!;
            }

            if (owner.startsWith(apiProjectsGetCollectionUrl)) {
                const { data: project } = await apiProjectsIdOrSlugGet({
                    path: { idOrSlug: extractId(owner)! },
                });

                return project?.title!;
            }

            if (owner.startsWith(apiTipjarsGetCollectionUrl)) {
                const { data: tipjar } = await apiTipjarsIdGet({ path: { id: extractId(owner)! } });

                return tipjar?.name!;
            }
        } catch (err) {
            console.warn(`Error fetching owner name for ${owner}:`, err);
        }
        return "";
    }

    async function loadDisplayNames() {
        const names: Record<string, string> = {};

        for (const [target, items] of Object.entries($cartByRecipient)) {
            names[target] = await getOwnerName(items[0].recipient);
        }

        displayNames.set(names);
    }

    function increment(item: { key: string; quantity: number }) {
        cart.updateQuantity(item.key, item.quantity + 1);
    }

    function decrement(item: { key: string; quantity: number }) {
        if (item.quantity > 1) {
            cart.updateQuantity(item.key, item.quantity - 1);
        }
    }

    function remove(item: { key: string }) {
        cart.removeItem(item.key);
    }

    onMount(() => {
        loadDisplayNames();
    });

    function getItems() {
        let items = Object.entries($cartByRecipient);

        if (tipping.isEnabled) {
            items = items.filter((item) => item[0] !== tipping.tipjarIri);
        }

        return items;
    }
</script>

<div class="flex flex-col gap-10">
    {#each getItems() as [target, items]}
        <div class="flex flex-col gap-6">
            <h2 class="text-2xl font-bold text-black">
                {$t("project.owner")}
                {$displayNames[target] ?? ""}
            </h2>

            {#each items as item (item.key)}
                <CartItem
                    {item}
                    onIncrement={() => increment(item)}
                    onDecrement={() => decrement(item)}
                    onRemove={() => remove(item)}
                />
            {/each}
        </div>
    {/each}
</div>

{#if tipping.isEnabled}
    <Tipjar />
{/if}
