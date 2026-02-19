<script lang="ts">
    import { t } from "../i18n/store";
    import type { Project, ProjectReward } from "../openapi/client";
    import UnitIcon from "../svgs/UnitIcon.svelte";
    import UserIcon from "../svgs/UserIcon.svelte";
    import { formatCurrency } from "../utils/currencies";
    import { renderMarkdown } from "../utils/renderMarkdown";
    import Button from "./library/Button.svelte";
    import WizardRewardModal from "./project/wizard/WizardRewardModal.svelte";
    import RewardModal from "./RewardModal.svelte";

    let {
        reward = $bindable(),
        project,
        variant,
        isAvailable = $bindable(),
    }: {
        reward: ProjectReward;
        project: Project;
        variant: "public" | "admin";
        isAvailable?: boolean;
    } = $props();

    let openModal = $state(false);
</script>

<div
    class="border-grey flex basis-1/3 flex-col items-center justify-between gap-4 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-8"
    class:opacity-50={variant === "public" && !isAvailable}
    class:cursor-not-allowed={variant === "public" && !isAvailable}
>
    <div class="flex flex-col gap-4">
        <h3 class="text-secondary line-clamp-2 w-full text-left text-2xl font-semibold">
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

    <div class="mt-auto flex w-full justify-between">
        {#if reward.isFinite || variant === "admin"}
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

    <Button
        kind="secondary"
        class="w-full"
        disabled={!isAvailable && variant === "public"}
        onclick={() => (openModal = true)}
    >
        {#if variant === "public"}
            {$t("reward.donate")}
            {formatCurrency(reward.money.amount, reward.money.currency)}
        {:else}
            {$t("reward.edit")}
        {/if}
    </Button>
</div>
{#if variant === "public"}
    <RewardModal {reward} {project} bind:open={openModal} />
{:else if variant === "admin"}
    <WizardRewardModal {reward} {project} bind:open={openModal} />
{/if}
