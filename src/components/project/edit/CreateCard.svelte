<script lang="ts">
    import BudgetModal from "./BudgetModal.svelte";
    import CollabsModal from "./CollabsModal.svelte";
    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import MoreAndLess from "../../icons/MoreAndLess.svelte";
    import Button from "../../library/Button.svelte";

    import type {
        ProjectBudgetItem,
        ProjectCollaboration,
        ProjectReward,
    } from "../../../openapi/client";

    let {
        title,
        description,
        onclick,
        variant,
        open = $bindable(false),
        showToast = $bindable(false),
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
        showToast: boolean;
        reward?: ProjectReward | null;
        collab?: ProjectCollaboration | null;
        budgetItem?: ProjectBudgetItem | null;
        onSave: (data: any) => void;
    }>();
</script>

<div
    class="bg-secondary border-variant1 flex h-full min-h-54 w-full max-w-109.25 flex-col items-start justify-between overflow-hidden rounded-4xl border p-6 shadow-sm"
>
    <div class="flex flex-col gap-4 text-ellipsis">
        <h2
            class="text-soft-purple font-bold {variant === 'budget'
                ? 'text-2xl leading-8'
                : 'text-4xl leading-12'}"
        >
            {title}
        </h2>
        <p class="text-variant1 text-base font-normal">
            {description}
        </p>
        <Button
            kind="secondary"
            class="mt-auto flex w-full items-center justify-center gap-2"
            {onclick}
        >
            <MoreAndLess sign="more" class="p-[2.25px]" />
            {#if variant === "reward"}
                {$t("pages.project.edit.rewards.add.button")}
            {:else if variant === "collab"}
                {$t("pages.project.edit.collaborations.add.button")}
            {:else if variant === "budget"}
                {$t("pages.project.edit.budget.add.button")}
            {/if}
        </Button>
    </div>
</div>
{#if variant === "reward"}
    <RewardsModal bind:open bind:showToast {onSave} {reward} />
{:else if variant === "collab"}
    <CollabsModal bind:open bind:showToast {onSave} {collab} />
{:else if variant === "budget"}
    <BudgetModal bind:open bind:showToast {onSave} {budgetItem} />
{/if}
