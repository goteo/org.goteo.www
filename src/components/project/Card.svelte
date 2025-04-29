<script lang="ts">
    import type {
        Project,
        Budget,
        Accounting,
        ApiAccountingBalancePointsGetCollectionData,
        // GatewayCheckoutJsonld,
    } from "../../openapi/client/index";
    import { formatCurrency } from "../../utils/currencies";
    import ProgressChart from "./ProgressChart.svelte";
    import { t } from "../../i18n/store";
    export let project: Project;
    export let accounting: Accounting;
    // export let donations: GatewayCheckoutJsonld;
    export let balancePoints: ApiAccountingBalancePointsGetCollectionData;
    const campaignLabel: (keyof Budget)[] = ["optimum", "minimum"];

    $: minReached =
        accounting.balance?.amount !== undefined &&
        project.budget?.minimum?.money?.amount !== undefined &&
        Number(accounting.balance.amount) - Number(project.budget.minimum.money.amount) > 0;
</script>

<div
    class=" flex h-[100%] flex-col gap-6 rounded-[32px] border border-[#F3F3EF] bg-[#fff] p-6 shadow-[0_1px_3px_0_#0000001A,0_6px_6px_0_#00000017,0_13px_8px_0_#0000000D,0_22px_9px_0_#00000003,0_35px_10px_0_#00000000]"
>
    <div class="flex w-full items-center justify-end py-4">
        {#if minReached}
            <span class="border-tertiary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap">
                {$t("campaignProgress.minimumReached")}
            </span>
        {/if}
    </div>
    <ProgressChart {accounting} {project} {balancePoints} />
    <div class="col-span-2 mt-4 grid grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-[#575757]">{$t(`campaignProgress.obtained`)}</p>
                <p class="text-secondary text-[32px] font-bold">
                    {formatCurrency(
                        Number(accounting.balance?.amount) || 0,
                        accounting.balance?.currency ?? undefined,
                        {
                            showSymbol: true,
                        },
                    )}
                </p>
            </div>
            <div>
                <p class="text-[#575757]">{$t(`campaignProgress.donations`)}</p>
                <!-- TODO: fix get donations from API -->
                <p class="text-secondary text-[32px] font-bold">
                    <!-- {donations.totalItems} -->
                </p>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            {#each campaignLabel as key}
                <div>
                    <p class="text-[#575757]">{$t(`campaignProgress.${key}`)}</p>
                    {#if project.budget?.[key]?.money}
                        <p class="text-secondary text-[32px] font-bold">
                            {formatCurrency(
                                project.budget?.[key]?.money?.amount ?? 0,
                                project.budget?.[key]?.money?.currency ?? undefined,
                                { showSymbol: true },
                            )}
                        </p>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
    <button
        class="bg-primary bold text-tertiary w-full cursor-pointer rounded-3xl px-6 py-4 font-bold"
    >
        {$t("campaignProgress.donate")}
    </button>
</div>
