<script lang="ts">
    import {
        type Project,
        type ApiAccountingBalancePointsGetCollectionData,
        type AccountingBalance,
        type Money,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import ProgressChart from "./ProgressChart.svelte";
    import { t } from "../../i18n/store";

    export let project: Project;
    export let totalSupports: number = 0;
    export let accountingBalance: AccountingBalance;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;

    function hasReached(money?: Money) {
        return (
            money !== undefined &&
            accountingBalance.balance?.amount !== undefined &&
            Number(accountingBalance.balance.amount) - Number(money.amount) > 0
        );
    }

    function scrollToRewards() {
        const rewardsElement = document.getElementById("tab-rewards");
        if (rewardsElement) {
            rewardsElement.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }
</script>

<div
    class=" flex h-full flex-col gap-6 rounded-[32px] border border-[#F3F3EF] bg-[#fff] p-6 shadow-[0_1px_3px_0_#0000001A,0_6px_6px_0_#00000017,0_13px_8px_0_#0000000D,0_22px_9px_0_#00000003,0_35px_10px_0_#00000000]"
>
    <div class="flex w-full items-center justify-end">
        {#if hasReached(project.budget?.optimum?.money)}
            <span class="border-tertiary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap">
                {$t("campaignProgress.optimumReached")}
            </span>
        {:else if hasReached(project.budget?.minimum?.money)}
            <span class="border-tertiary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap">
                {$t("campaignProgress.minimumReached")}
            </span>
        {/if}
    </div>
    <ProgressChart balance={accountingBalance} {project} {balancePoints} />
    <div class="col-span-2 grid grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-sm text-[#575757]">{$t(`campaignProgress.obtained`)}</p>
                <p class="text-secondary text-3xl font-bold">
                    {formatCurrency(
                        Number(accountingBalance.balance?.amount) || 0,
                        accountingBalance.balance?.currency ?? undefined,
                    )}
                </p>
            </div>
            <div>
                <p class="text-sm text-[#575757]">{$t(`campaignProgress.supports`)}</p>
                <p class="text-secondary text-2xl font-bold">
                    {totalSupports}
                </p>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-sm text-[#575757]">{$t(`campaignProgress.optimum`)}</p>
                <p class="text-secondary text-3xl font-bold">
                    {formatCurrency(
                        project.budget?.optimum?.money?.amount ?? 0,
                        project.budget?.optimum?.money?.currency ?? undefined,
                    )}
                </p>
            </div>
            <div>
                <p class="text-sm text-[#575757]">{$t(`campaignProgress.minimum`)}</p>
                <p class="text-secondary text-2xl font-bold">
                    {formatCurrency(
                        project.budget?.minimum?.money?.amount ?? 0,
                        project.budget?.minimum?.money?.currency ?? undefined,
                    )}
                </p>
            </div>
        </div>
    </div>
    <button
        class="bg-primary bold text-tertiary w-full cursor-pointer rounded-3xl px-6 py-4 font-bold"
        on:click={scrollToRewards}
    >
        {$t("campaignProgress.donate")}
    </button>
</div>
