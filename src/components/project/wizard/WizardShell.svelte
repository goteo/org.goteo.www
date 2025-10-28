<!--
    Wizard Shell Component

    Provides the navigation shell for the multi-step project setup wizard.

    Features:
    - Six-step tabbed navigation
    - Visual progress indicators
    - Action buttons (Preview, Save, Publish)
    - Step validation before navigation
    - URL query parameter sync

    Design System:
    - Active tab: border-primary, text-secondary
    - Incomplete tab: border-purple-tint, text-tertiary
    - Disabled tab: border-light-muted, text-light-muted
-->
<script lang="ts">
    import type { Snippet } from "svelte";
    import Button from "../../library/Button.svelte";
    import {
        wizardState,
        navigateToStep,
        saveToLocalStorage,
        areAllStepsCompleted,
        persistenceError,
    } from "../../../stores/wizard-state";
    import { logger } from "../../../utils/logger";

    interface WizardStep {
        id: number;
        label: string;
        labelKey: string; // i18n translation key
    }

    let {
        title = "",
        subtitle = "",
        currentStepContent,
        onTitleChange,
        onSubtitleChange,
        onSave,
        onPublish,
        lang = "es",
    }: {
        title?: string;
        subtitle?: string;
        currentStepContent: Snippet;
        onTitleChange?: (value: string) => void;
        onSubtitleChange?: (value: string) => void;
        onSave?: () => void;
        onPublish?: () => void;
        lang?: string;
    } = $props();

    // Define the six wizard steps
    const steps: WizardStep[] = [
        { id: 1, label: "Configuración", labelKey: "wizard.steps.configuration" },
        { id: 2, label: "Información de campaña", labelKey: "wizard.steps.campaign_info" },
        { id: 3, label: "Recompensas", labelKey: "wizard.steps.rewards" },
        { id: 4, label: "Colaboraciones", labelKey: "wizard.steps.collaborations" },
        { id: 5, label: "Presupuesto", labelKey: "wizard.steps.budget" },
        { id: 6, label: "Sobre ti", labelKey: "wizard.steps.about_you" },
    ];

    // Reactive values from store
    const currentStep = $derived($wizardState.currentStep);
    const completedSteps = $derived($wizardState.completedSteps);
    const allStepsCompleted = $derived($areAllStepsCompleted);

    /**
     * Handle tab click
     * Validates current step before allowing navigation
     */
    function handleTabClick(stepId: number) {
        const success = navigateToStep(stepId);

        if (!success) {
            // Navigation blocked - could show a toast message here
            logger.warn(
                "[Wizard]",
                `Navigation to step ${stepId} blocked - complete previous steps first`,
            );
        }

        // Update URL query parameter
        if (success) {
            const url = new URL(window.location.href);
            url.searchParams.set("step", String(stepId));
            window.history.pushState({}, "", url);
        }
    }

    /**
     * Handle keyboard navigation for tabs
     * Supports Enter and Space keys
     */
    function handleTabKeydown(stepId: number, event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const isDisabled =
                stepId > 1 && !completedSteps.has(stepId - 1) && stepId !== currentStep;
            if (!isDisabled) {
                handleTabClick(stepId);
            }
        }
    }

    /**
     * Handle Save Draft button
     */
    function handleSave() {
        saveToLocalStorage();
        if (onSave) {
            onSave();
        }
        // Could show success toast here
        logger.info("[Wizard]", "Draft saved to localStorage");
    }

    /**
     * Handle Publish button
     */
    function handlePublish() {
        if (allStepsCompleted) {
            if (onPublish) {
                onPublish();
            }
        }
    }

    /**
     * Determine tab state classes
     */
    function getTabClasses(step: WizardStep): string {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);
        const isDisabled =
            step.id > 1 && !completedSteps.has(step.id - 1) && step.id !== currentStep;

        if (isActive) {
            return "border-primary text-secondary cursor-pointer";
        } else if (isCompleted) {
            return "border-primary text-tertiary cursor-pointer hover:text-secondary";
        } else if (isDisabled) {
            return "border-light-muted text-light-muted cursor-not-allowed opacity-50";
        } else {
            return "border-purple-tint text-tertiary cursor-pointer hover:text-secondary";
        }
    }
