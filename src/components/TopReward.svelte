<script lang="ts">
    import { t } from "../i18n/store";
    import type { Project, ProjectReward } from "../openapi/client";
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
</script>

<li
    class="flex basis-1/3 flex-col items-center justify-between gap-8 rounded-4xl border border-[#F3F3EF] bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
    class:opacity-50={reward.isFinite && (reward.unitsAvailable ?? 0) === 0}
    class:cursor-not-allowed={reward.isFinite && (reward.unitsAvailable ?? 0) === 0}
>
    <div class="flex flex-col gap-4">
        <h3 class="text-tertiary line-clamp-2 w-full text-left text-2xl font-semibold">
            {reward.title}
        </h3>

        {#if reward.description}
            <div class="line-clamp-7 text-sm whitespace-pre-line text-gray-800">
                {#await renderMarkdown(reward.description) then description}
                    {@html description}
                {/await}
            </div>
        {/if}
    </div>

    <button
        type="button"
        onclick={() => (openModal = true)}
        disabled={reward.isFinite && (reward.unitsAvailable ?? 0) === 0}
        class:cursor-not-allowed={reward.isFinite && (reward.unitsAvailable ?? 0) === 0}
        class:cursor-pointer={!reward.isFinite || (reward.unitsAvailable ?? 0) > 0}
        class="text-tertiary inline-block w-full rounded-3xl bg-[#E6E5F7] px-6 py-4 font-bold transition"
    >
        {$t("reward.donate")}
        {formatCurrency(reward.money.amount, reward.money.currency)}
    </button>
</li>
<RewardModal {reward} {project} bind:open={openModal} />
