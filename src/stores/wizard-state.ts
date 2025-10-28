/**
 * Wizard State Management Store
 *
 * Manages state for the multi-step project setup wizard.
 * Separate from project-draft.ts as they serve different purposes:
 * - project-draft.ts: Stage 1 (proposal submission)
 * - wizard-state.ts: Stage 2 (detailed setup after approval)
 *
 * Features:
 * - Step navigation with validation
 * - LocalStorage persistence (auto-save every 1 second)
 * - Pre-population from approved proposal
 * - Per-step validation tracking
 */

import { writable, derived, get } from "svelte/store";
import { z } from "zod";

import type { Project } from "../openapi/client";

/**
 * Wizard configuration data (Step 1: Configuration)
 */
export interface WizardConfiguration {
    languages: string[]; // Primary + secondary languages
    geographicScope?: "local" | "estatal" | "internacional";
    localities?: string; // Only for local scope
    fundingRounds: 1 | 2; // Default: 1
}

/**
 * Complete wizard state
 */
export interface WizardState {
    // Project identification
    projectId?: string;

    // Pre-filled from proposal (Stage 1)
    title: string;
    subtitle: string;
    categories: string[];
    budget: number;
    releaseDate: string | null;

    // Step navigation
    currentStep: number;
    completedSteps: Set<number>;

    // Step 1: Configuration
    configuration: WizardConfiguration;

    // Future steps (Phase 2-6) - placeholders
    // campaignInfo: WizardCampaignInfo;
    // rewards: WizardReward[];
    // collaborations: WizardCollaboration[];
    // detailedBudget: WizardBudgetItem[];
    // aboutYou: WizardAboutYou;
}

/**
 * Default wizard state
 */
const getDefaultState = (): WizardState => ({
    projectId: undefined,
    title: "",
    subtitle: "",
    categories: [],
    budget: 0,
    releaseDate: null,
    currentStep: 1,
    completedSteps: new Set(),
    configuration: {
        languages: [],
        geographicScope: undefined,
        localities: undefined,
        fundingRounds: 1, // Default to 1 round
    },
});

/**
 * Main wizard state store
 */
export const wizardState = writable<WizardState>(getDefaultState());

/**
 * Validation errors for current step
 */
export const validationErrors = writable<Record<string, string>>({});

/**
 * Touched fields tracker
 */
export const touchedFields = writable<Set<string>>(new Set());

/**
 * Unsaved changes flag (for beforeunload warning)
 */
export const hasUnsavedChanges = writable<boolean>(false);

/**
 * Persistence error state
 * Tracks localStorage save failures (quota exceeded, general errors)
 */
export const persistenceError = writable<string | null>(null);

/**
 * LocalStorage key for wizard state persistence
 */
const STORAGE_KEY = "goteo-project-wizard";

/**
 * Save throttle timer
 */
let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Initialize wizard state from an approved project
 *
 * Pre-populates wizard with data from the approved proposal (Stage 1).
 * Attempts to restore additional wizard-specific data from localStorage.
 *
 * @param project - The approved project data from the API
 *
 * @example
 * // Initialize wizard when user enters setup flow
 * const project = await getProject(projectId);
 * initializeFromProject(project);
 */
export function initializeFromProject(project: Project) {
    wizardState.set({
        projectId: project.id ? String(project.id) : undefined,
        title: project.title || "",
        subtitle: project.subtitle || "",
        categories: project.categories || [],
        budget: project.budget?.minimum?.money?.amount || 0,
        releaseDate: project.deadline || null,
        currentStep: 1,
        completedSteps: new Set(),
        configuration: {
            languages: [],
            geographicScope: undefined,
            localities: undefined,
            fundingRounds: 1,
        },
    });

    // Try to restore additional wizard data from localStorage
    restoreFromLocalStorage();
}

/**
 * Save wizard state to localStorage (throttled)
 *
 * Automatically throttled to max 1 save per second to prevent excessive writes.
 * Handles quota exceeded errors and general storage failures gracefully.
 * Updates persistenceError store on failure, keeps hasUnsavedChanges true on error.
 *
 * @example
 * // Called automatically by updateConfiguration, completeCurrentStep, etc.
 * // Can also be called manually if needed
 * saveToLocalStorage();
 */
export function saveToLocalStorage() {
    // Clear existing timer
    if (saveTimer) {
        clearTimeout(saveTimer);
    }

    // Set new timer (throttle to max 1 save per second)
    saveTimer = setTimeout(() => {
        const state = get(wizardState);

        // Convert Set to Array for JSON serialization
        const serializable = {
            ...state,
            completedSteps: Array.from(state.completedSteps),
        };

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
            hasUnsavedChanges.set(false);
            persistenceError.set(null);
        } catch (error) {
            console.error("Failed to save wizard state to localStorage:", error);

            // Handle QuotaExceededError specifically
            if (error instanceof DOMException && error.name === "QuotaExceededError") {
                persistenceError.set("storage_quota_exceeded");
            } else {
                persistenceError.set("storage_general_error");
            }

            // Keep hasUnsavedChanges as true when persistence fails
            hasUnsavedChanges.set(true);
        }
    }, 1000);
}

