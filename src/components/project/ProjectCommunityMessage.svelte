<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    let { item, openModal = $bindable(), selectedProjectSupport = $bindable() } = $props();
</script>

<button
    class="flex cursor-pointer flex-col gap-4 rounded-4xl bg-white p-6 transition-shadow duration-200 ease-in-out hover:shadow-lg"
    onclick={() => {
        selectedProjectSupport = item;
        openModal = true;
    }}
>
    <div class="flex flex-row items-center justify-between gap-4">
        <div class="flex h-16 w-16 items-center justify-center rounded-lg">😀</div>
        <div class="flex flex-col items-end">
            <div class="font-bold text-black">
                {$t("project.tabs.community.contribution")}
            </div>
            <p class="text-2xl font-bold text-black">
                {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
            </p>
        </div>
    </div>
    <div class="self-start text-left text-2xl font-bold text-black">
        {item.displayName}
    </div>
    {#if item.message}
        <div class="text-content line-clamp-2 self-start text-left text-sm">
            {item.message}
        </div>
    {/if}
</button>
