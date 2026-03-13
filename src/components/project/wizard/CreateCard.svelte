<script lang="ts">
    import { t } from "../../../i18n/store";
    import type {
        Project,
        ProjectBudgetItem,
        ProjectCollaboration,
        ProjectReward,
    } from "../../../openapi/client";
    import PlusIcon from "../../../svgs/PlusIcon.svelte";
    import Button from "../../library/Button.svelte";
    import WizardModal from "./WizardModal.svelte";

    let {
        title,
        description,
        onclick,
        variant,
        open = $bindable(false),
        project,
        reward,
        collab,
        budgetItem,
        onSave,
    } = $props<{
        title: string;
        description: string;
        onclick: () => void;
        variant: "reward" | "collab" | "budget";
        open: boolean;
        project: Project;
        reward?: ProjectReward | null;
        collab?: ProjectCollaboration | null;
        budgetItem?: ProjectBudgetItem | null;
        onSave: (data: any) => Promise<void>;
    }>();
</script>

<div
    class="bg-secondary border-variant1 flex h-full w-full max-w-109.25 basis-1/2 flex-col items-center justify-between rounded-4xl border p-6 shadow-sm"
>
    <div class="flex flex-col gap-4">
        <h2 class="text-soft-purple self-stretch text-[40px] leading-12 font-bold">
            {title}
        </h2>
        <p class="text-variant1 self-stretch text-base font-normal">
            {description}
        </p>
    </div>
    <Button kind="secondary" class="flex w-full items-center justify-center gap-2" {onclick}>
        <PlusIcon class="p-[2.25px]" />
        {#if variant === "reward"}
            {$t("wizard.steps.rewards.createCard.btn")}
        {:else if variant === "collab"}
            {$t("wizard.steps.collabs.createCard.btn")}
        {/if}
    </Button>
</div>
{#if variant === "reward"}
    <WizardModal bind:open {project} {onSave} {reward} />
{:else if variant === "collab"}
    <WizardModal bind:open {project} {onSave} {collab} />
{:else if variant === "budget"}
    <WizardModal bind:open {project} {onSave} {budgetItem} />
{/if}
