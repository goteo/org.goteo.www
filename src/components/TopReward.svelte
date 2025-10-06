<script lang="ts">
    import { t } from "../i18n/store";
    import type { Project, ProjectReward } from "../openapi/client";
    import { formatCurrency } from "../utils/currencies";
    import { renderMarkdown } from "../utils/renderMarkdown";
    import Button from "./library/Button.svelte";
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
    class="border-light-muted flex basis-1/3 flex-col items-center justify-between gap-8 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A]"
    class:opacity-50={!isAvailable}
    class:cursor-not-allowed={!isAvailable}
>
    <div class="flex flex-col gap-4">
        <h3 class="text-secondary line-clamp-2 w-full text-left text-2xl font-semibold">
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

    <Button
        kind="secondary"
        class="w-full"
        disabled={!isAvailable}
        onclick={() => (openModal = true)}
    >
        {$t("reward.donate")}
        {formatCurrency(reward.money.amount, reward.money.currency)}
    </Button>
</li>
<RewardModal {reward} {project} bind:open={openModal} />
