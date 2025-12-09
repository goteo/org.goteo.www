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
 * Media image data
 */
export interface MediaImage {
    id: string;
    url: string; // Base64 data URL or API URL
    file?: File; // Original file reference
    size: number; // File size in bytes
    name: string; // Original filename
}

/**
 * Video embed data
 */
export interface VideoEmbed {
    type: "youtube" | "vimeo" | "direct";
    url: string;
    embedId?: string; // Extracted video ID
}

/**
 * Campaign Information data (Step 2)
 */
export interface WizardCampaignInfo {
    // Media
    images: MediaImage[];
    video: VideoEmbed | null;

    // Rich text content (stored as HTML)
    objectives: string;
    legacy: string;
    targetAudience: string;
    team: string;

    // Validation tracking
    touched: Set<string>;
    errors: Record<string, string>;
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

    // Step 1: Configuration
    configuration: WizardConfiguration;

    // Step 2: Campaign Information
    campaignInfo: WizardCampaignInfo;

    // Future steps (Phase 3-6) - placeholders
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
    configuration: {
        languages: [],
        geographicScope: undefined,
        localities: undefined,
        fundingRounds: 1, // Default to 1 round
    },
    campaignInfo: {
        images: [],
        video: null,
        objectives: "",
        legacy: "",
        targetAudience: "",
        team: "",
        touched: new Set(),
        errors: {},
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
        configuration: {
            languages: [],
            geographicScope: undefined,
            localities: undefined,
            fundingRounds: 1,
        },
        campaignInfo: {
            images: [],
            video: null,
            objectives: "",
            legacy: "",
            targetAudience: "",
            team: "",
            touched: new Set(),
            errors: {},
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
            campaignInfo: {
                ...state.campaignInfo,
                touched: Array.from(state.campaignInfo.touched),
            },
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
 * Only restores wizard-specific fields (currentStep, completedSteps, configuration, campaignInfo).
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

        // Convert Arrays back to Sets
        if (parsed.campaignInfo?.touched) {
            parsed.campaignInfo.touched = new Set(parsed.campaignInfo.touched);
        }

        // Only restore wizard-specific fields (not pre-filled proposal data)
        wizardState.update((state) => ({
            ...state,
            currentStep: parsed.currentStep || 1,
            configuration: parsed.configuration || getDefaultState().configuration,
            campaignInfo: parsed.campaignInfo || getDefaultState().campaignInfo,
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

    // No validation - free navigation
    if (targetStep === currentStep) {
        console.log(`[wizard-state] Already on step ${targetStep}`);
        return true;
    }

    console.log(`[wizard-state] Navigating: ${currentStep} → ${targetStep}`);
    wizardState.update((s) => ({ ...s, currentStep: targetStep }));
    hasUnsavedChanges.set(true);
    saveToLocalStorage();
    updateUrl(targetStep);
    return true;
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
 * Update configuration data (Step 1)
 *
 * Merges partial configuration updates with existing data.
 * Triggers auto-save to localStorage.
 *
 * @param config - Partial configuration object to merge
 *
 * @example
 * // Update languages
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

// ============================================
// Campaign Info State Management (Step 2)
// ============================================

/**
 * Update campaign info data (Step 2)
 *
 * Merges partial campaign info updates with existing data.
 * Triggers auto-save to localStorage.
 *
 * @param info - Partial campaign info object to merge
 *
 * @example
 * // Update objectives
 * updateCampaignInfo({ objectives: '<p>My objectives...</p>' );
 *
 * // Add an image
 * updateCampaignInfo({
 *   images: [...currentImages, newImage]
 * );
 */
export function updateCampaignInfo(info: Partial<WizardCampaignInfo>) {
    wizardState.update((state) => ({
        ...state,
        campaignInfo: {
            ...state.campaignInfo,
            ...info,
        },
    }));

    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

/**
 * Strip HTML tags from a string to get plain text
 * Used for validating rich text field lengths
 *
 * @param html - HTML string to strip
 * @returns Plain text without HTML tags
 */
export function stripHtml(html: string): string {
    if (typeof document === "undefined") {
        // SSR fallback: simple regex-based stripping
        return html.replace(/<[^>]*>/g, "").trim();
    }
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

/**
 * Validate Campaign Info step (Step 2)
 *
 * Validates all campaign info fields according to requirements:
 * - At least 1 image OR 1 video required
 * - Objectives: min 50, max 5000 characters (plain text)
 * - Legacy: min 50, max 5000 characters
 * - Target audience: min 30, max 5000 characters
 * - Team: min 50, max 5000 characters
 *
 * @returns Record of field errors (empty if valid)
 *
 * @example
 * // Validate before completing step
 * function handleContinue() {
 *   const errors = validateCampaignInfo();
 *   if (Object.keys(errors).length === 0) {
 *     completeCurrentStep();
 *   }
 * }
 */
export function validateCampaignInfo(): Record<string, string> {
    const state = get(wizardState);
    const data = state.campaignInfo;
    const errors: Record<string, string> = {};

    // Media validation
    if (data.images.length === 0 && !data.video) {
        errors.media = "wizard.validation.campaign_info.media.required";
    }

    // Objectives validation
    const objectivesPlainText = stripHtml(data.objectives).trim();
    if (objectivesPlainText.length === 0) {
        errors.objectives = "wizard.validation.campaign_info.objectives.required";
    } else if (objectivesPlainText.length < 50) {
        errors.objectives = "wizard.validation.campaign_info.objectives.min_length";
    } else if (objectivesPlainText.length > 5000) {
        errors.objectives = "wizard.validation.campaign_info.objectives.max_length";
    }

    // Legacy validation
    const legacyPlainText = stripHtml(data.legacy).trim();
    if (legacyPlainText.length === 0) {
        errors.legacy = "wizard.validation.campaign_info.legacy.required";
    } else if (legacyPlainText.length < 50) {
        errors.legacy = "wizard.validation.campaign_info.legacy.min_length";
    } else if (legacyPlainText.length > 5000) {
        errors.legacy = "wizard.validation.campaign_info.legacy.max_length";
    }

    // Target audience validation
    const targetPlainText = stripHtml(data.targetAudience).trim();
    if (targetPlainText.length === 0) {
        errors.targetAudience = "wizard.validation.campaign_info.target.required";
    } else if (targetPlainText.length < 30) {
        errors.targetAudience = "wizard.validation.campaign_info.target.min_length";
    } else if (targetPlainText.length > 5000) {
        errors.targetAudience = "wizard.validation.campaign_info.target.max_length";
    }

    // Team validation
    const teamPlainText = stripHtml(data.team).trim();
    if (teamPlainText.length === 0) {
        errors.team = "wizard.validation.campaign_info.team.required";
    } else if (teamPlainText.length < 50) {
        errors.team = "wizard.validation.campaign_info.team.min_length";
    } else if (teamPlainText.length > 5000) {
        errors.team = "wizard.validation.campaign_info.team.max_length";
    }

    return errors;
}

/**
 * Check if Campaign Info step is valid
 *
 * @returns true if campaign info is valid, false otherwise
 */
export function isCampaignInfoValid(): boolean {
    const errors = validateCampaignInfo();
    return Object.keys(errors).length === 0;
}

/**
 * Derived store: is Campaign Info step valid?
 */
export const isCampaignInfoValidStore = derived(wizardState, () => {
    const errors = validateCampaignInfo();
    return Object.keys(errors).length === 0;
});