</script>

<div class="mx-auto max-w-6xl">
    <!-- Storage Error Alert -->
    {#if $persistenceError}
        <div
            class="bg-tertiary/10 border-tertiary mb-6 rounded-lg border p-4"
            role="alert"
            aria-live="assertive"
        >
            <div class="flex items-start gap-3">
                <svg
                    class="text-tertiary h-5 w-5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                >
                    <path
                        fill-rule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clip-rule="evenodd"
                    />
                </svg>
                <div class="flex-1">
                    <h3 class="text-secondary text-sm font-semibold">Error al guardar</h3>
                    <p class="text-tertiary mt-1 text-sm">
                        {#if $persistenceError === "storage_quota_exceeded"}
                            El almacenamiento local está lleno. Por favor, libera espacio o utiliza
                            el navegador en modo privado.
                        {:else}
                            No se pudo guardar el borrador automáticamente. Tus cambios pueden
                            perderse.
                        {/if}
                    </p>
                </div>
                <button
                    type="button"
                    class="text-tertiary hover:text-secondary flex-shrink-0"
                    onclick={() => persistenceError.set(null)}
                    aria-label="Cerrar alerta"
                >
                    <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fill-rule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                </button>
            </div>
        </div>
    {/if}

    <!-- Header with title and action buttons -->
    <div class="mb-6 flex items-start justify-between gap-4">
        <div class="flex-1">
            <input
                type="text"
                value={title}
                oninput={(e) => onTitleChange?.(e.currentTarget.value)}
                placeholder="Título de campaña"
                class="text-primary mb-2 w-full border-0 bg-transparent text-3xl font-bold focus:ring-0 focus:outline-none"
            />
            <input
                type="text"
                value={subtitle}
                oninput={(e) => onSubtitleChange?.(e.currentTarget.value)}
                placeholder="Subtítulo"
                class="text-tertiary w-full border-0 bg-transparent text-lg focus:ring-0 focus:outline-none"
            />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3">
            <Button kind="ghost" size="sm" disabled={true} data-testid="wizard-preview-btn">
                Previsualizar
            </Button>
            <Button kind="secondary" size="sm" onclick={handleSave} data-testid="wizard-save-btn">
                Guardar
            </Button>
            <Button
                kind="primary"
                size="sm"
                disabled={!allStepsCompleted}
                onclick={handlePublish}
                data-testid="wizard-publish-btn"
            >
                Publicar
            </Button>
        </div>
    </div>

    <!-- Tab Navigation -->
    <div class="mb-8 overflow-x-auto">
        <div class="flex min-w-max items-center gap-0">
            {#each steps as step}
                {@const isDisabled =
                    step.id > 1 && !completedSteps.has(step.id - 1) && step.id !== currentStep}
                <button
                    class="box-border flex items-center justify-center gap-2 overflow-visible rounded-tl-lg rounded-tr-lg border-b-2 px-6 py-3 whitespace-nowrap transition-all duration-200 {getTabClasses(
                        step,
                    )}"
                    onclick={() => !isDisabled && handleTabClick(step.id)}
                    onkeydown={(e) => handleTabKeydown(step.id, e)}
                    disabled={isDisabled}
                    tabindex={isDisabled ? -1 : 0}
                    aria-label={step.label}
                    aria-selected={step.id === currentStep}
                    aria-disabled={isDisabled}
                    data-testid="wizard-tab-{step.id}"
                    data-tab-active={step.id === currentStep}
                    role="tab"
                >
                    <span class="font-medium">{step.label}</span>
                    {#if completedSteps.has(step.id)}
                        <span class="text-primary">✓</span>
                    {/if}
                </button>
            {/each}
        </div>
    </div>

    <!-- Step Content -->
    <div class="min-h-[400px]">
        {@render currentStepContent()}
    </div>
</div>

<style>
    /* Ensure proper scrolling on mobile */
    @media (max-width: 768px) {
        .overflow-x-auto {
            -webkit-overflow-scrolling: touch;
        }
    }
</style>
