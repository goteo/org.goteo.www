<script lang="ts">
    import { formatCurrency } from "../../utils/currencies";
    import MinusIcon from "../../svgs/MinusIcon.svelte";
    import PlusIcon from "../../svgs/PlusIcon.svelte";
    import TrashIcon from "../../svgs/TrashIcon.svelte";
    import type { CartItem } from "../../stores/cart";
    import { t } from "../../i18n/store";
    export let item: CartItem;
    export let onIncrement;
    export let onDecrement;
    export let onRemove;
</script>

{#if item.amount > 0}
    <div class="flex w-full flex-col gap-4">
        <div class=" flex items-center justify-between rounded-2xl bg-white p-4 shadow-md">
            <div class="flex items-center gap-6">
                <div
                    class="flex h-[160px] w-[160px] items-center justify-center overflow-hidden rounded-3xl bg-orange-200"
                >
                    {#if item.image}
                        <img
                            src={item.image}
                            alt={item.title}
                            class="h-[160px] w-[160px] object-cover"
                        />
                    {:else}
                        <span class="text-2xl">🙂</span>
                    {/if}
                </div>
                <div class="flex flex-col gap-4">
                    <p class="text-tertiary text-[32px] font-bold">
                        {formatCurrency(item.amount, "EUR", { showSymbol: true })}
                    </p>
                    <p class="text-tertiary font-bold">{item.title}</p>
                    <p class="text-[#575757]">
                        {#if typeof item.claimed === "number"}
                            {#if item.claimed > 0}
                                <span>{item.claimed} {$t("checkout.reward.claimed")} </span>
                            {:else}
                                <span>{$t("checkout.reward.unclaimed")} </span>
                            {/if}
                        {/if}
                    </p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="flex items-center gap-4">
                    <button
                        on:click={() => onDecrement(item)}
                        class="cursor-pointer text-xl text-purple-800"
                    >
                        <MinusIcon />
                    </button>
                    <div class="relative flex w-4 items-center justify-center">
                        <span class="text-tertiary absolute text-2xl font-bold"
                            >{item.quantity}</span
                        >
                    </div>

                    <button
                        on:click={() => onIncrement(item)}
                        class="cursor-pointer text-xl text-purple-800"
                    >
                        <PlusIcon />
                    </button>
                </div>

                <button
                    on:click={() => onRemove(item)}
                    class="cursor-pointer text-xl text-purple-800"
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
        <!-- TODO: feature is not yet fully designed.  -->
        <!-- <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id={`reward-checkbox-${item.key}`}
                class="accent-primary h-6 w-6 rounded"
            />
            <label for="donation-checkbox" class=" text-[#575757]">
                {$t("checkout.changeAddressLabel")}
            </label>
        </div> -->
    </div>
{/if}
