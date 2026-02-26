<script lang="ts">
    import { t } from "../../../i18n/store";
    import {
        apiProjectRewardsGetCollection,
        apiProjectRewardsIdDelete,
        apiProjectRewardsIdPatch,
        apiProjectRewardsPost,
        type Project,
        type ProjectReward,
    } from "../../../openapi/client";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import CreateCard from "./CreateCard.svelte";
    import RewardsCollabsCard from "./RewardsCollabsCard.svelte";

    let { project, onContinue } = $props<{
        project: Project;
        onContinue?: () => void;
    }>();

    let rewards = $state<ProjectReward[]>([]);
    let selectedReward = $state<ProjectReward | null>(null);
    let openModal = $state(false);
    let loading = $state(false);

    async function loadRewards() {
        if (!project) return;

        const projectIri =
            apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);

        const { data, error } = await apiProjectRewardsGetCollection({
            query: { project: projectIri },
        });
        if (error) {
            console.error("Error loading rewards:", error);
        } else if (data) rewards = data;
    }

    async function handleSaveRewards(data: ProjectReward | null) {
        if (!data) return;
        loading = true;

        try {
            if (selectedReward?.id) {
                const { data: dataUpdated, error } = await apiProjectRewardsIdPatch({
                    path: { id: String(selectedReward.id) },
                    body: {
                        ...data,
                    },
                });
                if (error) {
                    console.error("Error updating reward:", error);
                } else if (dataUpdated)
                    rewards = rewards.map((r) => (r.id === dataUpdated.id ? dataUpdated : r));
            } else {
                const { data: dataCreated, error } = await apiProjectRewardsPost({
                    body: {
                        ...data,
                    },
                });

                if (error) {
                    console.error("Error creating reward:", error);
                } else if (dataCreated) {
                    rewards = [...rewards, dataCreated];
                }
            }
        } finally {
            loading = false;
            openModal = false;
            selectedReward = null;
        }
    }

    async function handleDeleteRewards(rewardId: number | undefined) {
        if (!rewardId) return;
        loading = true;

        try {
            const { error } = await apiProjectRewardsIdDelete({
                path: { id: String(rewardId) },
            });

            if (error) {
                console.error("Error deleting reward:", error);
            } else {
                rewards = rewards.filter((r) => r.id !== rewardId);
            }
        } finally {
            loading = false;
            openModal = false;
            selectedReward = null;
        }
    }

    function openCreate() {
        selectedReward = null;
        openModal = true;
    }

    function openEdit(reward: ProjectReward) {
        selectedReward = reward;
        openModal = true;
    }

    $effect(() => {
        if (project) {
            loadRewards();
        }
    });
</script>

<div class="w-full space-y-10">
    <div class="flex w-full flex-col gap-4">
        <h2 class="text-[40px] leading-12 font-bold text-black">
            {$t("wizard.steps.rewards.title")}
        </h2>
        <p class="text-content text-base font-normal">
            {$t("wizard.steps.rewards.subtitle")}
        </p>
    </div>
    {#if loading}
        <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
    {:else}
        <Grid>
            {#each rewards as reward}
                <RewardsCollabsCard
                    bind:open={openModal}
                    {project}
                    {reward}
                    variant="reward"
                    onEdit={() => openEdit(reward)}
                    onDelete={handleDeleteRewards}
                    onSave={handleSaveRewards}
                    {selectedReward}
                />
            {/each}

            <CreateCard
                title={"¡No Lances Tu Campaña Sin Ellas! Las recompensas son tu superpoder"}
                description={"Las donaciones aumentan un 30%* en campañas con múltiples y atractivas recompensas. Es simple: más opciones significan más posibilidades de conectar con los intereses de potenciales donantes. ¿Productos exclusivos? ¿Experiencias únicas? ¿Reconocimientos especiales? ¡Tu creatividad es el límite! Cuanto más variado sea tu menú de recompensas, mayor será tu éxito."}
                variant="reward"
                bind:open={openModal}
                {project}
                reward={selectedReward}
                onSave={handleSaveRewards}
                onclick={openCreate}
            />
        </Grid>
    {/if}
</div>
