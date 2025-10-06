<script lang="ts">
    import { t } from "../i18n/store";
    import type { Project, ProjectReward } from "../openapi/client";
    import UnitIcon from "../svgs/UnitIcon.svelte";
    import UserIcon from "../svgs/UserIcon.svelte";
    import { formatCurrency } from "../utils/currencies";
    import { renderMarkdown } from "../utils/renderMarkdown";
    import RewardModal from "./RewardModal.svelte";

    let {
        reward = $bindable(),
        project,
    }: {
        reward: ProjectReward;
        project: Project;
    } = $props();

    let openModal = $state(false);

    let isAvailable = calcAvailability();
    function calcAvailability(): boolean {
        if (project.status !== "in_campaign") {
            return false;
        }

        if (reward.isFinite && reward.unitsAvailable! === 0) {
            return false;
        }

        return true;
    }
</script>

<li
    class="flex basis-1/3 flex-col items-center justify-between gap-4 gap-8 rounded-4xl border border-[#F3F3EF] bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-8"
    class:opacity-50={!isAvailable}
    class:cursor-not-allowed={!isAvailable}
>
    <div class="flex flex-col gap-4">
        <h3 class="text-tertiary line-clamp-2 w-full text-left text-2xl font-semibold">
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
        <div class="text-tertiary flex items-center justify-between gap-2 text-sm font-bold">
            <UserIcon />
            <span>
                {@html $t(
                    "rewards.donators",
                    { donators: reward.unitsClaimed! },
                    { allowHTML: true },
                )}
            </span>
        </div>
        {#if reward.isFinite}
            <div class="text-tertiary flex items-center justify-between gap-2 text-sm font-bold">
                <UnitIcon />
                <span>
                    {@html $t(
                        "rewards.units-available",
                        { units: `${reward.unitsAvailable}` },
                        { allowHTML: true },
                    )}
                </span>
            </div>
        {/if}
    </div>

    <button
        type="button"
        onclick={() => (openModal = true)}
        disabled={!isAvailable}
        class:cursor-pointer={isAvailable}
        class:cursor-not-allowed={!isAvailable}
        class="text-tertiary inline-block w-full rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
    >
        {$t("reward.donate")}
        {formatCurrency(reward.money.amount, reward.money.currency)}
    </button>
</li>
<RewardModal {reward} {project} bind:open={openModal} />
