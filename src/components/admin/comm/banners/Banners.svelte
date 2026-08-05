<script lang="ts">
    import { t } from "../../../../i18n/store";
    import Button from "../../../library/buttons/Button.svelte";
    import BannersFields from "./BannersFields.svelte";
    import BannersHistory from "./BannersHistory.svelte";
    import BannersTabs from "./BannersTabs.svelte";

    let currentSubtab = $state("fields");

    function handleTabChange(tabId: string) {
        currentSubtab = tabId;
    }
</script>

<div class="flex justify-between">
    <div class="flex flex-col gap-4">
        <h2 class="overflow-hidden text-[2.5rem] leading-12 font-bold text-ellipsis text-black">
            {$t("pages.admin.comm.banners.title")}
        </h2>
        <p class="text-content text-base font-normal">{$t("pages.admin.comm.banners.description")}</p>
    </div>
    {#if currentSubtab === "fields"}
        <Button class="w-fit h-fit self-top" kind="primary">
            {$t("common.save")}
        </Button>
    {/if}
</div>

<div class="flex flex-col gap-6">
    <BannersTabs currentTab={currentSubtab} onTabChange={handleTabChange} />
    {#if currentSubtab === "fields"}
        <BannersFields />
    {:else if currentSubtab === "history"}
        <BannersHistory />
    {/if}
</div>
