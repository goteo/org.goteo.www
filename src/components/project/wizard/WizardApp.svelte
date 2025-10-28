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
    import { wizardState, initializeFromProject } from "../../../stores/wizard-state";
    import { logger } from "../../../utils/logger";
    import type { Project } from "../../../openapi/client";

    let {
        project,
        lang = "es",
    }: {
        project: Project;
        lang?: string;
    } = $props();

    // Initialize wizard state from project
    $effect(() => {
        initializeFromProject(project);
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
        logger.info("[Wizard]", "Draft saved to localStorage");
        // Could show success toast here
    }

    /**
     * Handle publish
     */
    function handlePublish() {
        // In Phase 1, this is disabled until all steps are complete
        // Phase 7 will add publish workflow
        logger.info("[Wizard]", "Publish clicked - would navigate to publish confirmation");
    }

    /**
     * Handle step continue
     */
    function handleContinue() {
        logger.info("[Wizard]", "Navigated to step", $wizardState.currentStep);
    }
</script>

<WizardShell
    {title}
    {subtitle}
    {lang}
    onTitleChange={handleTitleChange}
    onSubtitleChange={handleSubtitleChange}
    onSave={handleSave}
    onPublish={handlePublish}
>
    {#snippet currentStepContent()}
        {#if currentStep === 1}
            <ConfigurationStep onContinue={handleContinue} />
        {:else if currentStep === 2}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">Información de campaña</h2>
                <p class="text-tertiary">Este paso será implementado en la Fase 2.</p>
            </div>
        {:else if currentStep === 3}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">Recompensas</h2>
                <p class="text-tertiary">Este paso será implementado en la Fase 3.</p>
            </div>
        {:else if currentStep === 4}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">Colaboraciones</h2>
                <p class="text-tertiary">Este paso será implementado en la Fase 4.</p>
            </div>
        {:else if currentStep === 5}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">Presupuesto</h2>
                <p class="text-tertiary">Este paso será implementado en la Fase 5.</p>
            </div>
        {:else if currentStep === 6}
            <div class="py-12 text-center">
                <h2 class="text-secondary mb-4 text-2xl font-bold">Sobre ti</h2>
                <p class="text-tertiary">Este paso será implementado en la Fase 6.</p>
            </div>
        {/if}
    {/snippet}
</WizardShell>