/**
 * Restore wizard state from localStorage
 *
 * Only restores wizard-specific fields (currentStep, completedSteps, configuration).
 * Does not overwrite pre-filled proposal data (title, subtitle, etc.).
 *
 * @returns true if restoration was successful, false otherwise
 *
 * @example
 * // Restore wizard progress after page reload
 * if (restoreFromLocalStorage()) {
 *   console.log('Wizard state restored');
 * }
 */
export function restoreFromLocalStorage(): boolean {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            return false;
        }

        const parsed = JSON.parse(stored);

        // Convert Array back to Set
        if (parsed.completedSteps) {
            parsed.completedSteps = new Set(parsed.completedSteps);
        }

        // Only restore wizard-specific fields (not pre-filled proposal data)
        wizardState.update((state) => ({
            ...state,
            currentStep: parsed.currentStep || 1,
            completedSteps: parsed.completedSteps || new Set(),
            configuration: parsed.configuration || getDefaultState().configuration,
        }));

        return true;
    } catch (error) {
        console.error("Failed to restore wizard state from localStorage:", error);
        return false;
    }
}

/**
 * Clear wizard state from localStorage
 *
 * Should be called after successful project publish to clean up stored data.
 *
 * @example
 * // After successful project submission
 * await publishProject(projectData);
 * clearLocalStorage();
 */
export function clearLocalStorage() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        hasUnsavedChanges.set(false);
        persistenceError.set(null);
    } catch (error) {
        console.error("Failed to clear wizard state from localStorage:", error);
    }
}

/**
 * Navigate to a specific wizard step
 *
 * Navigation rules:
 * - Can navigate to current step (no-op, returns true)
 * - Can navigate backward to any previous step
 * - Can navigate forward only if ALL previous steps are completed
 * - Updates URL with browser history for back/forward button support
 *
 * @param targetStep - The step number to navigate to (1-indexed)
 * @returns true if navigation was successful, false if blocked
 *
 * @example
 * // Navigate to step 2 (allowed if step 1 is completed)
 * navigateToStep(2);
 *
 * // Navigate back to step 1 (always allowed)
 * navigateToStep(1);
 */
export function navigateToStep(targetStep: number): boolean {
    const state = get(wizardState);
    const currentStep = state.currentStep;

    // Case 1: Navigation to current step (no-op)
    if (targetStep === currentStep) {
        console.log(`[wizard-state] Already on step ${targetStep}`);
        return true;
    }

    // Case 2: Backward navigation - allow to any previous step
    if (targetStep < currentStep) {
        console.log(`[wizard-state] Navigating backward: ${currentStep} → ${targetStep}`);
        wizardState.update((s) => ({ ...s, currentStep: targetStep }));
        hasUnsavedChanges.set(true);
        saveToLocalStorage();
        updateUrl(targetStep);
        return true;
    }

    // Case 3: Forward navigation - require all previous steps completed
    if (targetStep > currentStep) {
        // Check that all steps from 1 to (targetStep - 1) are completed
        const requiredSteps = Array.from({ length: targetStep - 1 }, (_, i) => i + 1);
        const allPreviousCompleted = requiredSteps.every((step) => state.completedSteps.has(step));

        if (!allPreviousCompleted) {
            const missingSteps = requiredSteps.filter((step) => !state.completedSteps.has(step));
            console.warn(
                `[wizard-state] Cannot navigate to step ${targetStep}: incomplete steps [${missingSteps.join(", ")}]`,
            );
            return false;
        }

        console.log(`[wizard-state] Navigating forward: ${currentStep} → ${targetStep}`);
        wizardState.update((s) => ({ ...s, currentStep: targetStep }));
        hasUnsavedChanges.set(true);
        saveToLocalStorage();
        updateUrl(targetStep);
        return true;
    }

    return false;
}

/**
 * Update browser URL with current step (for browser back/forward support)
 * @param step - Current step number
 */
function updateUrl(step: number) {
    // SSR safety check
    if (typeof window === "undefined") {
        return;
    }

    try {
        const url = new URL(window.location.href);
        url.searchParams.set("step", step.toString());
        window.history.pushState({ step }, "", url.toString());
    } catch (error) {
        console.error("[wizard-state] Failed to update URL:", error);
    }
}

