<script lang="ts">
    import { onMount } from "svelte";
    import { derived, writable } from "svelte/store";
    import { get } from "svelte/store";

    import CartItem from "./CartItem.svelte";
    import Tipjar from "./Tipjar.svelte";
    import { t } from "../../i18n/store";
    import { apiProjectsIdOrSlugGet, apiUsersIdOrHandleGet } from "../../openapi/client";
    import { cart } from "../../stores/cart";
    import { extractId } from "../../utils/extractId";

    export let defaultCurrency: string;
    export let accountingIdPlatoniq: number;

    const items = derived(cart, ($cart) => $cart.items);

    const groupedByOwner = derived(items, ($items) => {
        const grouped = $items.reduce(
            (acc, item) => {
                const key = item.target || "";
                if (key === accountingIdPlatoniq) return acc;

                if (!acc[key]) acc[key] = [];
                acc[key].push(item);
                return acc;
            },
            {} as Record<string, typeof $items>,
        );

        return Object.fromEntries(Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)));
    });

    const displayNames = writable<Record<string, string>>({});

    async function getOwnerName(target: string, projectId: number): Promise<string> {
        try {
            const project = await apiProjectsIdOrSlugGet({
                path: { idOrSlug: projectId.toString() },
            });
            const ownerId = extractId(project.data?.owner);
            if (ownerId) {
                const user = await apiUsersIdOrHandleGet({ path: { idOrHandle: ownerId } });
                return user.data?.displayName ?? "";
            }
        } catch (err) {
            console.warn(`Error fetching owner name for target ${target}:`, err);
        }
        return "";
    }

    async function loadDisplayNames() {
        const names: Record<string, string> = {};
        const $grouped = get(groupedByOwner);

        for (const [target, items] of Object.entries($grouped)) {
            if (target === accountingIdPlatoniq.toString()) continue;
            const projectId = items[0]?.project;
            if (projectId) {
                names[target] = await getOwnerName(target, projectId);
            }
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
        const unsubscribe = groupedByOwner.subscribe(() => {
            loadDisplayNames();
        });
        return unsubscribe;
    });
</script>

{#if $groupedByOwner}
    <div class="flex flex-col gap-10">
        {#each Object.entries($groupedByOwner) as [target, items]}
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
{/if}

<Tipjar {accountingIdPlatoniq} {defaultCurrency} />
