<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import { t } from "../../i18n/store";
    import Button from "../library/Button.svelte";
    import TextInput from "../library/TextInput.svelte";

    let {
        open = $bindable(false),
        paidValue = $bindable(""),
        paidMatchfundingValue = $bindable(""),
    } = $props<{
        open: boolean;
        paidValue: string;
        paidMatchfundingValue: string;
    }>();
</script>

<Modal
    bind:open
    title={$t("admin.projects.modals.paid.title")}
    closeBtnClass="top-4 end-4 bg-transparent text-secondary hover:bg-transparent hover:text-secondary focus:ring-0 shadow-none"
    class="max-w-lg"
>
    <div class="flex flex-col gap-6">
        <p class="text-content text-sm">
            {$t("admin.projects.modals.paid.description")}
        </p>
        <div class="flex gap-4">
            <TextInput bind:value={paidValue} labelText={$t("admin.projects.modals.paid.input")} />
            <TextInput
                bind:value={paidMatchfundingValue}
                labelText={$t("admin.projects.modals.paid.matchfunding")}
            />
        </div>
        <div class="flex justify-end">
            <Button kind="primary" onclick={() => (open = false)}>
                {$t("admin.projects.modals.paid.save")}
            </Button>
        </div>
    </div>
</Modal>
