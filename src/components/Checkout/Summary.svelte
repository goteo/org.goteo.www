<script lang="ts">
    import WarningIcon from "../../components/icons/Warning.svelte";
    import { t } from "../../i18n/store";
    import { cartAmount, cartByRecipient } from "../../stores/cart";
    import { formatCurrency } from "../../utils/currencies";
    import CollapsibleBox from "../CollapsibleBox.svelte";
    import Thtml from "../Thtml.svelte";

    let { hasError = false }: { hasError: boolean } = $props();

    const recipients = $derived(
        Object.entries($cartByRecipient).sort((a, b) => {
            if (a[0] < b[0]) return -1;
            if (a[0] > b[0]) return 1;
            return 0;
        }),
    );
</script>

<div class="flex w-full flex-col gap-6">
    <CollapsibleBox
        detailsId="checkout-details"
        isInitiallyCollapsed={false}
        buttonTextShow={$t("checkout.summary.show_details")}
        buttonTextHide={$t("checkout.summary.hide_details")}
    >
        {#snippet header()}
            <h2
                class={`flex items-center gap-2 text-base font-semibold lg:text-[32px] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {#if hasError}
                    <span class="h-6 w-6">
                        <WarningIcon />
                    </span>
                {/if}
                {$t("checkout.summary.total.title")}
            </h2>
            <p
                class={`text-[32px] leading-tight font-bold lg:text-[56px] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {formatCurrency($cartAmount)}
            </p>
        {/snippet}

        {#snippet content()}
            <hr class="bg-secondary h-px border-none" />
            <div>
                {#each recipients as [_, items]}
                    {@const name = items[0].recipientDisplayName}
                    {@const amount = items.reduce((sum, i) => sum + i.money.amount * i.quantity, 0)}
                    <p>
                        <Thtml
                            key="pages.checkout.summary.toRecipient"
                            vars={{
                                amount: `<strong>${formatCurrency(amount)}</strong>`,
                                name: name,
                            }}
                        />
                    </p>
                {/each}
            </div>
        {/snippet}
    </CollapsibleBox>
</div>
