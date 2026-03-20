<script lang="ts">
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import {
        apiProjectBudgetItemsGetCollection,
        apiProjectBudgetItemsIdDelete,
        apiProjectBudgetItemsIdPatch,
        apiProjectBudgetItemsPost,
        type Project,
        type ProjectBudgetItem,
    } from "../../../openapi/client";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import BudgetCard from "../BudgetCard.svelte";

    let {
        project,
        onContinue,
    }: {
        project: Project;
        onContinue: () => void;
    } = $props();

    let minBudgetItems: ProjectBudgetItem[] = $state([]);
    let optBudgetItems: ProjectBudgetItem[] = $state([]);
    let selectedBudgetItem = $state<ProjectBudgetItem | null>(null);
    let openModal = $state(false);
    let loading = $state(false);

    async function loadBudgetItems() {
        if (!project) return;
        loading = true;

        const projectIri = apiProjectsGetCollectionUrl + "/" + (project.slug ?? project.id);

        // Get all budget items in current project and store them in items var
        const { data, error } = await apiProjectBudgetItemsGetCollection({
            query: { project: projectIri },
        });

        minBudgetItems = [];
        optBudgetItems = [];

        if (error) console.error("Error loading budget items:", error);
        else if (data) {
            data.forEach((item) => {
                if (item.deadline === "minimum") minBudgetItems.push(item);
                else if (item.deadline === "optimum") optBudgetItems.push(item);
            });
        }

        loading = false;
    }

    async function handleSaveBudgetItem(data: ProjectBudgetItem | null) {
        if (!data) return;
        loading = true;

        try {
            if (selectedBudgetItem?.id) {
                const { data: dataUpdated, error } = await apiProjectBudgetItemsIdPatch({
                    path: { id: String(selectedBudgetItem.id) },
                    body: {
                        ...data,
                    },
                });
                if (error) {
                    console.error("Error updating budget item:", error);
                } else if (dataUpdated.deadline === "minimum") {
                    minBudgetItems = minBudgetItems.map((minItem) =>
                        minItem.id === dataUpdated.id ? dataUpdated : minItem,
                    );
                } else if (dataUpdated.deadline === "optimum") {
                    optBudgetItems = optBudgetItems.map((optItem) =>
                        optItem.id === dataUpdated.id ? dataUpdated : optItem,
                    );
                }
            } else {
                const { data: dataCreated, error } = await apiProjectBudgetItemsPost({
                    body: {
                        ...data,
                    },
                });

                if (error) {
                    console.error("Error creating budget item:", error);
                } else if (dataCreated.deadline === "minimum") {
                    minBudgetItems = [...minBudgetItems, dataCreated];
                } else if (dataCreated.deadline === "optimum") {
                    optBudgetItems = [...optBudgetItems, dataCreated];
                }
            }
        } finally {
            loading = false;
            openModal = false;
            selectedBudgetItem = null;
        }
    }

    async function handleDeleteBudgetItem(itemId: number | undefined) {
        if (!itemId) return;
        loading = true;

        try {
            const { error } = await apiProjectBudgetItemsIdDelete({
                path: { id: String(itemId) },
            });

            if (error) {
                console.error("Error deleting budget item:", error);
            } else {
                minBudgetItems = minBudgetItems.filter((minItem) => minItem.id !== itemId);
                optBudgetItems = optBudgetItems.filter((optItem) => optItem.id !== itemId);
            }
        } finally {
            loading = false;
            openModal = false;
            selectedBudgetItem = null;
        }
    }

    function openCreate() {
        selectedBudgetItem = null;
        openModal = true;
    }

    function openEdit(item: ProjectBudgetItem) {
        selectedBudgetItem = item;
        openModal = true;
    }

    $effect(() => {
        if (project) {
            loadBudgetItems();
        }
    });
</script>

<div class="flex flex-col gap-10">
    <div class="space-y-4">
        <h1 class="text-3xl leading-12 font-bold text-black lg:text-[40px]">
            {$t("wizard.budget.title")}
        </h1>
        <p class="text-content text-base">{$t("wizard.budget.subtitle")}</p>
    </div>

    <div class="flex flex-col gap-6">
        <span class="text-secondary text-3xl font-bold">
            {$t("wizard.budget.minimum")}:
            {formatCurrency(
                project.budget?.minimum?.money?.amount,
                project.budget?.minimum?.money?.currency,
            )}
        </span>
        {#if loading}
            <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
        {:else}
            <Grid class="grid-cols-1 sm:grid-cols-2">
                {#snippet children()}
                    {#each minBudgetItems as item}
                        <BudgetCard
                            {item}
                            isEditable={true}
                            onEdit={() => openEdit(item)}
                            bind:openModal
                            onSave={handleSaveBudgetItem}
                            onDelete={handleDeleteBudgetItem}
                            {selectedBudgetItem}
                        />
                    {/each}

                    <CreateCard
                        title={$t("wizard.budget.createCard.minimum.title")}
                        description={$t("wizard.budget.createCard.minimum.description")}
                        variant="budget"
                        bind:open={openModal}
                        {project}
                        budgetItem={selectedBudgetItem}
                        onSave={handleSaveBudgetItem}
                        onclick={openCreate}
                    />
                {/snippet}
            </Grid>
        {/if}
    </div>
    <div class="flex flex-col gap-6">
        <span class="text-secondary text-3xl font-bold">
            {$t("wizard.budget.optimum")}:
            {formatCurrency(
                project.budget?.optimum?.money?.amount,
                project.budget?.optimum?.money?.currency,
            )}
        </span>
        {#if loading}
            <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
        {:else}
            <Grid class="grid-cols-1 sm:grid-cols-2">
                {#snippet children()}
                    {#each optBudgetItems as item}
                        <BudgetCard
                            {item}
                            isEditable={true}
                            onEdit={() => openEdit(item)}
                            bind:openModal
                            onSave={handleSaveBudgetItem}
                            onDelete={handleDeleteBudgetItem}
                            {selectedBudgetItem}
                        />
                    {/each}

                    <CreateCard
                        title={$t("wizard.budget.createCard.optimum.title")}
                        description={$t("wizard.budget.createCard.optimum.description")}
                        variant="budget"
                        bind:open={openModal}
                        {project}
                        budgetItem={selectedBudgetItem}
                        onSave={handleSaveBudgetItem}
                        onclick={openCreate}
                    />
                {/snippet}
            </Grid>
        {/if}
    </div>
</div>

<div class="mt-10 flex">
    <Button
        kind="secondary"
        size="md"
        onclick={onContinue}
        class="min-w-50"
        data-testid="budget-continue-btn"
    >
        {#snippet children()}
            {$t("wizard.campaignInfo.continue")}
        {/snippet}
    </Button>
</div>
