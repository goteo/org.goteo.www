<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import MoreAndLess from "../icons/filters/MoreAndLess.svelte";

    import type { CheckoutItem } from "../../stores/checkoutsStore";

    export let item: CheckoutItem;
    export let onIncrement: (item: CheckoutItem) => void;
    export let onDecrement: (item: CheckoutItem) => void;
    export let onRemove: (item: CheckoutItem) => void;

    function handleDecrement() {
        if (item.quantity === 1) {
            onRemove(item);
        } else {
            onDecrement(item);
        }
    }
</script>

<div class="flex w-full flex-col gap-4">
    <div
        class="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-md md:flex-row md:items-center md:justify-between"
    >
        <div class="flex items-center gap-6">
            <div
                class="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-orange-200 md:h-40 md:w-40"
            >
                <!--
                    ProjectReward carries no image in the API — reward images only
                    exist as wizard-local draft state — so every item falls back to
                    the placeholder until the API exposes one.
                -->
                <span class="text-xl md:text-2xl">🙂</span>
            </div>
            <div class="flex flex-col gap-2 md:gap-4">
                <p class="text-secondary md:text-double text-lg font-bold">
                    {formatCurrency(item.money.amount, item.money.currency)}
                </p>
                <p class="text-secondary text-sm font-bold md:text-base">{item.title}</p>
                <p class="text-content text-sm">
                    {#if item.kind === "reward"}
                        {#if item.reward?.unitsClaimed! > 0}
                            <span
                                >{$t("pages.checkout.reward.claimed", {
                                    units: item.reward?.unitsClaimed!,
                                })}
                            </span>
                        {:else}
                            <span>{$t("pages.checkout.reward.unclaimed")} </span>
                        {/if}
                    {/if}
                </p>
            </div>
        </div>
        <div class="flex items-center justify-center gap-4 md:flex-col md:items-end md:gap-2">
            <div class="order-2 flex items-center gap-4 md:order-1">
                <button on:click={handleDecrement} class="cursor-pointer text-xl text-purple-800">
                    <MoreAndLess sign="less" />
                </button>
                <div class="relative flex w-4 items-center justify-center">
                    <span class="text-secondary absolute text-2xl font-bold">{item.quantity}</span>
                </div>

                <button
                    on:click={() => onIncrement(item)}
                    class="cursor-pointer text-xl text-purple-800"
                >
                    <MoreAndLess sign="more" />
                </button>
            </div>
        </div>
    </div>
    <!-- TODO: feature is not yet fully designed.  -->
    <!-- <div class="flex items-center gap-2">
            <input
                type="checkbox"
                id={`reward-checkbox-${item.key}`}
                class="accent-primary h-6 w-6 rounded"
            />
            <label for="donation-checkbox" class=" text-content">
                {$t("pages.checkout.changeAddressLabel")}
            </label>
        </div> -->
</div>
