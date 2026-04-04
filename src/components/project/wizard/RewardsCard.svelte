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
    let showModalErrorToast = $state(false);

    function handleSaveReward(data: WizardReward | null) {
        if (!data) return;
        let errors;

        if (index !== undefined) {
            errors = updateReward(index, data);
        } else {
            errors = addReward(data);
        }

        if (errors === undefined) {
            errors = {};
        }

        if (Object.keys(errors).length > 0) {
            validationErrors.set(errors);
            showModalErrorToast = true;
            return;
        }

        validationErrors.set({});
        openModal = false;
    }

    function handleDeleteReward() {
        if (index === undefined) return;

        deleteReward(index);
        openModal = false;
        validationErrors.set({});
    }
</script>

{#if isCreateCard}
    <CreateCard
        title={$t("pages.project.edit.rewards.add.title")}
        description={$t("pages.project.edit.rewards.add.description")}
        variant="reward"
        onSave={handleSaveReward}
        onclick={() => (openModal = true)}
        bind:open={openModal}
        bind:showToast={showModalErrorToast}
    />
{:else if reward}
    <div
        class="border-grey flex basis-1/3 flex-col justify-between gap-2 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-4"
    >
        <div class="flex flex-col">
            <h3 class="text-secondary line-clamp-2 w-full text-left text-2xl font-bold">
                <div>
                    {@html $t("domain.project.reward.byAtLeast", {
                        amount: formatCurrency(reward.money.amount, reward.money.currency),
                    })}
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
            {#if reward.isFinite}
                <div
                    class="text-secondary flex items-center justify-between gap-2 text-sm font-bold"
                >
                    <UnitIcon />
                    <span>
                        {@html $t("domain.project.reward.unitsTotal", {
                            units: String(reward.unitsTotal),
                        })}
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
            {$t("common.edit")}
        </Button>
        <RewardsModal
            bind:open={openModal}
            bind:showToast={showModalErrorToast}
            {reward}
            onSave={handleSaveReward}
            onDelete={handleDeleteReward}
        />
    </div>
{/if}
