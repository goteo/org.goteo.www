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
    <div class="flex flex-col items-start gap-4">
        <div class="flex h-56 w-full items-center justify-center rounded-lg">😀</div>
        <div class="flex flex-col items-start text-left">
            <div class="text-secondary font-bold">
                {$t("project.tabs.community.contribution")}
            </div>
            <p class="text-secondary text-2xl font-bold">
                {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
            </p>
        </div>
    </div>
    <div class="text-secondary text-left text-2xl font-bold">
        {item.displayName}
    </div>
    <div class="line-clamp-2 text-left text-sm text-[#575757]">
        {#if item.message}
            {item.message}
        {:else}
            {$t("project.tabs.community.noComment")}
        {/if}
    </div>
</button>
