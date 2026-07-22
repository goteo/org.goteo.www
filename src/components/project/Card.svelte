<script lang="ts">
    import ProgressChart from "./ProgressChart.svelte";
    import { t } from "../../i18n/store";
    import {
        type Project,
        type Money,
        type Accounting,
        type AccountingBalancePoint,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import { gt } from "../../utils/money";
    import Button from "../library/buttons/Button.svelte";
    import Card from "../library/cards/Card.svelte";
    import Grid from "../library/layout/Grid.svelte";

    export let project: Project;
    export let totalSupports: number = 0;
    export let accounting: Accounting;
    export let balancePoints: AccountingBalancePoint[];
    export let onScrollToRewards: () => void;

    function hasReached(money?: Money) {
        return money !== undefined && accounting.balance != null && gt(accounting.balance, money);
    }
</script>

<Card
    class="h-full items-stretch gap-6 shadow-[0_1px_3px_0_#0000001A,0_6px_6px_0_#00000017,0_13px_8px_0_#0000000D,0_22px_9px_0_#00000003,0_35px_10px_0_#00000000]"
>
    <div class="relative">
        <ProgressChart {accounting} {project} {balancePoints} />
        {#if hasReached(project.budget?.optimum?.money)}
            <span
                class="border-secondary absolute top-3 right-3 rounded-lg border bg-white px-2 py-1 text-xs text-nowrap"
            >
                {$t("domain.project.campaign.optimumReached")}
            </span>
        {:else if hasReached(project.budget?.minimum?.money)}
            <span
                class="border-secondary absolute top-3 right-3 rounded-4xl border bg-white px-2 py-1 text-xs text-nowrap"
            >
                {$t("domain.project.campaign.minimumReached")}
            </span>
        {/if}
    </div>
    <Grid class="col-span-2 grid grid-cols-2 gap-6 lg:grid-cols-2">
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-content text-sm">{$t("domain.project.campaign.obtained")}</p>
                <p class="text-3xl font-bold text-black">
                    {formatCurrency(accounting.balance)}
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
                    {formatCurrency(project.budget?.optimum?.money)}
                </p>
            </div>
            <div>
                <p class="text-content text-sm">{$t("domain.project.budget.minimum")}</p>
                <p class="text-2xl font-bold text-black">
                    {formatCurrency(project.budget?.minimum?.money)}
                </p>
            </div>
        </div>
    </Grid>
    <Button
        disabled={project.status !== "in_campaign"}
        class="w-full {project.status !== 'in_campaign' ? 'hover:cursor-not-allowed' : ''}"
        onclick={onScrollToRewards}
    >
        {$t("domain.project.campaign.donate")}
    </Button>
</Card>
