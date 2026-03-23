<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import { t } from "../../../i18n/store";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import FileUpload from "../../FileUpload.svelte";
    import Button from "../../library/Button.svelte";

    import type { Project, ProjectReward } from "../../../openapi/client";
    import type { ClassNameValue } from "tailwind-merge";

    type RewardsPayload = {
        project: string;
        title: string;
        description: string;
        money: { amount: number; currency: string };
        isFinite: boolean;
        unitsTotal: number | null;
    };

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
        onDelete?: (id: number | undefined, type?: "minimum" | "optimum") => Promise<void>;
    } = $props();

    let title = $state(reward?.title ?? "");
    let description = $state(reward?.description ?? "");

    let moneyAmount = $state(reward?.money.amount ?? 0);
    let rewardCount = $state(reward?.unitsAvailable ?? 1);
    let unlimited = $state(reward?.isFinite ?? false);
    let files = $state<File[]>([]);

    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    async function handleSaveOrCreate() {
        if (!reward) return;
        let payload: RewardsPayload = {
            project: apiProjectsGetCollectionUrl + "/" + (project.slug ? project.slug : project.id),
            title,
            description,
            money: {
                amount: moneyAmount,
                currency: reward?.money.currency || "EUR",
            },
            isFinite: unlimited ? false : true,
            unitsTotal: unlimited ? null : rewardCount,
        };

        await onSave?.(payload);
    }

    async function handleDeleteClick() {
        if (reward) await onDelete?.(reward.id);
    }
</script>

<Modal
    bind:open
    closeBtnClass="top-7 end-7 cursor-pointer bg-transparent text-secondary hover:bg-transparent hover:text-secondary hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 mx-2 flex w-full max-w-225 -translate-x-1/2 -translate-y-1/2 flex-col gap-8 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px] sm:mx-4 lg:mx-0"
    headerClass="md:p-0 p-0 flex-col gap-4 justify-start items-start"
    bodyClass="md:p-0 p-0"
    footerClass="md:p-0 p-0 flex items-center justify-end gap-4"
>
    {#snippet header()}
        <h2 class="text-xl font-bold text-black">
            {$t(`wizard.rewards.modal.title`)}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t(`wizard.rewards.modal.description`)}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        <input
            type="text"
            placeholder={$t("wizard.rewards.modal.placeholders.title")}
            class={INPUTS_CLASSES}
            value={reward?.title ?? ""}
        />
        <textarea
            placeholder={$t("wizard.rewards.modal.placeholders.description")}
            class={`h-32 resize-none ${INPUTS_CLASSES}`}>{reward?.description ?? ""}</textarea
        >
        <input
            bind:value={moneyAmount}
            type="text"
            placeholder={$t("wizard.rewards.modal.placeholders.moneyAmount")}
            class={INPUTS_CLASSES}
        />
        <div class="flex flex-col gap-6">
            <FileUpload bind:files />
            <RewardItemsSelector bind:value={rewardCount} bind:unlimited />
        </div>
    </div>

    {#snippet footer()}
        {#if reward !== null}
            <Button kind="secondary" onclick={() => handleDeleteClick()} class="w-fit">
                {$t(`wizard.rewards.modal.btns.delete`)}
            </Button>
        {/if}
        <Button onclick={() => handleSaveOrCreate()} class="w-fit">
            {$t(`wizard.rewards.modal.btns.continue`)}
        </Button>
    {/snippet}
</Modal>
