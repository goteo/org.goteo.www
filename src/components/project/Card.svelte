<script lang="ts">
    import {
        type Project,
        type ApiAccountingBalancePointsGetCollectionData,
        type Money,
        type Accounting,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import ProgressChart from "./ProgressChart.svelte";
    import { t } from "../../i18n/store";
    import Button from "../library/Button.svelte";

    export let project: Project;
    export let totalSupports: number = 0;
    export let accounting: Accounting;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;
    export let onScrollToRewards: () => void;

    function hasReached(money?: Money) {
        return (
            money !== undefined &&
            accounting.balance?.amount !== undefined &&
            Number(accounting.balance.amount) - Number(money.amount) > 0
        );
    }
</script>

<div
    class=" border-grey flex h-full flex-col gap-6 rounded-[32px] border bg-[#fff] p-6 shadow-[0_1px_3px_0_#0000001A,0_6px_6px_0_#00000017,0_13px_8px_0_#0000000D,0_22px_9px_0_#00000003,0_35px_10px_0_#00000000]"
>
    <div class="flex w-full items-center justify-end">
        {#if hasReached(project.budget?.optimum?.money)}
            <span
                class="border-secondary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap"
            >
                {$t("campaignProgress.optimumReached")}
            </span>
        {:else if hasReached(project.budget?.minimum?.money)}
            <span
                class="border-secondary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap"
            >
                {$t("campaignProgress.minimumReached")}
            </span>
        {/if}
    </div>
    <ProgressChart {accounting} {project} {balancePoints} />
    <div class="col-span-2 grid grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-content text-sm">{$t(`campaignProgress.obtained`)}</p>
                <p class="text-3xl font-bold text-black">
                    {formatCurrency(
                        Number(accounting.balance?.amount) || 0,
                        accounting.balance?.currency ?? undefined,
                    )}
                </p>
            </div>
            <div>
                <p class="text-content text-sm">{$t(`campaignProgress.supports`)}</p>
                <p class="text-2xl font-bold text-black">
                    {totalSupports}
                </p>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-content text-sm">{$t(`campaignProgress.optimum`)}</p>
                <p class="text-3xl font-bold text-black">
                    {formatCurrency(
                        project.budget?.optimum?.money?.amount ?? 0,
                        project.budget?.optimum?.money?.currency ?? undefined,
                    )}
                </p>
            </div>
            <div>
                <p class="text-content text-sm">{$t(`campaignProgress.minimum`)}</p>
                <p class="text-2xl font-bold text-black">
                    {formatCurrency(
                        project.budget?.minimum?.money?.amount ?? 0,
                        project.budget?.minimum?.money?.currency ?? undefined,
                    )}
                </p>
            </div>
        </div>
    </div>
    <Button disabled={project.status !== "in_campaign"} class="w-full" onclick={onScrollToRewards}>
        {$t("campaignProgress.donate")}
    </Button>
</div>
