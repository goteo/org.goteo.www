<!--
    Configuration Step Component

    First step of the project setup wizard.
    Handles:
    - Categories (up to 2)
    - Funding rounds (1 or 2)

    Validation:
    - Funding rounds defaults to 1
-->
<script lang="ts">
    import { onMount } from "svelte";

    import CategorySelect from "../../../components/library/CategorySelect.svelte";
    import RoundSelector from "./RoundSelector.svelte";
    import { locale, t } from "../../../i18n/store";
    import {
        currentDraft,
        navigateToStep,
        updateConfiguration,
        updateProject,
    } from "../../../stores/drafts/projectDraft";
    import { apiCategoriesGetCollection } from "../../../openapi/client";
    import { client } from "../../../openapi/client/client.gen";
    import { apiCategoriesIdGetUrl } from "../../../openapi/client/paths.gen";
    import type { Category, Project } from "../../../openapi/client";
    import { toCollectionItems } from "../../../utils/hydra";
    import Button from "../../library/Button.svelte";

    interface ConfigurationStepProps {
        project?: Project;
        onContinue?: () => void;
    }

    let { project, onContinue }: ConfigurationStepProps = $props();
    let allCategories = $state<Category[]>([]);
    let selectedCategoryIds = $state<(number | string)[]>(
        (project?.categories ?? []).map((iri: string) => iri.split("/").pop() ?? ""),
    );

    onMount(async () => {
        const { data } = await apiCategoriesGetCollection({
            baseUrl: "/api/relay",
            headers: { "Accept-Language": $locale },
        });
        allCategories = toCollectionItems<Category>(data);
    });

    let projectDeadline = $derived(
        $currentDraft?.wizardForm.configuration.projectDeadline ?? "minimum",
    );

    /**
     * Handle Continue button
     * Simple navigation to next step (2) - validation happens on save/submit
     */
    function handleContinue() {
        navigateToStep(2);
        if (onContinue) {
            onContinue();
        }
    }

    /**
     * Handle funding rounds change
     */
    function handleRoundsChange(projectDeadline: "minimum" | "optimum") {
        updateConfiguration({ projectDeadline });
    }

    /**
     * Handle category selection change
     *
     */
    function handleCategoryChange(selected: Category[]) {
        const categoryIris = selected.map((s) => {
            return client.buildUrl({ url: apiCategoriesIdGetUrl, path: { id: s.id } });
        });

        updateProject({ categories: categoryIris });
    }
</script>

<div class="space-y-8">
    <!-- Page Header -->
    <div class="space-y-4">
        <h1 class="text-[2.5rem]/12 font-bold text-black">
            {$t("pages.project.edit.configuration.title")}
        </h1>
        <p class="text-content text-base font-normal">
            {$t("pages.project.edit.configuration.subtitle")}
        </p>
    </div>

    <!-- Categories Section -->
    <div class="space-y-4">
        <div class="space-y-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.create.categories.title")}
            </h2>
            <p class="text-black transition-all duration-300 ease-in-out">
                {$t("pages.project.create.categories.subtitle")}
            </p>
        </div>
        <CategorySelect
            max={2}
            options={allCategories}
            bind:selectedIds={selectedCategoryIds}
            onchange={handleCategoryChange}
        />
    </div>

    <!-- Funding Rounds Section -->
    <div class="space-y-6">
        <div class="space-y-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.edit.configuration.rounds.title")}
            </h2>
            <p class="text-content text-base font-normal">
                {$t("pages.project.edit.configuration.rounds.description")}
            </p>
        </div>
        <RoundSelector bind:deadline={projectDeadline} onChange={handleRoundsChange} />
    </div>

    <!-- Continue Button -->
    <div class="mb- flex justify-start">
        <Button kind="secondary" size="md" onclick={handleContinue}>
            {$t("pages.project.edit.configuration.continue")}
        </Button>
    </div>
</div>
