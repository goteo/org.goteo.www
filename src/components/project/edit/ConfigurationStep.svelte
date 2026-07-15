<!--
    Configuration Step Component

    First step of the project setup wizard.
    Handles:
    - Categories (up to 2)
    - Campaign release date
    - Funding rounds (1 or 2)

    Validation:
    - Funding rounds defaults to 1
-->
<script lang="ts">
    import { onMount } from "svelte";

    import RoundSelector from "./RoundSelector.svelte";
    import CategorySelect from "../../../components/library/inputs/CategorySelect.svelte";
    import DateInput from "../../../components/library/inputs/DateInput.svelte";
    import { locale, t } from "../../../i18n/store";
    import { apiCategoriesGetCollection } from "../../../openapi/client";
    import { client } from "../../../openapi/client/client.gen";
    import { apiCategoriesIdGetUrl } from "../../../openapi/client/paths.gen";
    import {
        currentDraft,
        navigateToStep,
        updateConfiguration,
        updateProject,
    } from "../../../stores/drafts/projectDraft";
    import { toCollectionItems } from "../../../utils/hydra";
    import Button from "../../library/buttons/Button.svelte";

    import type { Category, Project } from "../../../openapi/client";

    interface ConfigurationStepProps {
        project?: Project;
        onContinue?: () => void;
    }

    let { project, onContinue }: ConfigurationStepProps = $props();
    let allCategories = $state<Category[]>([]);
    let selectedCategoryIds = $state<(number | string)[]>(
        (project?.categories ?? []).map((iri: string) => iri.split("/").pop() ?? ""),
    );
    let releaseDate = $state(
        $currentDraft?.createProject.release
            ? new Date($currentDraft.createProject.release)
            : project?.calendar?.release
              ? new Date(project.calendar.release)
              : new Date(),
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

    // Calculate minimum date (14 days from now) for date input
    function getMinDate(): Date {
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 14);
        return minDate;
    }

    /**
     * Handle release date change
     */
    function handleReleaseChange(date: string) {
        updateProject({ release: date });
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

    <!-- Release Date Section -->
    <div class="space-y-4">
        <div class="space-y-4">
            <h2 class="text-2xl font-bold text-black">
                {$t("pages.project.create.release.title")}
            </h2>
            <p class="text-content text-base font-normal">
                {$t("pages.project.create.release.subtitle")}
            </p>
        </div>
        <DateInput
            name="release"
            class="max-w-167"
            bind:value={releaseDate}
            min={getMinDate()}
            onInput={handleReleaseChange}
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
