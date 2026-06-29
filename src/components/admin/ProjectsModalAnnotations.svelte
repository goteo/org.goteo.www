<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import { t } from "../../i18n/store";
    import Button from "../library/Button.svelte";
    import TextArea from "../library/TextArea.svelte";

    let { open = $bindable(false), annotationText = $bindable("") } = $props<{
        open: boolean;
        annotationText: string;
    }>();
</script>

<Modal
    bind:open
    title={$t("admin.projects.modals.annotations.title")}
    closeBtnClass="top-4 end-4 bg-transparent text-secondary hover:bg-transparent hover:text-secondary focus:ring-0 shadow-none"
    class="max-w-lg"
>
    <div class="flex flex-col gap-4">
        <TextArea
            id="annotations-input"
            bind:value={annotationText}
            label={$t("admin.projects.modals.annotations.placeholder")}
        />
        {#if !annotationText}
            <p class="text-content text-sm">{$t("admin.projects.modals.annotations.empty")}</p>
        {:else}{/if}
        <div class="flex justify-end">
            <Button kind="primary" onclick={() => (open = false)}>
                {#if annotationText}
                    {$t("admin.projects.modals.annotations.modify")}
                {:else}
                    {$t("admin.projects.modals.annotations.add")}
                {/if}
            </Button>
        </div>
    </div>
</Modal>
