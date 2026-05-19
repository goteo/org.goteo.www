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
        buttonTextShow={$t("checkout.summary.show_details")}
        buttonTextHide={$t("checkout.summary.hide_details")}
    >
        {#snippet header()}
            <div class="flex flex-col items-start gap-1">
                <h2
                    class={`font-karla flex items-center gap-2 text-xl leading-tight font-medium lg:text-[32px] lg:leading-[40px] ${hasError ? "text-tertiary" : "text-secondary"}`}
                >
                    {#if hasError}
                        <span class="h-6 w-6"><WarningIcon /></span>
                    {/if}
                    {$t("checkout.summary.total.title")}
                </h2>

                <p
                    class={`font-karla text-[48px] leading-14 font-bold tracking-tight lg:text-[56px] lg:leading-[64px] ${hasError ? "text-tertiary" : "text-secondary"}`}
                >
                    {formatCurrency($cartAmount || 0)}
                </p>
            </div>
        {/snippet}

        {#snippet content()}
    <div class="flex flex-col w-full pb-6"> <div class="bg-secondary mt-0 mb-4 h-px w-full max-w-[620px] border-none"></div>

        <div class="text-content font-karla text-[16px] leading-6 font-normal">
            {#each recipients() as [id, items], index}
                {@const amount = items.reduce((sum, i) => sum + i.money.amount * i.quantity, 0)}

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
                        <span class="mx-2 font-medium text-content">+</span>
                    {/if}
                </span>
            {/each}
        </div>
    </div>
{/snippet}
    </CollapsibleBox>
</div>
