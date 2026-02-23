<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import type { Project, ProjectReward } from "../../../openapi/client";
    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";
    import FileUpload from "../../FileUpload.svelte";
    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import type { ClassNameValue } from "tailwind-merge";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";

    let {
        open = $bindable(false),
        reward,
        project,
        onSave,
        onDelete,
    }: {
        open: boolean;
        reward: ProjectReward | null;
        project: Project;
        onSave?: (data: any) => Promise<void>;
        onDelete?: (id: number | undefined) => Promise<void>;
    } = $props();

    let title = $state(reward?.title ?? "");
    let description = $state(reward?.description ?? "");
    let productionPrice = $state(reward?.money.amount ?? 0);
    let shippingPrice = $state(0);
    let rewardCount = $state(reward?.unitsAvailable ?? 1);
    let unlimited = $state(!reward?.isFinite);

    let files = $state<File[]>([]);

    let inputsClass: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    async function handleContinue() {
        const payload = {
            project: apiProjectsGetCollectionUrl + "/" + (project.slug ? project.slug : project.id),
            title,
            description,
            money: productionPrice + shippingPrice,
            isFinite: unlimited ? false : true,
            unitsTotal: unlimited ? null : rewardCount,
        };

        await onSave?.(payload);
    }

    async function handleDeleteClick() {
        if (!reward) return;
        await onDelete?.(reward.id);
    }
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t("wizard.steps.rewards.modal.title")}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t("wizard.steps.rewards.modal.description")}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        <input
            type="text"
            placeholder={$t("wizard.steps.rewards.modal.placeholders.title")}
            class={inputsClass}
        />
        <textarea
            name=""
            id=""
            placeholder={$t("wizard.steps.rewards.modal.placeholders.description")}
            class={`h-32 resize-none ${inputsClass}`}
        ></textarea>
        <div class="grid grid-cols-2 items-center justify-between gap-4">
            <input
                type="text"
                placeholder={$t("wizard.steps.rewards.modal.placeholders.productionPrice")}
                class={inputsClass}
            />
            <input
                type="text"
                placeholder={$t("wizard.steps.rewards.modal.placeholders.shippingPrice")}
                class={inputsClass}
            />
        </div>
        <div class="flex flex-col gap-6">
            <FileUpload bind:files />
            <RewardItemsSelector bind:value={rewardCount} bind:unlimited />
        </div>
    </div>

    {#snippet footer()}
        <Button kind="secondary" onclick={() => handleDeleteClick()} class="w-fit">
            {$t("wizard.steps.rewards.modal.btns.delete")}
        </Button>
        <Button onclick={() => handleContinue()} class="w-fit">
            {$t("wizard.steps.rewards.modal.btns.continue")}
        </Button>
    {/snippet}
</Modal>
