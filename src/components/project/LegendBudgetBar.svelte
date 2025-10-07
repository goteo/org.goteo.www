<script lang="ts">
    import type { ProjectBudgetItem } from "../../openapi/client/index";
    import { t } from "../../i18n/store";

    const typeBudget: Record<ProjectBudgetItem["type"], string> = {
        infrastructure: "#462949",
        material: "#E94668",
        task: "#99FFCC",
    };

    const legendEntries = Object.entries(typeBudget);
</script>

<div class="flex flex-row flex-wrap justify-end gap-6">
    {#each legendEntries as [key, color]}
        <div class="flex flex-row items-center gap-2">
            <div class="h-4 w-6 rounded-sm" style="background-color: {color};"></div>
            <span class="text-sm capitalize">{$t(`project.tabs.budget.typeBudget.${key}`)}</span>
        </div>
    {/each}
    <div class="flex flex-row items-center gap-2">
        <div class="bg-secondary h-2 w-2 rounded-full"></div>
        <span class="text-sm">{$t("project.tabs.budget.campaingState")}</span>
    </div>
</div>
