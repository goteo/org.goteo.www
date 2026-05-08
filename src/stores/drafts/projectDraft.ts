import { liveQuery } from "dexie";
import { writable, readable, get, derived } from "svelte/store";

import { session } from "../../auth/store";
import { db } from "../../utils/drafts/db";
import { draftRepo } from "../../utils/drafts/repository";

import type { Budget, ProjectBudgetItem, ProjectCollaboration, ProjectProjectCreationDto, ProjectReward } from "../../openapi/client";
import { validateBudgetItem, validateCollaboration, validateDraftToPublish, validateReward, validationErrors } from "./draftValidation";

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

export interface WizardConfiguration {
    projectDeadline: "minimum" | "optimum"; // Default: minimum
}

export interface WizardCampaignInfo {
    // Media/**
    images: MediaImage[];
    video: string | undefined;

    // Rich text content (stored as HTML)
    objectives: string;
    legacy: string;
    targetAudience: string;
    team: string;
}

export type Wizard = {
    // Step navigation
    currentStep: number;

    // Total budget amount
    budget?: Budget;

    // Step 1: Configuration
    configuration: WizardConfiguration;

    // Step 2: Campaign Information
    campaignInfo: WizardCampaignInfo;

    // Step 3: Rewards
    rewards: ProjectReward[];

    // Step 4: Collaborations
    collaborations: ProjectCollaboration[];

    // Step 5: Budget
    budgetItems: {
        minimum: ProjectBudgetItem[];
        optimum: ProjectBudgetItem[];
    };

    // Pending future step (Phase 6) - placeholders
    // aboutYou: WizardAboutYou;
}

export interface Draft {
    draftId: string;
    userId: number;

    createProject: ProjectProjectCreationDto;
    wizardForm: Wizard;

    updatedAt: number;
}

export const drafts = derived(session, ($session, set) => {
    if (!$session?.user?.id) {
        set([]);
        return;
    }

    const store = setDraftsStore($session.user.id);

    const unsubscribe = store.subscribe(set);

    return unsubscribe;
});

export const currentDraft = writable<Draft | null>(null);

export const wizard = derived(currentDraft, ($d) => $d?.wizardForm);
export const project = derived(currentDraft, ($d) => $d?.createProject);

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
export const isReadyToPublish = derived(
    currentDraft,
    ($draft) => {
        if (!$draft) return false;

        const errors = validateDraftToPublish($draft);

        return Object.keys(errors).length === 0;
    },
);

/**
 * Derived store that indicates if the form is valid.
 * Returns true only when:
 * 1. All required fields have values
 * 2. There are no validation errors
 */
export const isCreateFormValid = derived([currentDraft, validationErrors], ([$draft, $errors]) => {
    // Check if there are any validation errors
    if (Object.keys($errors).length > 0) {
        return false;
    }

    // Check that required fields have values
    const hasTitle = ($draft?.createProject?.title?.trim().length ?? 0) > 0;
    const hasSubtitle = ($draft?.createProject?.subtitle?.trim().length ?? 0) > 0;
    const hasCategories = ($draft?.createProject?.categories?.length ?? 0) > 0;

    return hasTitle && hasSubtitle && hasCategories;
});

export function createDraftId() {
    return crypto.randomUUID();
}

function getUserId(): number {
    const s = get(session);

    if (!s?.user?.id) {
        throw new Error("User not authenticated");
    }

    return s.user.id;
}

export function setDraftsStore(userId: number) {
    return readable<Draft[]>([], (set) => {
        const subscription = liveQuery(() =>
            db.drafts
                .where("userId")
                .equals(userId)
                .reverse()
                .sortBy("updatedAt")
        ).subscribe({
            next: set,
            error: console.error,
        });

        return () => subscription.unsubscribe();
    });
}

export async function createDraft(project?: ProjectProjectCreationDto) {
    const draftId = createDraftId();
    const userId = getUserId();

    const draft: Draft = {
        draftId,
        userId,
        createProject: project ?? ({} as Partial<ProjectProjectCreationDto> as ProjectProjectCreationDto),
        wizardForm: {
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
            },
            rewards: [],
            collaborations: [],
            budgetItems: {
                minimum: [],
                optimum: [],
            },
        },
        updatedAt: Date.now(),
    };

    await draftRepo.create(draft);
    currentDraft.set(draft);

    return draftId;
}

