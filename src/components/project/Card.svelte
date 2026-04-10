<script lang="ts">
    import ProgressChart from "./ProgressChart.svelte";
    import { t } from "../../i18n/store";
    import {
        type Project,
        type ApiAccountingBalancePointsGetCollectionData,
        type Money,
        type Accounting,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import Button from "../library/Button.svelte";
    import Grid from "../library/Grid.svelte";

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
    class="border-grey flex h-full flex-col gap-6 rounded-4xl border bg-[#fff] p-6 shadow-[0_1px_3px_0_#0000001A,0_6px_6px_0_#00000017,0_13px_8px_0_#0000000D,0_22px_9px_0_#00000003,0_35px_10px_0_#00000000]"
>
    <div class="flex w-full items-center justify-end">
        {#if hasReached(project.budget?.optimum?.money)}
            <span
                class="border-secondary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap"
            >
                {$t("domain.project.campaign.optimumReached")}
            </span>
        {:else if hasReached(project.budget?.minimum?.money)}
            <span
                class="border-secondary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap"
            >
                {$t("domain.project.campaign.minimumReached")}
            </span>
        {/if}
    </div>
    <ProgressChart {accounting} {project} {balancePoints} />
    <Grid class="col-span-2 grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-content text-sm">{$t("domain.project.campaign.obtained")}</p>
                <p class="text-3xl font-bold text-black">
                    {formatCurrency(
                        Number(accounting.balance?.amount) || 0,
                        accounting.balance?.currency ?? undefined,
                    )}
                </p>
            </div>
            <div>
                <p class="text-content text-sm">{$t("domain.project.campaign.supports")}</p>
                <p class="text-2xl font-bold text-black">
                    {totalSupports}
                </p>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-content text-sm">{$t("domain.project.budget.optimum")}</p>
                <p class="text-3xl font-bold text-black">
                    {formatCurrency(
                        project.budget?.optimum?.money?.amount ?? 0,
                        project.budget?.optimum?.money?.currency ?? undefined,
                    )}
                </p>
            </div>
            <div>
                <p class="text-content text-sm">{$t("domain.project.budget.minimum")}</p>
                <p class="text-2xl font-bold text-black">
                    {formatCurrency(
                        project.budget?.minimum?.money?.amount ?? 0,
                        project.budget?.minimum?.money?.currency ?? undefined,
                    )}
                </p>
            </div>
        </div>
    </Grid>
    <Button disabled={project.status !== "in_campaign"} class="w-full" onclick={onScrollToRewards}>
        {$t("domain.project.campaign.donate")}
    </Button>
</div>