/**
 * Mark current step as completed and navigate to next step
 *
 * Automatically advances to the next step after marking current as complete.
 * Triggers auto-save to localStorage.
 *
 * @example
 * // After user completes configuration step
 * if (validateConfiguration()) {
 *   completeCurrentStep();
 * }
 */
export function completeCurrentStep() {
    wizardState.update((state) => {
        const newCompletedSteps = new Set(state.completedSteps);
        newCompletedSteps.add(state.currentStep);

        return {
            ...state,
            completedSteps: newCompletedSteps,
            currentStep: state.currentStep + 1,
        };
    });

    hasUnsavedChanges.set(true);
    saveToLocalStorage();
    updateUrl(get(wizardState).currentStep);
}

/**
 * Update configuration data (Step 1)
 *
 * Merges partial configuration updates with existing data.
 * Triggers auto-save to localStorage.
 *
 * @param config - Partial configuration object to merge
 *
 * @example
 * // Update languages selection
 * updateConfiguration({ languages: ['es', 'en'] });
 *
 * // Update geographic scope
 * updateConfiguration({ geographicScope: 'local', localities: 'Barcelona' });
 */
export function updateConfiguration(config: Partial<WizardConfiguration>) {
    wizardState.update((state) => ({
        ...state,
        configuration: {
            ...state.configuration,
            ...config,
        },
    }));

    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

/**
 * Mark a field as touched (for validation UX)
 *
 * Used to track which fields the user has interacted with,
 * so validation errors only show after user touches the field.
 *
 * @param fieldName - The field identifier to mark as touched
 *
 * @example
 * // Mark field as touched on blur
 * <input on:blur={() => markFieldAsTouched('languages')} />
 */
export function markFieldAsTouched(fieldName: string) {
    touchedFields.update((fields) => {
        const newFields = new Set(fields);
        newFields.add(fieldName);
        return newFields;
    });
}

/**
 * Reset wizard to initial state
 *
 * Clears all wizard data including localStorage.
 * Should be used when user cancels or starts a new wizard session.
 *
 * @example
 * // Reset wizard on cancel
 * function handleCancel() {
 *   if (confirm('Discard all changes?')) {
 *     resetWizard();
 *     navigate('/dashboard');
 *   }
 * }
 */
export function resetWizard() {
    wizardState.set(getDefaultState());
    validationErrors.set({});
    touchedFields.set(new Set());
    hasUnsavedChanges.set(false);
    persistenceError.set(null);
    clearLocalStorage();
}

/**
 * Validation schema for Configuration step
 */
export const configurationSchema = z.object({
    languages: z.array(z.string()).min(1, "validation.wizard.languages.required"),
    geographicScope: z
        .enum(["local", "estatal", "internacional"])
        .refine((val) => val !== undefined, "validation.wizard.geographic_scope.required"),
    localities: z.string().optional(),
    fundingRounds: z.union([z.literal(1), z.literal(2)]),
});

/**
 * Validate Configuration step (Step 1)
 *
 * Validates against the configurationSchema using Zod.
 * Updates validationErrors store with any validation failures.
 *
 * @returns true if configuration is valid, false otherwise
 *
 * @example
 * // Validate before completing step
 * function handleContinue() {
 *   if (validateConfiguration()) {
 *     completeCurrentStep();
 *   }
 * }
 */
export function validateConfiguration(): boolean {
    const state = get(wizardState);
    const result = configurationSchema.safeParse(state.configuration);

    if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.issues.forEach((issue) => {
            const fieldName = issue.path[0] as string;
            if (!errors[fieldName]) {
                errors[fieldName] = issue.message;
            }
        });
        validationErrors.set(errors);
        return false;
    }

    // Additional validation: if scope is local, localities must be provided
    if (state.configuration.geographicScope === "local") {
        if (!state.configuration.localities || state.configuration.localities.trim().length === 0) {
            validationErrors.set({
                localities: "validation.wizard.localities.required",
            });
            return false;
        }
    }

    validationErrors.set({});
    return true;
}

/**
 * Derived store: is Configuration step valid?
 */
export const isConfigurationValid = derived(
    [wizardState, validationErrors],
    ([$state, $errors]) => {
        // Check for validation errors
        if (Object.keys($errors).length > 0) {
            return false;
        }

        // Check required fields
        const config = $state.configuration;
        const hasLanguages = config.languages.length > 0;
        const hasScope = config.geographicScope !== undefined;
        const hasLocalities =
            config.geographicScope !== "local" || (config.localities?.trim().length || 0) > 0;

        return hasLanguages && hasScope && hasLocalities;
    },
);

/**
 * Derived store: are all steps completed?
 */
export const areAllStepsCompleted = derived(wizardState, ($state) => {
    // For Phase 1, only check step 1
    // In future phases, check all 6 steps
    return $state.completedSteps.has(1);
});