export async function loadDraft(userId: number, draftId: string) {
    const draft = await draftRepo.get(draftId, userId);

    if (!draft) return false;

    currentDraft.set(draft);
    return true;
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

let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function persistDraft() {
    if (saveTimer) clearTimeout(saveTimer);

    hasUnsavedChanges.set(true);
    saveTimer = setTimeout(async () => {
        const draft = get(currentDraft);
        if (!draft) return;

        try {
            const updatedDraft = {
                ...draft,
                updatedAt: Date.now(),
            };

            currentDraft.set(updatedDraft);

            await draftRepo.update(draft.draftId, draft.userId, updatedDraft);

            hasUnsavedChanges.set(false);
            persistenceError.set(null);
        } catch (error) {
            console.error("Failed to persist draft:", error);

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
 * Update Wizard Form data
 *
 * Merges new wizard updates with already existing wizard data.
 *
 * @param data - Partial object with wizard data that has been modified
 */
export function updateWizard(data: Partial<Wizard>) {
    currentDraft.update((draft) => {
        if (!draft) return draft;

        const updated = {
            ...draft,
            wizardForm: {
                ...draft.wizardForm,

                ...data,

                configuration: {
                    ...draft.wizardForm.configuration,
                    ...data.configuration,
                },

                campaignInfo: {
                    ...draft.wizardForm.campaignInfo,
                    ...data.campaignInfo,
                },

                budgetItems: {
                    ...draft.wizardForm.budgetItems,
                    ...data.budgetItems,
                },
            },
        };

        return updated;
    });

    persistDraft();
}

export function updateConfiguration(data: Partial<WizardConfiguration>) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        configuration: {
            ...draft.wizardForm.configuration,
            ...data
        }
    });
}

export function updateCampaignInfo(
    data: Partial<WizardCampaignInfo>,
) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        campaignInfo: {
            ...draft.wizardForm.campaignInfo,
            ...data
        }
    });
}

export function addReward(reward: ProjectReward) {
    const errors = validateReward(reward);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        rewards: [
            ...draft.wizardForm.rewards,
            {
                ...reward,
                project: reward.project,
            },
        ],
    });

    return {};
}

export function updateReward(
    index: number,
    reward: ProjectReward,
) {
    const errors = validateReward(reward);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return;

    const rewards = [...draft.wizardForm.rewards];

    rewards[index] = reward;

    updateWizard({
        rewards,
    });

    return {};
}

export function deleteReward(index: number) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        rewards: draft.wizardForm.rewards.filter(
            (_, i) => i !== index,
        ),
    });
}

export function addCollaboration(
    collab: ProjectCollaboration
): Record<string, string> {
    const errors = validateCollaboration(collab);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    updateWizard({
        collaborations: [
            ...draft.wizardForm.collaborations,
            { ...collab },
        ],
    });

    return {};
}

export function updateCollaboration(
    index: number,
    collab: ProjectCollaboration,
): Record<string, string> {
    const errors = validateCollaboration(collab);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    const collaborations = [...draft.wizardForm.collaborations];

    collaborations[index] = collab;

    updateWizard({
        collaborations,
    });

    return {};
}

export function deleteCollaboration(index: number) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        collaborations:
            draft.wizardForm.collaborations.filter(
                (_, i) => i !== index,
            ),
    });
}

export function addBudgetItem(
    item: ProjectBudgetItem
) {
    const errors = validateBudgetItem(item);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    updateWizard({
        budgetItems: {
            ...draft.wizardForm.budgetItems,

            [item.deadline]: [
                ...draft.wizardForm.budgetItems[
                item.deadline
                ],
                item,
            ],
        },
    });

    return {};
}

export function updateBudgetItem(
    index: number,
    item: ProjectBudgetItem,
) {
    const errors = validateBudgetItem(item);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    const updated = [
        ...draft.wizardForm.budgetItems[item.deadline],
    ];

    updated[index] = item;

    updateWizard({
        budgetItems: {
            ...draft.wizardForm.budgetItems,

            [item.deadline]: updated,
        },
    });

    return {};
}

export function deleteBudgetItem(
    index: number,
    deadline: "minimum" | "optimum",
) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        budgetItems: {
            ...draft.wizardForm.budgetItems,

            [deadline]:
                draft.wizardForm.budgetItems[
                    deadline
                ].filter((_, i) => i !== index),
        },
    });
}

/**
 * Update create Project form data
 *
 * Merges new create project form updates with already existing project data.
 *
 * @param data - Partial object with Project API Type data that has been modified
 */
export function updateProject(data: Partial<ProjectProjectCreationDto>) {
    currentDraft.update((draft) => {
        if (!draft) return draft;

        const updated = {
            ...draft,
            createProject: {
                ...draft.createProject,
                ...data,
            },
        };

        return updated;
    });

    persistDraft();
}

export async function deleteCurrentDraft(draftId: string, userId: number) {
    const current = get(currentDraft);

    if (current?.draftId === draftId) {
        currentDraft.set(null);
    }

    await draftRepo.delete(draftId, userId);
    touchedFields.set(new Set());
    hasUnsavedChanges.set(false);
    persistenceError.set(null);
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
    const state = get(currentDraft);
    const currentStep = state?.wizardForm.currentStep;

    // No validation - free navigation
    if (targetStep === currentStep) {
        console.log(`[wizard-state] Already on step ${targetStep}`);
        return true;
    }

    console.log(`[wizard-state] Navigating: ${currentStep} → ${targetStep}`);
    hasUnsavedChanges.set(true);
    updateWizard({ currentStep: targetStep });
    updateUrl(targetStep);
    return true;
}

/**
 * Update browser URL with current step (for browser back/forward support)
 * @param step - Current step number
 */
export function updateUrl(step: number) {
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
