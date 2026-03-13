<script lang="ts">
    import { Modal } from "flowbite-svelte";
    import type {
        Project,
        ProjectBudgetItem,
        ProjectCollaboration,
        ProjectReward,
    } from "../../../openapi/client";
    import { t } from "../../../i18n/store";
    import Button from "../../library/Button.svelte";
    import FileUpload from "../../FileUpload.svelte";
    import RewardItemsSelector from "./RewardItemsSelector.svelte";
    import type { ClassNameValue } from "tailwind-merge";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import { formatCurrency } from "../../../utils/currencies";

    type PayloadType = {
        project: string;
        title: string;
        description: string;
        money?: { amount: number; currency: string };
        isFinite?: boolean;
        unitsTotal?: number | null;
        type?: "infrastructure" | "material" | "task";
        deadline?: "minimum" | "optimum";
    };

    let {
        open = $bindable(false),
        reward,
        collab,
        budgetItem,
        project,
        onSave,
        onDelete,
    }: {
        open: boolean;
        reward?: ProjectReward | null;
        collab?: ProjectCollaboration | null;
        budgetItem?: ProjectBudgetItem | null;
        project: Project;
        onSave?: (data: any) => Promise<void>;
        onDelete?: (id: number | undefined) => Promise<void>;
    } = $props();

    let title = $state(reward?.title ?? collab?.title ?? budgetItem?.title ?? "");
    let description = $state(
        reward?.description ?? collab?.description ?? budgetItem?.description ?? "",
    );

    let moneyAmount = $state(reward?.money.amount ?? 0);
    let rewardCount = $state(reward?.unitsAvailable ?? 1);
    let unlimited = $state(reward?.isFinite ?? false);
    let files = $state<File[]>([]);

    let selectedBudgetDeadline: "minimum" | "optimum" | undefined = $state(budgetItem?.deadline);
    let selectedBudgetType: "infrastructure" | "material" | "task" | undefined = $state(
        budgetItem?.type,
    );

    let selectedStep: string = $state("");
    const INPUTS_CLASSES: ClassNameValue =
        "border-secondary text-content items-center rounded-lg border bg-white p-4 text-base font-normal placeholder:opacity-48 focus:ring-0";

    async function handleContinue() {
        if (!reward && !collab && !budgetItem) return;
        let payload: PayloadType = {
            project: apiProjectsGetCollectionUrl + "/" + (project.slug ? project.slug : project.id),
            title,
            description,
        };

        if (reward) {
            payload = {
                ...payload,
                money: {
                    amount: moneyAmount,
                    currency: reward?.money.currency || "EUR",
                },
                isFinite: unlimited ? false : true,
                unitsTotal: unlimited ? null : rewardCount,
            };
        } else if (budgetItem) {
            payload = {
                ...payload,
                deadline: selectedBudgetDeadline,
                type: selectedBudgetType,
            };
        }

        await onSave?.(payload);
    }

    async function handleDeleteClick() {
        if (reward) await onDelete?.(reward.id);
        else if (collab) await onDelete?.(collab.id);
        else if (budgetItem) await onDelete?.(budgetItem.id);
    }

    function handleSelectedType() {}

    function handleSelectedDeadline() {}

    $effect(() => {
        if (!collab && !budgetItem && reward || reward === null) selectedStep = "rewards";
        else if (!reward && !budgetItem && collab || collab === null) selectedStep = "collabs";
        else if (!reward && !collab && budgetItem || budgetItem === null) {
            selectedStep = "budget";
            selectedBudgetDeadline = budgetItem?.deadline;
            selectedBudgetType = budgetItem?.type;
        }
    });
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
            {$t(`wizard.${selectedStep}.modal.title`)}
        </h2>
        <p class="text-content line-clamp-1 overflow-hidden text-base font-normal text-ellipsis">
            {$t(`wizard.${selectedStep}.modal.description`)}
        </p>
    {/snippet}
    <div class="flex flex-col gap-4">
        {#if selectedStep === "rewards"}
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
        {:else if selectedStep === "collabs"}
            <input
                type="text"
                placeholder={$t("wizard.collabs.modal.placeholders.title")}
                class={INPUTS_CLASSES}
                value={collab?.title ?? ""}
            />
            <textarea
                placeholder={$t("wizard.collabs.modal.placeholders.description")}
                class={`h-32 resize-none ${INPUTS_CLASSES}`}>{collab?.description ?? ""}</textarea
            >
        {:else if selectedStep === "budget"}
            <input
                type="text"
                placeholder={$t("wizard.budget.modal.placeholders.title")}
                class={INPUTS_CLASSES}
                value={budgetItem?.title ?? ""}
            />
            <select
                bind:value={selectedBudgetType}
                onchange={handleSelectedType}
                aria-label={$t("wizard.budget.modal.selectors.types.title")}
                title={$t("wizard.budget.modal.selectors.types.title")}
                class={`${INPUTS_CLASSES} `}
            >
                <option value="" selected={!budgetItem?.type ? true : false}
                    >{$t("wizard.budget.modal.selectors.types.placeholder")}</option
                >
                <option value="infrastructure"
                    >{$t("wizard.budget.modal.selectors.types.infrastructure")}</option
                >
                <option value="material"
                    >{$t("wizard.budget.modal.selectors.types.material")}</option
                >
                <option value="task">{$t("wizard.budget.modal.selectors.types.task")}</option>
            </select>
            <div class="flex gap-4">
                <input
                    type="text"
                    placeholder={$t("wizard.budget.modal.placeholders.amount")}
                    class={`${INPUTS_CLASSES} w-[50%]`}
                    value={budgetItem?.money.amount && budgetItem?.money.currency
                        ? formatCurrency(budgetItem?.money.amount, budgetItem?.money.currency)
                        : ""}
                />
                <select
                    bind:value={selectedBudgetDeadline}
                    onchange={handleSelectedDeadline}
                    aria-label={$t("wizard.budget.modal.selectors.deadline.title")}
                    title={$t("wizard.budget.modal.selectors.deadline.title")}
                    class={`${INPUTS_CLASSES} w-[50%]`}
                    required
                >
                    <option value="" selected={!budgetItem?.deadline ? true : false}
                        >{$t("wizard.budget.modal.selectors.deadline.placeholder")}</option
                    >
                    <option
                        selected={budgetItem?.deadline && budgetItem?.deadline === "minimum"
                            ? true
                            : false}
                        value="minimum"
                        >{$t("wizard.budget.modal.selectors.deadline.minimum")}</option
                    >
                    <option
                        selected={budgetItem?.deadline && budgetItem?.deadline === "optimum"
                            ? true
                            : false}
                        value="optimum"
                        >{$t("wizard.budget.modal.selectors.deadline.optimum")}</option
                    >
                </select>
            </div>
            <textarea
                placeholder={$t("wizard.budget.modal.placeholders.description")}
                class={`${INPUTS_CLASSES} h-60 resize-none `}
                >{budgetItem?.description ?? ""}</textarea
            >
        {/if}
    </div>

    {#snippet footer()}
        {#if reward !== null && collab !== null && budgetItem !== null}
            <Button kind="secondary" onclick={() => handleDeleteClick()} class="w-fit">
                {$t(`wizard.${selectedStep}.modal.btns.delete`)}
            </Button>
        {/if}
        <Button onclick={() => handleContinue()} class="w-fit">
            {$t(`wizard.${selectedStep}.modal.btns.continue`)}
        </Button>
    {/snippet}
</Modal>
