<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";
    import Goteo from "../icons/Goteo.svelte";

    import type { ProjectSupport } from "../../openapi/client/index";

    let {
        item,
        onclick,
    }: {
        item: ProjectSupport & { displayName: string; avatar: string | undefined };
        onclick?: () => void;
    } = $props();
</script>

<button
    class="border-grey flex h-58 w-full cursor-pointer flex-col gap-4 rounded-4xl border bg-white p-6 text-left shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-lg"
    {onclick}
>
    <div class="flex w-full flex-row items-center justify-between gap-4">
        {#if item.avatar}
            <img
                src={item.avatar}
                alt={item.displayName}
                class="h-16 w-16 shrink-0 rounded-xl object-cover"
            />
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
    <div class="mt-auto flex w-full flex-col gap-1">
        <div class="text-xl font-bold text-black">{item.displayName}</div>
        <div class="text-content text-sm">
            {$t("pages.project.view.tabs.community.role.sponsor")}
        </div>
    </div>
    {#if item.message}
        <div class="text-content line-clamp-2 w-full text-sm">{item.message}</div>
    {/if}
</button>
