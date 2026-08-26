<script lang="ts">
    import { twJoin } from "tailwind-merge";

    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import MoreAndLess from "../../icons/filters/MoreAndLess.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Toast from "../../library/feedback/Toast.svelte";
    import Title from "../../library/typography/Title.svelte";

    import type { Project } from "../../../openapi/client";

    interface Props {
        project: Project;
        title: string;
        description: string;
        variant: "reward" | "collab" | "budget";
        open?: boolean;
        onClick?: () => void;
        onSave?: (data: any, files?: any) => void;
        defaultDeadline?: "minimum" | "optimum";
        disabled?: boolean;
        disabledMessage?: string;
    }

    let {
        project,
        title,
        description,
        onClick,
        variant,
        open = $bindable(false),
        onSave,
        defaultDeadline,
        disabled = false,
        disabledMessage = "",
    }: Props = $props();

    let showDisabledToast = $state(false);

    function handleClick() {
        open = true;

        onClick?.();
    }
</script>

<div
    class={twJoin(
        "bg-secondary border-variant1 flex h-full min-h-54 w-full max-w-109.25 flex-col items-start justify-between overflow-hidden rounded-4xl border p-6 shadow-sm",
        disabled && "cursor-not-allowed opacity-50 grayscale",
    )}
>
    <div class="flex flex-col gap-4 text-ellipsis">
        <Title
            level={2}
            variant={variant === "budget" ? "subsection" : "headline"}
            color="purple-soft"
            class={variant === "budget" ? "leading-8" : "leading-12"}
        >
            {title}
        </Title>
        <p class="text-variant1 mb-4 text-base font-normal">
            {description}
        </p>
    </div>
    <Button
        kind="secondary"
        class="mt-auto flex w-full items-center justify-center gap-2"
        onclick={handleClick}
    >
        <MoreAndLess sign="more" class="size-6" />
        {#if variant === "reward"}
            {$t("pages.project.edit.rewards.add.button")}
        {:else if variant === "collab"}
            {$t("pages.project.edit.collaborations.add.button")}
        {:else if variant === "budget"}
            {defaultDeadline
                ? $t(`pages.project.edit.budget.add.${defaultDeadline}.button`)
                : $t("pages.project.edit.budget.add.button")}
        {/if}
    </Button>
</div>

{#if disabled && disabledMessage}
    <Toast
        class="fixed top-1/2 left-1/2 z-999 -translate-x-1/2 -translate-y-1/2"
        variant="error"
        bind:showToast={showDisabledToast}
    >
        {disabledMessage}
    </Toast>
{/if}

{#if !disabled && variant === "reward"}
    <RewardsModal bind:open onSave={(data) => onSave?.(data)} reward={null} {project} />
<!-- {:else if !disabled && variant === "collab"}
    <CollabsModal bind:open onSave={() => onSave?.()} collab={null} {project} />
{:else if !disabled && variant === "budget"}
    <BudgetModal bind:open onSave={() => onSave?.()} budgetItem={null} {defaultDeadline} /> -->
{/if}
