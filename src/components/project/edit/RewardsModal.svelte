<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import { t } from "../../../i18n/store";
    import { client } from "../../../openapi/client/client.gen";
    import { apiProjectsIdOrSlugGetUrl } from "../../../openapi/client/operation-paths.gen";
    import { zApiProjectRewardsPostBody } from "../../../openapi/client/zod.gen";
    import { DEFAULT_CURRENCY } from "../../../utils/currencies";
    import Button from "../../library/buttons/Button.svelte";
    import DeleteModal from "../../library/feedback/DeleteModal.svelte";
    import FileUpload from "../../library/inputs/FileUpload.svelte";
    import MoneyInput from "../../library/inputs/MoneyInput.svelte";
    import TextArea from "../../library/inputs/TextArea.svelte";
    import TextInput from "../../library/inputs/TextInput.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { ProjectReward } from "../../../openapi/client";
    import type { ProjectDraftStore } from "../../../stores/drafts/draftsStore";

    let {
        open = $bindable(false),
        draft,
        reward,
        onSave,
        onDelete,
    }: {
        open: boolean;
        draft: ProjectDraftStore;
        reward?: ProjectReward;
        onSave?: (reward: ProjectReward) => void;
        onDelete?: () => void;
    } = $props();

    let data: ProjectReward = $derived.by(() => {
        if (reward) {
            return reward;
        }

        return {
            project: client.buildUrl({
                url: apiProjectsIdOrSlugGetUrl,
                path: { idOrSlug: $draft.actual.id },
            }),
            title: "",
            description: "",
            cover: undefined,
            money: { amount: 0, currency: DEFAULT_CURRENCY },
            isFinite: true,
            unitsTotal: 1,
        };
    });

    let validation: Partial<Record<keyof typeof data, string>> = $state({});

    function getValidationMessage(field: keyof typeof data): string {
        if (!validation[field]) {
            return "";
        }

        return $t(validation[field]);
    }

    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        const result = zApiProjectRewardsPostBody
            .superRefine((data, ctx) => {
                if (data.title.length < 1) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["title"],
                        message: "system.validation.requiredField",
                    });
                }

                if (!data.description || data.description?.length < 1) {
                    ctx.addIssue({
                        code: "custom",
                        path: ["description"],
                        message: "system.validation.requiredField",
                    });
                }
            })
            .safeParse(data);

        console.log(result, data);

        if (result.success) {
            onSave?.(data);
            return;
        }

        for (const issue of result.error.issues) {
            if (issue.code === "too_small" && issue.path[0] === "money") {
                validation["money"] = "pages.project.edit.rewards.validation.amount";
                continue;
            }

            validation[issue.path[0] as keyof typeof data] = issue.message;
        }
    }

    let openDeleteModal = $state(false);

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
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 divide-y-0 bg-transparent backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    bodyClass="p-0"
>
    <form class="flex flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg" onsubmit={handleSubmit}>
        <Title level={2} variant="subsection">
            {$t("pages.project.edit.rewards.modal.title")}
        </Title>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("pages.project.edit.rewards.modal.description")}
        </p>
        <div class="flex flex-col gap-4 pt-2">
            <TextInput
                bind:value={data.title}
                labelText={$t("pages.project.edit.rewards.modal.form.titleLabel")}
                helperText={$t("pages.project.edit.rewards.modal.form.titleHelper")}
                placeholder={$t("pages.project.edit.rewards.modal.form.titlePlaceholder")}
                error={getValidationMessage("title")}
            />
            <TextArea
                bind:value={data.description!}
                labelText={$t("pages.project.edit.rewards.modal.form.descriptionLabel")}
                helperText={$t("pages.project.edit.rewards.modal.form.descriptionHelper")}
                placeholder={$t("pages.project.edit.rewards.modal.form.descriptionPlaceholder")}
                rows={5}
                error={getValidationMessage("description")}
            />
            <MoneyInput
                amount={data.money.amount}
                currency={data.money.currency}
                labelText={$t("pages.project.edit.rewards.modal.form.moneyLabel")}
                helperText={$t("pages.project.edit.rewards.modal.form.moneyHelper")}
                onInput={(money) => (data.money = money)}
                error={getValidationMessage("money")}
            />
            <div class="flex flex-col gap-6">
                <FileUpload
                    onUpload={(file) => (data.cover = file.url)}
                    labelText={$t("pages.project.edit.rewards.modal.form.coverLabel")}
                    placeholder={$t("pages.project.edit.rewards.modal.form.coverPlaceholder")}
                    helperText={$t("pages.project.edit.rewards.modal.form.coverHelper")}
                    error={getValidationMessage("cover")}
                />
                <RewardItemsSelector bind:units={data.unitsTotal!} bind:limited={data.isFinite} />
            </div>
        </div>
        <div class="flex items-center justify-end gap-4">
            {#if reward && onDelete}
                <Button kind="secondary" onclick={() => (openDeleteModal = true)} class="w-fit">
                    {$t("common.remove")}
                </Button>
                <DeleteModal
                    title={$t("pages.project.edit.rewards.deleteModal.title")}
                    description={$t("pages.project.edit.rewards.deleteModal.description")}
                    bind:open={openDeleteModal}
                    onclick={() => handleDeleteClick()}
                />
            {/if}
            <Button type="submit" class="w-fit">
                {$t("common.save")}
            </Button>
        </div>
    </form>
</Modal>
