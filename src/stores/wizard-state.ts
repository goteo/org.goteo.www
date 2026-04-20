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

import { z } from "astro/zod";
import { writable, derived, get } from "svelte/store";

import murmur from "murmurhash-js";

import type { MoneyWithConversion, Project, ProjectBudgetItem } from "../openapi/client";

/**
 * Wizard configuration data (Step 1: Configuration)
 */
export interface WizardConfiguration {
    projectDeadline: "minimum" | "optimum"; // Default: minimum
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
 * Campaign Information data (Step 2)
 */
export interface WizardCampaignInfo {
    // Media
    images: MediaImage[];
    video: string | undefined;

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
 * Wizard Rewards data (Step 3: Rewards)
 */
export interface WizardReward {
    id?: string | number;
    title: string; // Title displayed in reward card
    description: string | null; // Description displayed in reward card

    // The minimal monetary sum to be able to claim this reward
    money: {
        amount: number;
        currency: string;
    };

    // isFinite sets if the reward has a limit of exchanges, and if not, unitsTotal sets the limit
    isFinite: boolean;
    unitsTotal: number | null;
}

/**
 * Wizard Collaborations data (Step 4: Collaborations)
 */
export interface WizardCollaboration {
    title: string;
    description: string;
}

/**
 * Wizard Budget data (Step 5: Budget)
 */
export interface WizardBudgetItems {
    minimum: ProjectBudgetItem[];
    optimum: ProjectBudgetItem[];
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
    budget: MoneyWithConversion;

    // Step navigation
    currentStep: number;

    // Step 1: Configuration
    configuration: WizardConfiguration;

    // Step 2: Campaign Information
    campaignInfo: WizardCampaignInfo;

    // Step 3: Rewards
    rewards: WizardReward[];

    // Step 4: Collaborations
    collaborations: WizardCollaboration[];

    // Step 5: Budget
    budgetItems: WizardBudgetItems;

