<script lang="ts">
    import { onMount } from "svelte";
    import { t } from "../../../i18n/store";
    import {
        apiProjectCollaborationsGetCollection,
        apiProjectCollaborationsIdDelete,
        apiProjectCollaborationsIdPatch,
        apiProjectCollaborationsPost,
        type Project,
        type ProjectCollaboration,
    } from "../../../openapi/client";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import CreateCard from "./CreateCard.svelte";
    import RewardsCollabsCard from "./RewardsCollabsCard.svelte";

    let { onContinue, project } = $props<{
        onContinue?: () => void;
        project: Project;
    }>();

    let collabs = $state<ProjectCollaboration[]>([]);
    let selectedCollab = $state<ProjectCollaboration | null>(null);
    let openModal = $state(false);
    let loading = $state(false);

    async function loadCollabs() {
        if (!project) return;

        const projectIri = apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);

        const { data: collaborations, error } = await apiProjectCollaborationsGetCollection({
            query: { project: projectIri },
        });
        if (error) {
            console.error("Error loading collaborations:", error);
        } else if (collaborations) collabs = collaborations;
    }

    async function handleSaveCollabs(data: ProjectCollaboration | null) {
        if (!data) return;
        loading = true;

        try {
            if (selectedCollab?.id) {
                const { data: dataUpdated, error } = await apiProjectCollaborationsIdPatch({
                    path: { id: String(selectedCollab.id) },
                    body: {
                        ...data,
                    },
                });
                if (error) {
                    console.error("Error updating collaboration:", error);
                } else if (dataUpdated)
                    collabs = collabs.map((c) => (c.id === dataUpdated.id ? dataUpdated : c));
            } else {
                const { data: dataCreated, error } = await apiProjectCollaborationsPost({
                    body: {
                        ...data,
                    },
                });

                if (error) {
                    console.error("Error creating collaboration:", error);
                } else if (dataCreated) {
                    collabs = [...collabs, dataCreated];
                }
            }
        } finally {
            loading = false;
            openModal = false;
            selectedCollab = null;
        }
    }

    async function handleDeleteCollabs(collabId: number | undefined) {
        if (!collabId) return;
        loading = true;

        try {
            const { error } = await apiProjectCollaborationsIdDelete({
                path: { id: String(collabId) },
            });

            if (error) {
                console.error("Error deleting collaboration:", error);
            } else {
                collabs = collabs.filter((c) => c.id !== collabId);
            }
        } finally {
            loading = false;
            openModal = false;
            selectedCollab = null;
        }
    }

    function openCreate() {
        selectedCollab = null;
        openModal = true;
    }

    function openEdit(collab: ProjectCollaboration) {
        selectedCollab = collab;
        openModal = true;
    }

    onMount(() => {
        if (project) {
            loadCollabs();
            console.log(project, collabs);
        }
    });
</script>

<div class="w-full space-y-10">
    <div class="flex w-full flex-col gap-4">
        <h2 class="text-[40px] leading-12 font-bold text-black">
            {$t("wizard.steps.collaborations.title")}
        </h2>
        <p class="text-content text-base font-normal">
            {$t("wizard.steps.collaborations.subtitle")}
        </p>
    </div>

    {#if loading}
        <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
    {:else}
        <Grid>
            {#each collabs as collab}
                <RewardsCollabsCard
                    bind:open={openModal}
                    {project}
                    {collab}
                    variant="collab"
                    onEdit={() => openEdit(collab)}
                    onDelete={handleDeleteCollabs}
                    onSave={handleSaveCollabs}
                    {selectedCollab}
                />
            {/each}

            <CreateCard
                title={$t("wizard.steps.collaborations.createCard.title")}
                description={$t("wizard.steps.collaborations.createCard.description")}
                variant="collab"
                bind:open={openModal}
                {project}
                collab={selectedCollab}
                onSave={handleSaveCollabs}
                onclick={openCreate}
            />
        </Grid>
    {/if}
</div>
