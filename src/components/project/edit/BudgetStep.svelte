<script lang="ts">
    import AdminBudgetCard from "./AdminBudgetCard.svelte";
    import { t } from "../../../i18n/store";
    import { type Project, type ProjectBudgetItem } from "../../../openapi/client";
    import { validateBudgetAmount } from "../../../stores/drafts/draftValidation";
    import {
        currentDraft,
        navigateToStep,
        validationErrors,
    } from "../../../stores/drafts/projectDraft";
    import { formatCurrency } from "../../../utils/currencies";
    import Button from "../../library/buttons/Button.svelte";
    import Toast from "../../library/feedback/Toast.svelte";
    import Grid from "../../library/layout/Grid.svelte";
    import LoadingSpinner from "../../search/LoadingSpinner.svelte";

    let {
        project,
    }: {
        project: Project;
    } = $props();

    let minBudgetItems: ProjectBudgetItem[] = $state(
        $currentDraft?.wizardForm.budgetItems.minimum || [],
    );
    let optBudgetItems: ProjectBudgetItem[] = $state(
        $currentDraft?.wizardForm.budgetItems.optimum || [],
    );
    let loading = $state(false);
    let showErrorToast = $state(false);

    /**
     * Handle Continue button
     * Simple navigation to next step (6) - validation happens on save/submit
     */
    function handleContinue() {
        if (!$currentDraft) return;

        const errors = validateBudgetAmount($currentDraft);

        if (Object.keys(errors).length > 0) {
            validationErrors.set(errors);
            return;
        }

        navigateToStep(6);
    }

    async function loadBudgetItems() {
        loading = true;

        minBudgetItems = $currentDraft?.wizardForm.budgetItems.minimum || [];
        optBudgetItems = $currentDraft?.wizardForm.budgetItems.optimum || [];

        loading = false;
    }

    $effect(() => {
        if (Object.keys($validationErrors).length > 0)
            console.log("Errores de validación:", $validationErrors);
        if ($currentDraft) {
            loadBudgetItems();
        }
    });
</script>

<div class="flex flex-col gap-10">
    {#if Object.keys($validationErrors).length > 0}
        {#each Object.entries($validationErrors) as [key, message]}
            <Toast
                aria-label={key}
                class="absolute z-999 self-end"
                variant="error"
                bind:showToast={showErrorToast}
            >
                {message}
            </Toast>
        {/each}
    {/if}
    <div class="space-y-4">
        <h1 class="text-3xl leading-12 font-bold text-black lg:text-[2.5rem]">
            {$t("pages.project.edit.budget.title")}
        </h1>
        <p class="text-content text-base">{$t("pages.project.edit.budget.subtitle")}</p>
    </div>

    <div class="flex flex-col gap-6">
        <span class="text-secondary text-3xl font-bold">
            {$t("domain.project.budget.minimum")}:
            {formatCurrency(
                project.budget?.minimum?.money?.amount,
                project.budget?.minimum?.money?.currency,
            )}
        </span>
        {#if loading}
            <LoadingSpinner size="lg" class="col-span-3 mx-auto my-10" />
        {:else}
            <Grid class="grid-cols-1 sm:grid-cols-2">
                {#each minBudgetItems as item, index}
                    <AdminBudgetCard {project} {item} {index} bind:loading />
                {/each}

                <AdminBudgetCard {project} isCreateCard={true} item={null} bind:loading />
            </Grid>
        {/if}
    </div>
    <div class="flex flex-col gap-6">
        <span class="text-secondary text-3xl font-bold">
            {$t("domain.project.budget.optimum")}:
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
                    <AdminBudgetCard {project} {item} index={i} {loading} />
                {/each}

                <AdminBudgetCard {project} isCreateCard={true} item={null} {loading} />
            </Grid>
        {/if}
    </div>
</div>

<div class="mt-10 flex">
    <Button kind="secondary" size="md" onclick={handleContinue} class="min-w-50">
        {$t("pages.project.edit.budget.continue")}
    </Button>
</div>
