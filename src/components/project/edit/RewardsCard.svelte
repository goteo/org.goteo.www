<script lang="ts">
    import RewardsModal from "./RewardsModal.svelte";
    import { t } from "../../../i18n/store";
    import { formatCurrency } from "../../../utils/currencies";
    import { renderMarkdown } from "../../../utils/renderMarkdown";
    import InfinityIcon from "../../icons/Infinity.svelte";
    import Close from "../../icons/navigation/Close.svelte";
    import UnitIcon from "../../icons/UnitIcon.svelte";
    import Button from "../../library/buttons/Button.svelte";
    import Title from "../../library/typography/Title.svelte";

    import { apiProjectRewardsIdDelete, apiProjectRewardsIdPatch, type ProjectReward } from "../../../openapi/client";
    import type { ProjectDraftStore } from "../../../stores/drafts/draftsStore";
    import DeleteModal from "../../library/feedback/DeleteModal.svelte";

    let {
        draft,
        reward,
        onSave,
        onDelete,
    }: {
        draft: ProjectDraftStore;
        reward: ProjectReward;
        onSave?: (reward: ProjectReward) => void;
        onDelete?: (reward: ProjectReward) => void;
    } = $props();

    let openModal = $state(false);
    let openDeleteModal = $state(false);

    async function handleSave(newReward: ProjectReward) {
        const { error } = await apiProjectRewardsIdPatch({
            baseUrl: "/api/relay",
            headers: { "Content-Language": $draft.lang },
            path: { id: String(reward.id) },
            body: newReward,
        });

        if (!error) {
            openModal = false;
            onSave?.(newReward);
            return;
        }

        console.error(error);
    }

    async function handleDelete(reward: ProjectReward) {
        const { error } = await apiProjectRewardsIdDelete({
            baseUrl: "/api/relay",
            path: { id: String(reward.id) },
        });

        if (!error) {
            openModal = false;
            onDelete?.(reward);
            return;
        }

        console.error(error);
    }
</script>

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

    <div class="flex h-full flex-col gap-4">
        <Title
            level={3}
            variant="subsection"
            color="secondary"
            truncate={2}
            class="w-full text-left"
        >
            <div>
                {@html $t("domain.project.reward.byAtLeast", {
                    amount: formatCurrency(reward.money),
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

        <Button kind="secondary" class="w-full self-end" onclick={() => (openModal = true)}>
            {$t("common.edit")}
        </Button>

        <RewardsModal
            bind:open={openModal}
            {draft}
            {reward}
            onSave={handleSave}
            onDelete={handleDelete}
        />

        <DeleteModal
            title={$t("pages.project.edit.rewards.deleteModal.title")}
            description={$t("pages.project.edit.rewards.deleteModal.description")}
            bind:open={openDeleteModal}
            onclick={() => handleDelete(reward)}
        />
    </div>
</div>
