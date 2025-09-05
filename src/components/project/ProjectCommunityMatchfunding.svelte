<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    let { item, openModal = $bindable(), selectedProjectSupport = $bindable() } = $props();
</script>

<button
    class="flex cursor-pointer overflow-hidden rounded-4xl bg-white transition-shadow duration-200 ease-in-out hover:shadow-lg"
    onclick={() => {
        selectedProjectSupport = item;
        openModal = true;
    }}
>
    <div class="flex w-1/3 items-center justify-center bg-red-500">😀</div>
    <div class="flex w-2/3 flex-col gap-4 p-6">
        <div class="text-secondary flex flex-col items-end gap-2 font-bold">
            <span>{$t("project.tabs.community.matchfunding.contribution")}</span>
            <div class="flex flex-col items-end text-2xl">
                <div class="flex items-center gap-2">
                    <span>{$t("project.tabs.community.matchfunding.aported")}</span>
                    <span>
                        {formatCurrency(
                            item.money?.amount ?? 0,
                            item.money?.currency ?? "undefined",
                        )}
                    </span>
                </div>
                <div class="flex items-center gap-2 text-[#5757577A]">
                    <span>{$t("project.tabs.community.matchfunding.up_to")}</span>
                    <span class="font-bold">
                        {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
                    </span>
                </div>
            </div>
        </div>
        <div class="text-secondary line-clamp-2 text-2xl font-bold">
            {item.displayName}
        </div>
        <p class="line-clamp-2 text-sm text-[#575757]">
            {item.message}
        </p>
    </div>
</button>
