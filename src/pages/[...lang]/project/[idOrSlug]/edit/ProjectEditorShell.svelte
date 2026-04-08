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
    import Button from "../../../../../components/library/Button.svelte";
    import TabNavigation, {
        type Tab,
    } from "../../../../../components/library/TabNavigation.svelte";
    import Toast from "../../../../../components/library/Toast.svelte";
    import { t } from "../../../../../i18n/store";
    import {
        wizardState,
        navigateToStep,
        saveToLocalStorage,
        persistenceError,
        hasUnsavedChanges,
    } from "../../../../../stores/wizard-state";
    import EditIcon from "../../../../../svgs/EditIcon.svelte";
    import EyeIcon from "../../../../../svgs/EyeIcon.svelte";

    import type { Project } from "../../../../../openapi/client";
    import type { Snippet } from "svelte";

    let {
        project,
        children,
        onSave,
        onPublish,
    }: {
        project: Project;
        children: Snippet;
        onSave?: () => void;
        onPublish?: () => void;
    } = $props();

    // Define the six wizard steps (reactive to language changes)
    const steps = $derived<Tab[]>([
        { id: 1, label: $t("pages.project.edit.tabs.configuration") },
        { id: 2, label: $t("pages.project.edit.tabs.campaign") },
        { id: 3, label: $t("pages.project.edit.tabs.rewards") },
        { id: 4, label: $t("pages.project.edit.tabs.collaborations") },
        { id: 5, label: $t("pages.project.edit.tabs.budget") },
        { id: 6, label: $t("pages.project.edit.tabs.aboutYou") },
    ]);

    // Reactive values from store
    const currentStep = $derived($wizardState.currentStep);

    let showSuccessToast = $state(false);

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
            showSuccessToast = true;
        }
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

<div class="wrapper">
    <div class="p-10 pb-20">
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
            class="bg-soft-purple border-variant1 mb-6 flex items-center justify-between gap-4 rounded-3xl border px-6 py-4 shadow-sm"
        >
            <!-- Left section: Icon + Title/Subtitle -->
            <div class="flex flex-1 items-center gap-4">
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
                        oninput={(e) => handleTitleChange(e.currentTarget.value)}
                        placeholder={$t("system.loading")}
                        class="w-full border-0 bg-transparent pb-0 text-2xl leading-8 font-bold text-black focus:ring-0 focus:outline-none"
                    />
                    <input
                        type="text"
                        value={subtitle}
                        oninput={(e) => handleSubtitleChange(e.currentTarget.value)}
                        placeholder={$t("system.loading")}
                        class="w-full border-0 bg-transparent pt-0 text-sm leading-6 font-normal text-black focus:ring-0 focus:outline-none"
                    />
                </div>
            </div>

            <!-- Save success Toast -->
            {#if showSuccessToast}
                <Toast variant="success" bind:showToast={showSuccessToast}
                    >{$t("wizard.successToast")}</Toast
                >
            {/if}

            <!-- Right section: Action Buttons -->
            <div class="flex shrink-0 items-center gap-[16px]">
                <Button kind="ghost" size="md" disabled={true}>
                    <EyeIcon width="20" height="20" />
                    {$t("common.preview")}
                </Button>
                <Button
                    kind="secondary"
                    size="md"
                    onclick={handleSave}
                    disabled={$hasUnsavedChanges ? false : true}
                >
                    {$t("common.save")}
                </Button>
                <Button
                    class="disabled:pointer-events-none disabled:opacity-24"
                    kind="primary"
                    size="md"
                    onclick={handlePublish}
                    disabled={currentStep !== 7}
                >
                    {$t("common.publish")}
                </Button>
            </div>
        </div>

        <!-- Tab Navigation -->
        <div class="mb-8">
            <TabNavigation tabs={steps} currentTab={currentStep} onTabClick={handleTabClick} />
        </div>

        <!-- Step Content -->
        <div class="min-h-100">
            {@render children()}
        </div>
    </div>
</div>
