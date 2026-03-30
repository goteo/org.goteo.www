<script lang="ts">
    import AdminBudgetCard from "./AdminBudgetCard.svelte";
    import { t } from "../../../i18n/store";
    import { type Project, type ProjectBudgetItem } from "../../../openapi/client";
    import {
        navigateToStep,
        validateBudgetAmount,
        validationErrors,
        wizardState,
    } from "../../../stores/wizard-state";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/Button.svelte";
    import Grid from "../../library/Grid.svelte";
    import Toast from "../../library/Toast.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";

    let {
        project,
    }: {
        project: Project;
    } = $props();

    let minBudgetItems: ProjectBudgetItem[] = $state($wizardState.budgetItems.minimum);
    let optBudgetItems: ProjectBudgetItem[] = $state($wizardState.budgetItems.optimum);
    let loading = $state(false);

    /**
     * Handle Continue button
     * Simple navigation to next step (6) - validation happens on save/submit
     */
    function handleContinue() {
        const errors = validateBudgetAmount();

        if (Object.keys(errors).length > 0) {
            validationErrors.set(errors);
            return;
        }

        navigateToStep(6);
    }

    async function loadBudgetItems() {
        loading = true;

        minBudgetItems = $wizardState.budgetItems.minimum;
        optBudgetItems = $wizardState.budgetItems.optimum;

        loading = false;
    }

    $effect(() => {
        if (Object.keys($validationErrors).length > 0)
            console.log("Errores de validación:", $validationErrors);
        if ($wizardState) {
            loadBudgetItems();
        }
    });
</script>

<div class="flex flex-col gap-10">
    {#if Object.keys($validationErrors).length > 0}
        {#each Object.entries($validationErrors) as [key, message]}
            {#if key === "minimum" || key === "optimum_total"}
                <Toast
                    aria-label={key}
                    class="absolute z-999 self-end"
                    variant="error"
                    showToast={true}
                >
                    {message}
                </Toast>
            {/if}
        {/each}
    {/if}
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
                {#each minBudgetItems as item, i}
                    <AdminBudgetCard {item} index={i} {loading} />
                {/each}

                <AdminBudgetCard isCreateCard={true} item={null} {loading} />
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
                {#each optBudgetItems as item, i}
                    <AdminBudgetCard {item} index={i} {loading} />
                {/each}

                <AdminBudgetCard isCreateCard={true} item={null} {loading} />
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
        {$t("wizard.campaignInfo.continue")}
    </Button>
</div>
