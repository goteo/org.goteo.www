<script lang="ts">
    import WarningIcon from "../../components/icons/status/Warning.svelte";
    import { t } from "../../i18n/store";
    import { cartAmount, cartByRecipient } from "../../stores/checkoutsStore";
    import { formatCurrency } from "../../utils/currencies";
    import { multiplyMoney, sumMoney } from "../../utils/money";
    import CollapsibleBox from "../library/layout/CollapsibleBox.svelte";
    import Thtml from "../library/typography/Thtml.svelte";

    let { hasError = false }: { hasError?: boolean } = $props();

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
        buttonTextShow={$t("pages.checkout.summary.showDetails")}
        buttonTextHide={$t("pages.checkout.summary.hideDetails")}
    >
        {#snippet header()}
            <h2
                class={`lg:text-double flex items-center gap-2 text-base font-semibold ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {#if hasError}
                    <span class="h-6 w-6">
                        <WarningIcon />
                    </span>
                {/if}
                {$t("pages.checkout.summary.total.title")}
            </h2>
            <p
                class={`text-double leading-tight font-bold lg:text-[3.5rem] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {formatCurrency($cartAmount)}
            </p>
        {/snippet}

        {#snippet content()}
            <hr class="bg-secondary h-px border-none" />
            <div>
                {#each recipients as [_, items]}
                    {@const name = items[0].recipientDisplayName}
                    {@const amount = sumMoney(items.map((i) => multiplyMoney(i.money, i.quantity)))}
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
