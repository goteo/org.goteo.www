<script lang="ts">
    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import UnitIcon from "../../../svgs/UnitIcon.svelte";
    import UserIcon from "../../../svgs/UserIcon.svelte";
    import { formatCurrency } from "../../../utils/currencies";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Button from "../../library/Button.svelte";

    import type { Project, ProjectReward } from "../../../openapi/client";

    let {
        open = $bindable(false),
        project,
        reward = $bindable(),
        onEdit,
        onSave,
        onDelete,
        selectedReward,
    }: {
        open: boolean;
        project: Project;
        reward: ProjectReward;
        onEdit: () => void;
        onSave: (data: any) => Promise<void>;
        onDelete: (id: number | undefined) => Promise<void>;
        selectedReward: ProjectReward | null;
    } = $props();
</script>

<div
    class="border-grey flex min-h-148.75 basis-1/3 flex-col items-center justify-between gap-2 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-4"
>
    <div class="flex flex-col">
        <h3 class="text-secondary line-clamp-2 w-full text-left text-2xl font-bold">
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
        </h3>

        {#if reward.description}
            <div class="marked-content line-clamp-7 text-sm whitespace-pre-line text-gray-800">
                {#await renderMarkdown(reward.description) then description}
                    {@html description}
                {/await}
            </div>
        {/if}
    </div>

    <div class="flex w-full justify-between">
        {#if reward.isFinite}
            <div class="text-secondary flex items-center justify-between gap-2 text-sm font-bold">
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
            <div class="text-secondary flex items-center justify-between gap-2 text-sm font-bold">
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
    <Button kind="secondary" class="w-full" onclick={onEdit}>
        {$t("reward.edit")}
    </Button>
</div>

<RewardsModal bind:open reward={selectedReward!} {project} {onSave} {onDelete} />
