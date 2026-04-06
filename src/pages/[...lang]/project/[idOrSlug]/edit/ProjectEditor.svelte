<!--
    Wizard Application Component

    Root component that wraps the wizard shell and manages step routing.
    Handles:
    - Step content rendering
    - Save and publish callbacks
    - URL query parameter sync
-->
<script lang="ts">
    import ProjectEditorShell from "./ProjectEditorShell.svelte";
    import BudgetStep from "../../../../../components/project/edit/BudgetStep.svelte";
    import CampaignInfoStep from "../../../../../components/project/edit/CampaignInfoStep.svelte";
    import CollaborationsStep from "../../../../../components/project/edit/CollaborationsStep.svelte";
    import ConfigurationStep from "../../../../../components/project/edit/ConfigurationStep.svelte";
    import RewardsStep from "../../../../../components/project/edit/RewardsStep.svelte";
    import { t } from "../../../../../i18n/store";
    import { type Project } from "../../../../../openapi/client";
    import {
        wizardState,
        initializeFromProject,
        clearLocalStorage,
        saveToLocalStorage,
    } from "../../../../../stores/wizard-state";

    let {
        project,
    }: {
        project: Project;
    } = $props();

    // Initialize wizard state from project and set up URL sync
    $effect(() => {
        // Read URL parameter first (before initializing)
        let initialStep = 1;
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const stepParam = url.searchParams.get("step");
            if (stepParam) {
                const step = parseInt(stepParam, 10);
                if (!isNaN(step) && step >= 1 && step <= 6) {
                    initialStep = step;
                }
            }
        }

        // Initialize from project
        initializeFromProject(project);

        // Set the step from URL parameter if present
        if (initialStep !== 1) {
            wizardState.update((state) => ({
                ...state,
                currentStep: initialStep,
            }));
        }

        // Listen for browser back/forward navigation (client-side only)
        if (typeof window !== "undefined") {
            const handlePopState = () => {
                const url = new URL(window.location.href);
                const stepParam = url.searchParams.get("step");
                if (stepParam) {
                    const step = parseInt(stepParam, 10);
                    if (!isNaN(step) && step >= 1 && step <= 6) {
                        wizardState.update((state) => ({
                            ...state,
                            currentStep: step,
                        }));
                    }
                }
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                window.removeEventListener("popstate", handlePopState);
            };
        }
    });

    // Reactive current step
    const currentStep = $derived($wizardState.currentStep);

    // Reactive derived values for title and subtitle
    const title = $derived($wizardState.title);
    const subtitle = $derived($wizardState.subtitle);

    /**
     * Handle title change
     */
    function handleTitleChange(newTitle: string) {
        wizardState.update((state) => ({
            ...state,
            title: newTitle,
        }));
    }

    /**
     * Handle subtitle change
     */
    function handleSubtitleChange(newSubtitle: string) {
        wizardState.update((state) => ({
            ...state,
            subtitle: newSubtitle,
        }));
    }

    /**
     * Handle save draft
     */
    function handleSave() {
        saveToLocalStorage();

        // TO-DO: Show success Toast over here

        // TO-DO: Add Publish enable button handling
    }

    /**
     * Handle publish
     */
    async function handlePublish() {
        // In Phase 1, this is disabled until all steps are complete
        // Phase 7 will add publish workflow
        clearLocalStorage();
    }
</script>

<ProjectEditorShell
    {title}
    {subtitle}
    onTitleChange={handleTitleChange}
    onSubtitleChange={handleSubtitleChange}
    onSave={handleSave}
    onPublish={handlePublish}
>
    {#snippet currentStepContent()}
        {#if currentStep === 1}
            <ConfigurationStep />
        {:else if currentStep === 2}
            <CampaignInfoStep />
        {:else if currentStep === 3}
            <RewardsStep />
        {:else if currentStep === 4}
            <CollaborationsStep />
        {:else if currentStep === 5}
            <BudgetStep {project} />
        {:else if currentStep === 6}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">
                    {$t("pages.project.edit.tabs.aboutYou")}
                </h2>
                <p class="text-tertiary">{$t("system.notImplemented")}</p>
            </div>
        {/if}
    {/snippet}
</ProjectEditorShell>
