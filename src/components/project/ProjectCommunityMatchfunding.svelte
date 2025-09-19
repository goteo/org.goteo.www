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
        <div class="flex h-56 w-full items-center justify-center rounded-lg bg-red-500">😀</div>
        <div class="flex flex-col items-start text-left">
            <div class="text-secondary font-bold">
                {$t("project.tabs.community.matchfunding.contribution")}
            </div>
            <div class="flex flex-col items-start text-2xl">
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
    </div>
    <div class="text-secondary text-left text-2xl font-bold">
        {item.displayName}
    </div>
    <p class="text-left text-sm text-[#575757]">
        {item.message}
    </p>
</button>
