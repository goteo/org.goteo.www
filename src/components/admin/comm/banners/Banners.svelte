<script lang="ts">
    import BannersForm from "./BannersForm.svelte";
    import BannersHistory from "./BannersHistory.svelte";
    import BannersTabs from "./BannersTabs.svelte";
    import { t } from "../../../../i18n/store";
    import Toast from "../../../library/feedback/Toast.svelte";

    import type { BannerRecord } from "../../../../repositories/banner";

    interface Props {
        banners: BannerRecord[];
    }

    let { banners }: Props = $props();

    let currentSubtab = $state("fields");
    let saving = $state(false);
    let showError = $state(false);
    let errorMessage = $state("");

    function handleTabChange(tabId: string) {
        currentSubtab = tabId;
    }
</script>

<div class="flex flex-col gap-4">
    <h2 class="overflow-hidden text-[2.5rem] leading-12 font-bold text-ellipsis text-black">
        {$t("pages.admin.comm.banners.title")}
    </h2>
    <p class="text-content text-base font-normal">
        {$t("pages.admin.comm.banners.description")}
    </p>
</div>

<Toast variant="error" bind:showToast={showError}>{errorMessage}</Toast>

<div class="flex flex-col gap-6">
    <BannersTabs currentTab={currentSubtab} onTabChange={handleTabChange} />
    {#if currentSubtab === "fields"}
        <BannersForm />
    {:else if currentSubtab === "history"}
        <BannersHistory rows={banners} />
    {/if}
</div>
