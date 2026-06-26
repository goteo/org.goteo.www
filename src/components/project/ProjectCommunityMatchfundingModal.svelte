<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    import type { ProjectSupport } from "../../openapi/client/index";

    let {
        item,
    }: {
        item: ProjectSupport;
    } = $props();
</script>

<div class="-m-6 flex flex-col overflow-hidden rounded-3xl md:flex-row">
    <div
        class="bg-tertiary flex h-48 w-full shrink-0 items-center justify-center md:h-auto md:w-2/5"
    ></div>
    <div class="flex flex-col gap-4 p-6">
        <div class="flex flex-col gap-1">
            <div class="text-sm font-bold text-black">
                {$t("pages.project.view.tabs.community.matchfunding.contribution")}
            </div>
            <p class="text-tertiary text-2xl font-bold">
                {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
            </p>
        </div>
        <div class="text-xl font-bold text-black">{item.displayName}</div>
        <p class="text-content text-sm">{item.message}</p>
    </div>
</div>
