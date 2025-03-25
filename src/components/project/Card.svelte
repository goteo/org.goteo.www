<script lang="ts">
    import type { Project, Budget } from "../../openapi/client/index";
    import { getCurrencySymbol } from "../../utils/currencySymbols";
    import ProgressChart from "./ProgressChart.svelte";
    import { t } from "../../i18n/store";
    export let data: Project;
    const campaignLabel: (keyof Budget)[] = ["optimum", "minimum"];
</script>

<div class=" flex h-[100%] flex-col rounded-[32px] border border-red-50 bg-[#fff] p-6">
    <div class="flex w-full items-center justify-end py-4">
        <span class="border-tertiary self-end rounded-2xl border px-2 py-1 text-xs text-nowrap">
            {$t("campaignProgress.minimumReached")}
        </span>
    </div>
    <ProgressChart />
    <div class="col-span-2 mt-4 grid grid-cols-2 gap-6">
        <div class="flex flex-col gap-4">
            <div>
                <p class="text-[#575757]">Obtenido</p>
                <p class="text-secondary text-[32px] font-bold">150.547 €</p>
            </div>
            <div>
                <p class="text-[#575757]">Donaciones Realizadas</p>
                <p class="text-secondary text-[32px] font-bold">2128</p>
            </div>
        </div>
        <div class="flex flex-col gap-4">
            {#each campaignLabel as key}
                <div>
                    <p class="text-[#575757]">{$t(`campaignProgress.${key}`)}</p>
                    {#if data.budget?.[key]?.money}
                        <p class="text-secondary text-[32px] font-bold">
                            {data.budget[key].money.amount?.toLocaleString("es-ES")}
                            {data.budget[key].money.currency
                                ? getCurrencySymbol(data.budget[key].money.currency)
                                : ""}
                        </p>
                    {/if}
                </div>
            {/each}
        </div>
    </div>
</div>
