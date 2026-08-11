<script lang="ts">
    import { actions } from "astro:actions";

    import BannersForm from "./BannersForm.svelte";
    import BannersHistory from "./BannersHistory.svelte";
    import BannersTabs from "./BannersTabs.svelte";
    import { t } from "../../../../i18n/store";
    import Button from "../../../library/buttons/Button.svelte";
    import Toast from "../../../library/feedback/Toast.svelte";

    import type { BannerRow } from "./BannersHistory.svelte";

    interface Props {
        banners: BannerRow[];
    }

    let { banners }: Props = $props();

    const formId = "banners-form";

    let currentSubtab = $state("fields");
    let saving = $state(false);
    let showError = $state(false);
    let errorMessage = $state("");

    function handleTabChange(tabId: string) {
        currentSubtab = tabId;
    }

    async function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        saving = true;
        const { error } = await actions.createBanner(
            new FormData(event.currentTarget as HTMLFormElement),
        );
        saving = false;

        if (error) {
            errorMessage = error.message;
            showError = true;
            return;
        }

        window.location.reload();
    }
</script>

<div class="flex justify-between">
    <div class="flex flex-col gap-4">
        <h2 class="overflow-hidden text-[2.5rem] leading-12 font-bold text-ellipsis text-black">
            {$t("pages.admin.comm.banners.title")}
        </h2>
        <p class="text-content text-base font-normal">
            {$t("pages.admin.comm.banners.description")}
        </p>
    </div>
    {#if currentSubtab === "fields"}
        <Button
            class="self-top h-fit w-fit"
            kind="primary"
            type="submit"
            form={formId}
            disabled={saving}
        >
            {$t("common.save")}
        </Button>
    {/if}
</div>

<Toast variant="error" bind:showToast={showError}>{errorMessage}</Toast>

<div class="flex flex-col gap-6">
    <BannersTabs currentTab={currentSubtab} onTabChange={handleTabChange} />
    {#if currentSubtab === "fields"}
        <form id={formId} onsubmit={handleSubmit}>
            <BannersForm />
        </form>
    {:else if currentSubtab === "history"}
        <BannersHistory rows={banners} />
    {/if}
</div>
