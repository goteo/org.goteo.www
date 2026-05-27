<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import Goteo from "../icons/Goteo.svelte";

    import type { ProjectSupport } from "../../openapi/client/index";

    let {
        item,
    }: {
        item: ProjectSupport & { displayName: string; avatar: string | undefined };
    } = $props();
</script>

<div class="flex flex-col gap-4">
    <div class="flex flex-row items-center justify-between gap-4">
        {#if item.avatar}
            <img src={item.avatar} alt={item.displayName} class="h-16 w-16 shrink-0 rounded-xl object-cover" />
        {:else}
            <Goteo />
        {/if}
        <div class="flex flex-col items-end">
            <div class="text-sm font-bold text-black">
                {$t("pages.project.view.tabs.community.contribution")}
            </div>
            <p class="text-2xl font-bold text-black">
                {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
            </p>
        </div>
    </div>
    <div class="flex flex-col gap-1">
        <div class="text-xl font-bold text-black">{item.displayName}</div>
        <div class="text-content text-sm">
            {$t("pages.project.view.tabs.community.role.sponsor")}
        </div>
    </div>
    <p class="text-content text-sm">{item.message}</p>
</div>
