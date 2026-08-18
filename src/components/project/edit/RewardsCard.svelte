<script lang="ts">
    import CreateCard from "./CreateCard.svelte";
    import DeleteModal from "./DeleteModal.svelte";
    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import {
        addReward,
        deleteReward,
        updateReward,
        validationErrors,
    } from "../../../stores/drafts/projectDraft";
    import { formatCurrency } from "../../../utils/currencies";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import InfinityIcon from "../../icons/Infinity.svelte";
    import Close from "../../icons/navigation/Close.svelte";
    import UnitIcon from "../../icons/UnitIcon.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Title from "../../library/typography/Title.svelte";

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
    <div
        class="border-grey relative flex basis-1/3 flex-col justify-between gap-2 rounded-4xl border bg-[#FFF] p-6 shadow-[0px_1px_3px_0px_#0000001A] md:gap-4"
    >
        <button
            type="button"
            aria-label={$t("common.delete")}
            class="text-secondary absolute top-6 right-6 cursor-pointer transition-transform hover:scale-110"
            onclick={() => (openDeleteModal = true)}
        >
            <Close class="size-5" />
        </button>

        {#if reward.cover}
            <div class="aspect-4/3 w-full overflow-hidden rounded-lg">
                <img src={reward.cover} alt={reward.title} class="h-full w-full object-cover" />
            </div>
        {/if}

        <div class="flex flex-col">
            <Title
                level={3}
                variant="subsection"
                color="secondary"
                truncate={2}
                class="w-full text-left"
            >
                <div>
                    {@html $t("domain.project.reward.byAtLeast", {
                        amount: formatCurrency(reward.money.amount, reward.money.currency),
                    })}
                </div>
                {reward.title}
            </Title>

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
        </div>
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
    </div>
{/if}
