<script lang="ts">
    import { t } from "../../i18n/store";
    import { formatCurrency } from "../../utils/currencies";

    let { item, openModal = $bindable(), selectedProjectSupport = $bindable() } = $props();
</script>

<button
    class="flex h-full w-full cursor-pointer overflow-hidden rounded-4xl bg-white transition-shadow duration-200 ease-in-out hover:shadow-lg"
    onclick={() => {
        selectedProjectSupport = item;
        openModal = true;
    }}
>
    <div
        class="border-grey flex h-58 cursor-pointer overflow-hidden rounded-4xl border bg-white shadow-sm transition-shadow duration-200 ease-in-out hover:shadow-lg md:flex-row"
    >
        <div class="bg-tertiary flex h-full w-full shrink-0 overflow-hidden md:h-auto md:w-2/5">
            <!--
        <img
            src="/imgs/card-comunidad.png"
            alt="Community donation"
            class="h-full w-full object-cover"
        />
       -->
        </div>
        <div class="flex w-full flex-col justify-between p-6">
            <div>
                <div class="flex flex-col items-end font-bold text-black">
                    <div class="text-base">
                        {$t("pages.project.view.tabs.community.matchfunding.contribution")}
                    </div>
                    <div class="flex flex-col items-end text-2xl">
                        <div class="flex items-center">
                            {$t("pages.project.view.tabs.community.matchfunding.aported")}
                            {formatCurrency(item.money?.amount ?? 0, item.money?.currency ?? "")}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div class="line-clamp-2 text-left text-2xl font-bold text-black">
                    {item.displayName}
                </div>
                <p class="text-content line-clamp-2 text-left text-sm">
                    {item.message}
                </p>
            </div>
        </div>
    </div>
</button>
