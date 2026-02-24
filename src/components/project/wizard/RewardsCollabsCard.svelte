<script lang="ts">
    import { t } from "../../../i18n/store";
    import type { Project, ProjectCollaboration, ProjectReward } from "../../../openapi/client";
    import UnitIcon from "../../../svgs/UnitIcon.svelte";
    import UserIcon from "../../../svgs/UserIcon.svelte";
    import { formatCurrency } from "../../../utils/currencies";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Button from "../../library/Button.svelte";
    import WizardCollabModal from "./WizardCollabModal.svelte";
    import WizardRewardModal from "./WizardRewardModal.svelte";

    let {
        variant,
        open = $bindable(false),
        project,
        reward = $bindable(),
        collab = $bindable(),
        onEdit,
        onSave,
        onDelete,
        selectedReward,
    }: {
        variant: "reward" | "collab";
        open: boolean;
        project: Project;
        reward?: ProjectReward;
        collab?: ProjectCollaboration | null;
        onEdit?: () => void;
        onSave: (data: any) => Promise<void>;
        onDelete?: (id: number | undefined) => Promise<void>;
        selectedReward?: ProjectReward | null;
    } = $props();
</script>

<div
    class="border-grey flex h-148.75 basis-1/3 flex-col items-center justify-between gap-4 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-8"
>
    <div class="flex flex-col gap-4">
        <h3 class="text-secondary line-clamp-2 w-full text-left text-2xl font-bold">
            {#if variant === "reward" && reward}
                <div>
                    {@html $t(
                        "rewards.by-amount",
                        {
                            amount: formatCurrency(reward.money.amount, reward.money.currency),
                        },
                        { allowHTML: true },
                    )}
                </div>
                {reward.title}
            {:else if variant === "collab" && collab}
                {collab.title}
            {/if}
        </h3>

        {#if reward?.description}
            <div class="marked-content line-clamp-7 text-sm whitespace-pre-line text-gray-800">
                {#await renderMarkdown(reward.description) then description}
                    {@html description}
                {/await}
            </div>
        {/if}
    </div>

    {#if variant === "reward" && reward}
        <div class="mt-auto flex w-full justify-between">
            {#if reward.isFinite}
                <div
                    class="text-secondary flex items-center justify-between gap-2 text-sm font-bold"
                >
                    <UnitIcon />
                    <span>
                        {@html $t(
                            "rewards.units-available",
                            { units: `${reward.unitsAvailable}` },
                            { allowHTML: true },
                        )}
                    </span>
                </div>
            {:else}
                <div
                    class="text-secondary flex items-center justify-between gap-2 text-sm font-bold"
                >
                    <UserIcon />
                    <span>
                        {@html $t(
                            "rewards.donators",
                            { donators: reward.unitsClaimed! },
                            { allowHTML: true },
                        )}
                    </span>
                </div>
            {/if}
        </div>
    {/if}
    <Button kind="secondary" class="w-full" onclick={onEdit}>
        {$t("reward.edit")}
    </Button>
</div>
{#if variant === "collab"}
    <WizardCollabModal bind:open {project} collab={collab!} {onSave} />
{:else if variant === "reward"}
    <WizardRewardModal bind:open reward={selectedReward!} {project} {onSave} {onDelete} />
{/if}
