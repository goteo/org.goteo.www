<script lang="ts">
    import CreateCard from "./CreateCard.svelte";
    import { t } from "../../../i18n/store";
    import {
        apiProjectBudgetItemsPost,
        type Project,
        type ProjectBudgetItem,
    } from "../../../openapi/client";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";
    import BudgetCard from "../BudgetCard.svelte";
    import { navigateToStep, saveToLocalStorage, updateBudgetItem, validateBudgetItems, wizardState } from "../../../stores/wizard-state";

    let {
        project,
        onContinue,
    }: {
        project: Project;
        onContinue: () => void;
    } = $props();

    let minBudgetItems: ProjectBudgetItem[] = $state($wizardState.budgetItems.minimum);
    let optBudgetItems: ProjectBudgetItem[] = $state($wizardState.budgetItems.optimum);
    let selectedBudgetItem = $state<ProjectBudgetItem | null>(null);
    let openModal = $state(false);
    let loading = $state(false);

    /**
     * Handle Continue button
     * Simple navigation to next step (6) - validation happens on save/submit
     */
    function handleContinue() {
        saveToLocalStorage();
        navigateToStep(6);
        if (onContinue) {
            onContinue();
        }
    }

    async function loadBudgetItems() {
        loading = true;

        minBudgetItems = [];
        optBudgetItems = [];

        const minimumData = $wizardState.budgetItems.minimum;
        const optimumData = $wizardState.budgetItems.optimum;

        minimumData.forEach((item) => {
            minBudgetItems.push(item);
        });
        optimumData.forEach((item) => {
            optBudgetItems.push(item);
        });

        loading = false;
    }

    async function handleSaveBudgetItem(data: ProjectBudgetItem | null) {
        if (!data) return;
        loading = true;

        try {
            if (selectedBudgetItem?.id) {
                updateBudgetItem();
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

    async function handleDeleteBudgetItem(
        itemId: number | undefined,
        type: "minimum" | "optimum" | undefined,
    ) {
        if (!itemId || !type) return;
        loading = true;

        try {
            const { errors } = validateBudgetItems();
            if (errors) {
                console.error(errors);
            } else if (type === "minimum") {
                minBudgetItems = minBudgetItems.filter((minItem) => minItem.id !== itemId);
            } else if (type === "optimum") {
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
        onclick={handleContinue}
        class="min-w-50"
        data-testid="budget-continue-btn"
    >
        {#snippet children()}
            {$t("wizard.campaignInfo.continue")}
        {/snippet}
    </Button>
</div>
