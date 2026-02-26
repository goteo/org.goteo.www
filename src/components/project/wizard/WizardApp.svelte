<!--
    Wizard Application Component

    Root component that wraps the wizard shell and manages step routing.
    Handles:
    - Step content rendering
    - Save and publish callbacks
    - URL query parameter sync
-->
<script lang="ts">
    import WizardShell from "./WizardShell.svelte";
    import ConfigurationStep from "./ConfigurationStep.svelte";
    import CampaignInfoStep from "./CampaignInfoStep.svelte";
    import { wizardState, initializeFromProject } from "../../../stores/wizard-state";
    import type { Project } from "../../../openapi/client";
    import { t } from "../../../i18n/store";
    import RewardsStep from "./RewardsStep.svelte";

    let {
        project,
        lang = "es",
    }: {
        project: Project;
        lang?: string;
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
        // In Phase 1, save to localStorage only
        // Phase 7 will add PATCH to backend
        // Could show success toast here
    }

    /**
     * Handle publish
     */
    function handlePublish() {
        // In Phase 1, this is disabled until all steps are complete
        // Phase 7 will add publish workflow
    }

    /**
     * Handle step continue
     */
    function handleContinue() {
        // Step navigation handled by wizard state
    }
</script>

<WizardShell
    {title}
    {subtitle}
    onTitleChange={handleTitleChange}
    onSubtitleChange={handleSubtitleChange}
    onSave={handleSave}
    onPublish={handlePublish}
>
    {#snippet currentStepContent()}
        {#if currentStep === 1}
            <ConfigurationStep onContinue={handleContinue} />
        {:else if currentStep === 2}
            <CampaignInfoStep onContinue={handleContinue} />
        {:else if currentStep === 3}
            <RewardsStep onContinue={handleContinue} {project} />
        {:else if currentStep === 4}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">
                    {$t("wizard.steps.collaborations")}
                </h2>
                <p class="text-tertiary">{$t("wizard.placeholders.step_not_implemented")}</p>
            </div>
        {:else if currentStep === 5}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">{$t("wizard.steps.budget")}</h2>
                <p class="text-tertiary">{$t("wizard.placeholders.step_not_implemented")}</p>
            </div>
        {:else if currentStep === 6}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">
                    {$t("wizard.steps.about_you")}
                </h2>
                <p class="text-tertiary">{$t("wizard.placeholders.step_not_implemented")}</p>
            </div>
        {/if}
    {/snippet}
</WizardShell>
