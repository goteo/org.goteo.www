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
    import TabNavigation, { type Tab } from "../../library/TabNavigation.svelte";
    import EditIcon from "../../../svgs/EditIcon.svelte";
    import EyeIcon from "../../../svgs/EyeIcon.svelte";
    import { t } from "../../../i18n/store";
    import {
        wizardState,
        navigateToStep,
        saveToLocalStorage,
        persistenceError,
    } from "../../../stores/wizard-state";

    let {
        title = "",
        subtitle = "",
        currentStepContent,
        onTitleChange,
        onSubtitleChange,
        onSave,
        onPublish,
    }: {
        title?: string;
        subtitle?: string;
        currentStepContent: Snippet;
        onTitleChange?: (value: string) => void;
        onSubtitleChange?: (value: string) => void;
        onSave?: () => void;
        onPublish?: () => void;
    } = $props();

    // Define the six wizard steps (reactive to language changes)
    const steps = $derived<Tab[]>([
        { id: 1, label: $t("wizard.steps.configuration") },
        { id: 2, label: $t("wizard.steps.campaign_info") },
        { id: 3, label: $t("wizard.steps.rewards") },
        { id: 4, label: $t("wizard.steps.collaborations") },
        { id: 5, label: $t("wizard.steps.budget") },
        { id: 6, label: $t("wizard.steps.about_you") },
    ]);

    // Reactive values from store
    const currentStep = $derived($wizardState.currentStep);

    /**
     * Handle tab click
     * Free navigation - no validation
     */
    function handleTabClick(stepId: number | string) {
        const numericStepId = typeof stepId === "number" ? stepId : Number(stepId);
        navigateToStep(numericStepId);
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
    }

    /**
     * Handle Publish button
     */
    function handlePublish() {
        if (onPublish) {
            onPublish();
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
                    <h3 class="text-secondary text-sm font-semibold">
                        {$t("wizard.errors.storage.title")}
                    </h3>
                    <p class="text-tertiary mt-1 text-sm">
                        {#if $persistenceError === "storage_quota_exceeded"}
                            {$t("wizard.errors.storage.quota_exceeded")}
                        {:else}
                            {$t("wizard.errors.storage.save_failed")}
                        {/if}
                    </p>
                </div>
                <button
                    type="button"
                    class="text-tertiary hover:text-secondary flex-shrink-0"
                    onclick={() => persistenceError.set(null)}
                    aria-label={$t("wizard.errors.storage.close")}
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
    <div
        class="bg-soft-purple border-purple-tint mb-6 flex items-center justify-between gap-4 rounded-3xl border px-6 py-1"
    >
        <!-- Left section: Icon + Title/Subtitle -->
        <div class="flex flex-1 items-center gap-2">
            <!-- Edit icon (rotated 180°) -->
            <div class="flex shrink-0 items-center justify-center">
                <div class="rotate-180">
                    <EditIcon width="24" height="24" />
                </div>
            </div>

            <!-- Title and subtitle column -->
            <div class="flex min-w-0 flex-1 flex-col justify-center">
                <input
                    type="text"
                    value={title}
                    oninput={(e) => onTitleChange?.(e.currentTarget.value)}
                    placeholder={$t("wizard.header.titlePlaceholder")}
                    class="w-full border-0 bg-transparent pb-0 text-2xl leading-8 font-bold text-black focus:ring-0 focus:outline-none"
                />
                <input
                    type="text"
                    value={subtitle}
                    oninput={(e) => onSubtitleChange?.(e.currentTarget.value)}
                    placeholder={$t("wizard.header.subtitlePlaceholder")}
                    class="w-full border-0 bg-transparent pt-0 text-sm leading-6 font-normal text-black focus:ring-0 focus:outline-none"
                />
            </div>
        </div>

        <!-- Right section: Action Buttons -->
        <div class="flex shrink-0 items-center gap-[16px]">
            <Button kind="ghost" size="md" disabled={true} data-testid="wizard-preview-btn">
                {#snippet children()}
                    <EyeIcon width="20" height="20" />
                    {$t("wizard.buttons.preview")}
                {/snippet}
            </Button>
            <Button kind="secondary" size="md" onclick={handleSave} data-testid="wizard-save-btn">
                {#snippet children()}
                    {$t("wizard.buttons.save")}
                {/snippet}
            </Button>
            <Button
                kind="primary"
                size="md"
                onclick={handlePublish}
                data-testid="wizard-publish-btn"
            >
                {#snippet children()}
                    {$t("wizard.buttons.publish")}
                {/snippet}
            </Button>
        </div>
    </div>

    <!-- Tab Navigation -->
    <div class="mb-8">
        <TabNavigation tabs={steps} currentTab={currentStep} onTabClick={handleTabClick} />
    </div>

    <!-- Step Content -->
    <div class="min-h-[400px]">
        {@render currentStepContent()}
    </div>
</div>
