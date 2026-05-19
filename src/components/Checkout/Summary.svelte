<script lang="ts">
    import WarningIcon from "../../components/icons/Warning.svelte";
    import { t } from "../../i18n/store";
    import { cartAmount, cartByRecipient } from "../../stores/cart";
    import { formatCurrency } from "../../utils/currencies";
    import CollapsibleBox from "../CollapsibleBox.svelte";
    import Thtml from "../Thtml.svelte";

    let { hasError = false }: { hasError?: boolean } = $props();

    const recipients = $derived(() => {
        const data = { ...$cartByRecipient };

        if (!data["foundation"]) {
            data["foundation"] = [];
        }
        if (Object.keys(data).length === 1 && data["foundation"]) {
            data["project_placeholder"] = [];
        }

        return Object.entries(data).sort((a, b) => {
            if (a[0] === "foundation") return 1;
            if (b[0] === "foundation") return -1;
            return a[0].localeCompare(b[0]);
        });
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
                class={`flex items-center gap-2 text-base font-semibold lg:text-[32px] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {#if hasError}
                    <span class="h-6 w-6">
                        <WarningIcon />
                    </span>
                {/if}
                {$t("pages.checkout.summary.total.title")}
            </h2>
            <p
                class={`text-[32px] leading-tight font-bold lg:text-[56px] ${hasError ? "text-tertiary" : "text-secondary"}`}
            >
                {formatCurrency($cartAmount)}
            </p>
        {/snippet}

        {#snippet content()}
            <div class="flex w-full flex-col pb-6">
                <div class="bg-secondary mt-0 mb-4 h-px w-full max-w-155 border-none"></div>

                <div class="text-content font-karla text-[16px] leading-6 font-normal">
                    {#each recipients() as [id, items], index}
                        {@const amount = items.reduce(
                            (sum, i) => sum + i.money.amount * i.quantity,
                            0,
                        )}

                        <span class="inline">
                            <Thtml
                                key={id === "foundation"
                                    ? "checkout.summary.resume.foundationPrefix"
                                    : "checkout.summary.resume.donationsPrefix"}
                                vars={{
                                    amount: `<strong class="font-bold text-secondary">${formatCurrency(amount)}</strong>`,
                                }}
                            />

                            {#if index < recipients().length - 1}
                                <span class="text-content mx-2 font-medium">+</span>
                            {/if}
                        </span>
                    {/each}
                </div>
            </div>
        {/snippet}
    </CollapsibleBox>
</div>
