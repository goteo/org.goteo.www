<script lang="ts">
    import CreateCard from "./CreateCard.svelte";
    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import {
        addReward,
        deleteReward,
        updateReward,
        validationErrors,
        type WizardReward,
    } from "../../../stores/wizard-state";
    import UnitIcon from "../../../svgs/UnitIcon.svelte";
    import { formatCurrency } from "../../../utils/currencies";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import Button from "../../library/Button.svelte";

    let {
        reward,
        index,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        reward: WizardReward | null;
        index?: number;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);

    function handleSaveReward(data: WizardReward | null) {
        if (!data) return;
        let errors;

        if (index !== undefined) {
            errors = updateReward(index, data);
        } else {
            errors = addReward(data);
        }

        if (Object.keys(errors!).length > 0) {
            validationErrors.set(errors!);
            return;
        }

        validationErrors.set({});
        openModal = false;
    }

    function handleDeleteReward() {
        if (!index) return;

        deleteReward(index);
        openModal = false;
    }
</script>

{#if isCreateCard}
    <CreateCard
        title={$t("wizard.rewards.createCard.title")}
        description={$t("wizard.rewards.createCard.description")}
        variant="reward"
        onSave={handleSaveReward}
        onclick={() => (openModal = true)}
        bind:open={openModal}
    />
{:else if reward}
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
                <div
                    class="text-secondary flex items-center justify-between gap-2 text-sm font-bold"
                >
                    <UnitIcon />
                    <span>
                        {@html $t(
                            "rewards.units-available",
                            { units: `${reward.unitsTotal}` },
                            { allowHTML: true },
                        )}
                    </span>
                </div>
            {:else}
                <div
                    class="text-secondary flex items-center justify-between gap-2 text-sm font-bold"
                >
                    <UnitIcon />
                    <span>∞</span>
                </div>
            {/if}
        </div>
        <Button kind="secondary" class="w-full" onclick={() => (openModal = true)}>
            {$t("reward.edit")}
        </Button>
        <RewardsModal
            bind:open={openModal}
            {reward}
            onSave={handleSaveReward}
            onDelete={handleDeleteReward}
        />
    </div>
{/if}
