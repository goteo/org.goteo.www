<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import { untrack } from "svelte";

    import DeleteModal from "./DeleteModal.svelte";
    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import { t } from "../../../i18n/store";
    import { client } from "../../../openapi/client/client.gen";
    import { apiProjectsIdOrSlugGetUrl } from "../../../openapi/client/operation-paths.gen";
    import { DEFAULT_CURRENCY } from "../../../utils/currencies";
    import Button from "../../library/buttons/Button.svelte";
    import FileUpload from "../../library/inputs/FileUpload.svelte";
    import MoneyInput from "../../library/inputs/MoneyInput.svelte";
    import TextArea from "../../library/inputs/TextArea.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { Project, ProjectReward } from "../../../openapi/client";
    import type { UploadedObject } from "../../../utils/media/objectStorage.types";

    let {
        open = $bindable(false),
        project,
        reward,
        onSave,
        onDelete,
    }: {
        open: boolean;
        project: Project;
        reward?: ProjectReward;
        onSave: (data: ProjectReward | null) => void;
        onDelete?: () => void;
    } = $props();

    let draft: ProjectReward = $derived.by(() => {
        if (reward) {
            return reward;
        }

        return {
            project: client.buildUrl({
                url: apiProjectsIdOrSlugGetUrl,
                path: { idOrSlug: project.id },
            }),
            title: "",
            description: "",
            cover: "",
            money: { amount: 0, currency: DEFAULT_CURRENCY },
            isFinite: true,
            unitsTotal: 1,
        };
    });

    let openDeleteModal = $state(false);

    function handleSaveOrCreate() {
        console.log(draft);
        onSave(draft);
    }

    function handleDeleteClick() {
        if (reward) {
            onDelete?.();
            openDeleteModal = false;
            open = false;
        }
    }
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 bg-transparent backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    bodyClass="p-0"
>
    <div
        class="flex flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg"
        role="presentation"
        onclick={(e) => e.stopPropagation()}
    >
        <Title level={2} variant="subsection">
            {$t("pages.project.edit.rewards.modal.title")}
        </Title>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.rewards.modal.description")}
        </p>
        <div class="flex flex-col gap-4 pt-2">
            <TextInput
                bind:value={draft.title}
                labelText={$t("pages.project.edit.rewards.modal.placeholders.title")}
                placeholder={$t("pages.project.edit.rewards.modal.placeholders.title")}
            />
            <TextArea
                bind:value={draft.description!}
                labelText={$t("pages.project.edit.rewards.modal.placeholders.description")}
                placeholder={$t("pages.project.edit.rewards.modal.placeholders.description")}
                rows={5}
            />
            <MoneyInput
                amount={draft.money.amount}
                currency={draft.money.currency}
                labelText={$t("pages.project.edit.rewards.modal.placeholders.moneyAmount")}
                helperText={$t("pages.project.edit.rewards.modal.placeholders.moneyAmount")}
                onInput={(money) => (draft.money = money)}
            />
            <div class="flex flex-col gap-6">
                <FileUpload onUpload={(file) => (draft.cover = file.url)} />
                <RewardItemsSelector bind:units={draft.unitsTotal!} bind:limited={draft.isFinite} />
            </div>
        </div>
        <div class="flex items-center justify-end gap-4">
            {#if reward && onDelete}
                <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                    {$t("common.remove")}
                </Button>
                <DeleteModal
                    variant="rewards"
                    bind:open={openDeleteModal}
                    onclick={() => handleDeleteClick()}
                />
            {/if}
            <Button onclick={() => handleSaveOrCreate()} class="w-fit">
                {$t("common.continue")}
            </Button>
        </div>
    </div>
</Modal>
