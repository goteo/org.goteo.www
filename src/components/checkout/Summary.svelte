<script lang="ts">
    import WarningIcon from "../../components/icons/status/Warning.svelte";
    import CollapsibleBox from "../../components/library/layout/CollapsibleBox.svelte";
    import Thtml from "../../components/library/typography/Thtml.svelte";
    import { t } from "../../i18n/store";
    import { cartAmount, cartByRecipient } from "../../stores/cart";
    import { formatCurrency } from "../../utils/currencies";
    import { multiplyMoney, sumMoney } from "../../utils/money";

    let { hasError = false }: { hasError?: boolean } = $props();

    const projectsTotal = $derived.by(() => {
        const data = $cartByRecipient;
        const projectItems = Object.entries(data)
            .filter(([key]) => key !== "foundation")
            .flatMap(([, items]) => items);

        return sumMoney(projectItems.map((i) => multiplyMoney(i.money, i.quantity)));
    });

    const foundationTotal = $derived.by(() => {
        const foundationItems = $cartByRecipient["foundation"] || [];
        return sumMoney(foundationItems.map((i) => multiplyMoney(i.money, i.quantity)));
    });
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
            <hr class="bg-secondary/20 my-4 h-px w-full" />
            <div>
                <p class="text-sm">
                    <Thtml
                        key="pages.checkout.summary.breakdown"
                        vars={{
                            projectsAmount: `<strong>${formatCurrency(projectsTotal)}</strong>`,
                            foundationAmount: `<strong>${formatCurrency(foundationTotal)}</strong>`,
                        }}
                    />
                </p>
            </div>
        {/snippet}
    </CollapsibleBox>
</div>
