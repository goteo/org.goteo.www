<script lang="ts">
    import CreateCard from "./CreateCard.svelte";
    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import {
        addReward,
        deleteReward,
        updateReward,
        validationErrors,
    } from "../../../stores/drafts/projectDraft";
    import InfinityIcon from "../../icons/Infinity.svelte";
    import Close from "../../icons/navigation/Close.svelte";
    import UnitIcon from "../../icons/UnitIcon.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Reward from "../../library/cards/Reward.svelte";

    import type { Project, ProjectReward } from "../../../openapi/client";

    let {
        project,
        reward,
        index,
        loading = $bindable(false),
        isCreateCard = false,
    }: {
        project: Project;
        reward: ProjectReward | null;
        index?: number;
        loading: boolean;
        isCreateCard?: boolean;
    } = $props();

    let openModal = $state(false);
    let openDeleteModal = $state(false);
    let showModalErrorToast = $state(false);

    function handleSaveReward(data: ProjectReward | null) {
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
        openDeleteModal = false;
        validationErrors.set({});
    }
</script>

{#if isCreateCard}
    <CreateCard
        {project}
        title={$t("pages.project.edit.rewards.add.title")}
        description={$t("pages.project.edit.rewards.add.description")}
        variant="reward"
        onSave={handleSaveReward}
        onclick={() => (openModal = true)}
        bind:open={openModal}
        bind:showToast={showModalErrorToast}
    />
{:else if reward}
    <Reward {reward} class="relative gap-2 md:gap-4">
        {#snippet stats()}
            {#if reward.isFinite}
                <div
                    class="text-secondary flex items-center justify-between gap-1 text-base font-bold"
                >
                    <UnitIcon />
                    <span>
                        {#if reward.unitsTotal === 1}
                            {$t("domain.project.reward.unitsTotal.single")}
                        {:else}
                            {@html $t("domain.project.reward.unitsTotal.multiple", {
                                units: String(reward.unitsTotal),
                            })}
                        {/if}
                    </span>
                </div>
            {:else}
                <div class="text-secondary flex items-center justify-between font-bold">
                    <UnitIcon />
                    <InfinityIcon width="32" height="32" />
                </div>
            {/if}
        {/snippet}

        <button
            type="button"
            aria-label={$t("common.delete")}
            class="text-secondary absolute top-6 right-6 cursor-pointer transition-transform hover:scale-110"
            onclick={() => (openDeleteModal = true)}
        >
            <Close class="size-5" />
        </button>
        <Button kind="secondary" class="w-full" onclick={() => (openModal = true)}>
            {$t("common.edit")}
        </Button>
        <RewardsModal
            bind:open={openModal}
            bind:showToast={showModalErrorToast}
            {project}
            {reward}
            onSave={handleSaveReward}
            onDelete={handleDeleteReward}
        />
        <DeleteModal variant="rewards" bind:open={openDeleteModal} onclick={handleDeleteReward} />
    </Reward>
{/if}