    // Pending future step (Phase 6) - placeholders
    // aboutYou: WizardAboutYou;
}

/**
 * Default wizard state
 */
const getDefaultState = (): WizardState => ({
    projectId: undefined,
    title: "",
    subtitle: "",
    budget: {
        amount: 0,
        currency: "EUR",
    },
    currentStep: 1,
    configuration: {
        projectDeadline: "minimum", // Default to minimum deadline (1 round)
    },
    campaignInfo: {
        images: [],
        video: "",
        objectives: "",
        legacy: "",
        targetAudience: "",
        team: "",
        touched: new Set(),
        errors: {},
    },
    rewards: [
        {
            title: "",
            description: null,
            money: { amount: 0, currency: "EUR" },
            isFinite: false,
            unitsTotal: null,
        },
    ],
    collaborations: [],
    budgetItems: { minimum: [], optimum: [] },
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
 * Define whether the project is ready to publish (all steps completed and valid).
 * Used to enable/disable the Publish button in the UI
 */
export const isReadyToPublish = writable<boolean>(false);

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
        budget: {
            amount: project.budget?.minimum?.money?.amount || 0,
            currency: project.budget?.minimum?.money?.currency || "EUR",
        },
        currentStep: 1,
        configuration: {
            projectDeadline: "minimum",
        },
        campaignInfo: {
            images: [],
            video: "",
            objectives: "",
            legacy: "",
            targetAudience: "",
            team: "",
            touched: new Set(),
            errors: {},
        },
        rewards: [],
        collaborations: [],
        budgetItems: { minimum: [], optimum: [] },
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
            rewards: parsed.rewards || getDefaultState().rewards,
            collaborations: parsed.collaborations || getDefaultState().collaborations,
            budgetItems: parsed.budgetItems || getDefaultState().budgetItems,
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
    projectDeadline: z.union([z.literal(1), z.literal(2)]),
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
        const deadlineSelected = config.projectDeadline;

        return deadlineSelected;
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
        errors.media = "pages.project.edit.rewards.validationn_info.reward.media.required";
    }

    // Objectives validation
    const objectivesPlainText = stripHtml(data.objectives).trim();
    if (objectivesPlainText.length === 0) {
        errors.objectives =
            "pages.project.edit.rewards.validationn_info.reward.objectives.required";
    } else if (objectivesPlainText.length < 50) {
        errors.objectives =
            "pages.project.edit.rewards.validationn_info.reward.objectives.min_length";
    } else if (objectivesPlainText.length > 5000) {
        errors.objectives =
            "pages.project.edit.rewards.validationn_info.reward.objectives.max_length";
    }

    // Legacy validation
    const legacyPlainText = stripHtml(data.legacy).trim();
    if (legacyPlainText.length === 0) {
        errors.legacy = "pages.project.edit.rewards.validationn_info.reward.legacy.required";
    } else if (legacyPlainText.length < 50) {
        errors.legacy = "pages.project.edit.rewards.validationn_info.reward.legacy.min_length";
    } else if (legacyPlainText.length > 5000) {
        errors.legacy = "pages.project.edit.rewards.validationn_info.reward.legacy.max_length";
    }

    // Target audience validation
    const targetPlainText = stripHtml(data.targetAudience).trim();
    if (targetPlainText.length === 0) {
        errors.targetAudience =
            "pages.project.edit.rewards.validationn_info.reward.target.required";
    } else if (targetPlainText.length < 30) {
        errors.targetAudience =
            "pages.project.edit.rewards.validationn_info.reward.target.min_length";
    } else if (targetPlainText.length > 5000) {
        errors.targetAudience =
            "pages.project.edit.rewards.validationn_info.reward.target.max_length";
    }

    // Team validation
    const teamPlainText = stripHtml(data.team).trim();
    if (teamPlainText.length === 0) {
        errors.team = "pages.project.edit.rewards.validationn_info.reward.team.required";
    } else if (teamPlainText.length < 50) {
        errors.team = "pages.project.edit.rewards.validationn_info.reward.team.min_length";
    } else if (teamPlainText.length > 5000) {
        errors.team = "pages.project.edit.rewards.validationn_info.reward.team.max_length";
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

// ============================================
// Rewards State Management (Step 3)
// ============================================

/**
 * Update rewards data (Step 3)
 *
 * Merges rewards updates with existing data.
 * Triggers auto-save to localStorage.
 *
 * @param index - Index of current reward
 * @param reward - Reward object to merge
 *
 * @example
 * // Update reward
 * updateReward(index: currentIndex, reward: updatedReward);
 */
export function updateReward(index: number, reward: WizardReward) {
    const errors = validateReward(reward);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    wizardState.update((state) => {
        const updated = [...state.rewards];
        updated[index] = reward;
        return { ...state, rewards: updated };
    });
    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function addReward(reward: WizardReward) {
    const errors = validateReward(reward);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const id = murmur.murmur3(JSON.stringify(reward) + Date.now());

    wizardState.update((state) => ({
        ...state,
        rewards: [...state.rewards, reward],
    }));
    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function deleteReward(index: number) {
    wizardState.update((state) => ({
        ...state,
        rewards: state.rewards.filter((_, i) => i !== index),
    }));
    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function validateReward(reward: WizardReward): Record<string, string> {
    const errors: Record<string, string> = {};
    const hash = murmur.murmur3(JSON.stringify(reward));

    if (!reward.title.trim()) {
        errors[`reward_error_title_${hash}`] = "pages.project.edit.rewards.validation.title";
    }

    if (!reward.money.amount || reward.money.amount <= 0) {
        errors[`reward_error_amount_${hash}`] = "pages.project.edit.rewards.validation.amount";
    }

    if (reward.isFinite && (!reward.unitsTotal || reward.unitsTotal <= 0)) {
        errors[`reward_error_units_${hash}`] = "pages.project.edit.rewards.validation.units";
    }

    return errors;
}

// ============================================
// Collaborations State Management (Step 4)
// ============================================

/**
 * Update Collaborations data (Step 4)
 *
 * Merges collaborations updates with existing data.
 * Triggers auto-save to localStorage.
 *
 * @param index - Current collaboration's index
 * @param collab - Collaboration object to merge
 *
 * @example
 * // Update collaboration
 * updateCollaboration(index: currentIndex, collab: updatedCollab);
 */
export function updateCollaboration(
    index: number,
    collab: WizardCollaboration,
): Record<string, string> {
    const errors = validateCollaboration(collab);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    wizardState.update((state) => {
        const updated = [...state.collaborations];
        updated[index] = collab;

        return { ...state, collaborations: updated };
    });

    hasUnsavedChanges.set(true);
    saveToLocalStorage();

    return {};
}

export function addCollaboration(collab: WizardCollaboration): Record<string, string> {
    const errors = validateCollaboration(collab);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    wizardState.update((state) => ({
        ...state,
        collaborations: [...state.collaborations, collab],
    }));

    hasUnsavedChanges.set(true);
    saveToLocalStorage();

    return {};
}

export function deleteCollaboration(index: number) {
    wizardState.update((state) => {
        const collaborations = state.collaborations.splice(index, 1); // Remove the collaboration from the array

        return {
            ...state,
            collaborations: { ...collaborations },
        };
    });
    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function validateCollaboration(collab: WizardCollaboration): Record<string, string> {
    const errors: Record<string, string> = {};
    const hash = murmur.murmur3(JSON.stringify(collab));

    if (!collab.title.trim()) {
        errors[`collab_error_title_${hash}`] = "pages.project.edit.collaborations.validation.title";
    }

    if (collab.description && collab.description.length > 1000) {
        errors[`collab_error_description_too_long_${hash}`] =
            "pages.project.edit.collaborations.validation.descriptionTooLong";
    }

    if (!collab.description.trim()) {
        errors[`collab_error_description_${hash}`] =
            "pages.project.edit.collaborations.validation.description";
    }

    return errors;
}

// ============================================
// BudgetItems State Management (Step 5)
// ============================================

/**
 * Update budgetItems data (Step 5)
 *
 * Merges budget items updates with existing data.
 * Triggers auto-save to localStorage.
 *
 * @param index - Current budget item index
 * @param item - Budget item object to merge
 *
 * @example
 * // Update unitsTotal
 * updateRewards({ unitsTotal: newCount });
 */
export function updateBudgetItem(index: number, item: ProjectBudgetItem) {
    const errors = validateBudgetItem(item);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    wizardState.update((state) => {
        const updated = [...state.budgetItems[item.deadline]];
        updated[index] = item;

        return {
            ...state,
            budgetItems: {
                ...state.budgetItems,
                [item.deadline]: updated,
            },
        };
    });

    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function addBudgetItem(item: ProjectBudgetItem) {
    const errors = validateBudgetItem(item);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    wizardState.update((state) => ({
        ...state,
        budgetItems: {
            ...state.budgetItems,
            [item.deadline]: [...state.budgetItems[item.deadline], item],
        },
    }));

    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function deleteBudgetItem(index: number, deadline: "minimum" | "optimum") {
    wizardState.update((state) => ({
        ...state,
        budgetItems: {
            ...state.budgetItems,
            [deadline]: state.budgetItems[deadline].filter((_, i) => i !== index),
        },
    }));

    hasUnsavedChanges.set(true);
    saveToLocalStorage();
}

export function validateBudgetItem(item: ProjectBudgetItem): Record<string, string> {
    const errors: Record<string, string> = {};
    const hash = murmur.murmur3(JSON.stringify(item));

    if (!item.title.trim()) {
        errors[`budget_error_title_${hash}`] = "pages.project.edit.budget.validation.title.";
    }

    if (!item.description.trim()) {
        errors[`budget_error_description_${hash}`] =
            "pages.project.edit.budget.validation.description";
    }

    if (!item.money.amount || item.money.amount <= 0) {
        errors[`budget_error_amount_${hash}`] = "pages.project.edit.budget.validation.amount";
    }

    if (!item.money.currency) {
        errors[`budget_error_currency_${hash}`] = "pages.project.edit.budget.validation.currency";
    }

    if (!item.type) {
        errors[`budget_error_type_${hash}`] = "pages.project.edit.budget.validation.type";
    }

    if (!item.deadline || (item.deadline !== "minimum" && item.deadline !== "optimum")) {
        errors[`budget_error_deadline_${hash}`] = "pages.project.edit.budget.validation.class";
    }

    return errors;
}

export function validateBudgetAmount() {
    const { budgetItems, budget } = get(wizardState);
    const errors: Record<string, string> = {};

    if (budgetItems.minimum.length <= 0) {
        errors.minimum_length = "pages.project.edit.budget.validation.minimumItemsLength";
    }

    let minimumItemsTotalAmount: number = 0;

    for (let i = 0; i < budgetItems.minimum.length - 1; i++) {
        minimumItemsTotalAmount += budgetItems.minimum[i].money.amount;
    }

    if (minimumItemsTotalAmount !== budget.amount) {
        errors.minimum_length = "pages.project.edit.budget.validation.amountMinimum";
    }

    return errors;
}
