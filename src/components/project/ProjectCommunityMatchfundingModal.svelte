<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    import type { ProjectSupport } from "../../openapi/client/index";

    let {
        item,
    }: {
        item: ProjectSupport & { displayName: string };
    } = $props();
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-row items-center justify-between gap-4">
        <div class="bg-tertiary h-16 w-16 shrink-0 rounded-xl"></div>
        <div class="flex flex-col items-end">
            <div class="text-sm font-bold text-black">
                {$t("pages.project.view.tabs.community.matchfunding.contribution")}
            </div>
            <p class="text-tertiary text-2xl font-bold">
                {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
            </p>
        </div>
    </div>
    <div class="flex flex-col gap-1">
        <div class="text-xl font-bold text-black">{item.displayName}</div>
        <div class="text-content text-sm">
            {$t("pages.project.view.tabs.community.role.matchfunding")}
        </div>
    </div>
    <p class="text-content text-sm">{item.message}</p>
</div>
