import { liveQuery } from "dexie";
import { writable, readable, get, derived } from "svelte/store";

import {
    validateBudgetItem,
    validateCollaboration,
    validateDraftToPublish,
    validateReward,
    type ValidationErrors,
} from "./draftValidation";
import { session } from "../../auth/store";
import { db } from "../../utils/drafts/db";
import { draftRepo } from "../../utils/drafts/repository";

import type {
    Budget,
    ProjectBudgetItem,
    ProjectCollaboration,
    ProjectProjectCreationDto,
    ProjectReward,
} from "../../openapi/client";

/**
 * Uploaded file data
 */
export interface UploadedFile {
    id: string;
    url: string; // S3 URL or base64 data URL
    key?: string; // S3 object key for deletion
    file?: File; // Original file reference
    size: number; // File size in bytes
    name: string; // Original filename
    type: string; // MIME type
}

export interface WizardConfiguration {
    projectDeadline: "minimum" | "optimum"; // Default: minimum
}

export interface WizardCampaignInfo {
    // Media/**
    images: UploadedFile[];
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
};

export interface CreateProjectForm extends ProjectProjectCreationDto {
    budget?: Budget;
}

export interface ProjectDraftResources {
    rewards: ProjectReward[];
    collaborations: ProjectCollaboration[];
    budgetItems: {
        minimum: ProjectBudgetItem[];
        optimum: ProjectBudgetItem[];
    };
    images?: UploadedFile[];
}

export interface Draft {
    draftId: string;
    userId: number;
    isDirty?: boolean;
    apiSnapshot?: ProjectDraftResources;

    createProject: CreateProjectForm;
    wizardForm: Wizard;

    updatedAt: Date;
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

export const wizard = derived(
    currentDraft,
    ($d) =>
        $d?.wizardForm ??
        ({
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
        } as Wizard),
);
export const project = derived(
    currentDraft,
    ($d) =>
        $d?.createProject ?? {
            title: "",
            subtitle: "",
            categories: [],
            release: undefined,
        },
);

/**
 * Touched fields tracker
 */
export const touchedFields = writable<Set<string>>(new Set());

/**
 * Store to track if there are unsaved changes in the current draft to send it to API
 * Used to enable/disable the Save button in wizard form
 */
export const hasUnsavedChanges = writable<boolean>(false);

/**
 * Store to track if the draft is currently being saved to IndexedDB (persistence in progress)
 */
export const isSavingDraft = writable(false);

/**
 * Persistence error state
 * Tracks localStorage save failures (quota exceeded, general errors)
 */
export const persistenceError = writable<string | null>(null);

/**
 * Validation errors store
 * Stores field-specific validation error messages for the current step
 * Updated on each field change and used to provide real-time validation feedback in the UI
 */
export const validationErrors = writable<ValidationErrors>({});

/**
 * Derived store that validates the draft for publishing.
 * Returns an object with validation errors for each field, or an empty object if valid.
 */
export const publishErrors = derived(currentDraft, ($draft) => {
    if (!$draft) {
        return {};
    }

    const errors = validateDraftToPublish(get(currentDraft) as Draft);
    return errors;
});

/**
 * Define whether the project is ready to publish (all steps completed and valid).
 * Used to enable/disable the Publish button in the wizard UI
 */
export const isReadyToPublish = derived([publishErrors, currentDraft], ([$errors, $draft]) => {
    if (!$draft) return false;

    return Object.keys($errors).length === 0;
});

/**
 * Derived store that indicates if the form is valid.
 * Returns true only when:
 * 1. All required fields have values
 * 2. There are no validation errors
 */
export const isCreateFormValid = derived([currentDraft, validationErrors], ([$draft, $errors]) => {
    if (Object.keys($errors).length > 0) {
        return false;
    }

    const hasTitle = ($draft?.createProject?.title?.trim().length ?? 0) > 0;

    const hasSubtitle = ($draft?.createProject?.subtitle?.trim().length ?? 0) > 0;

    const hasCategories = ($draft?.createProject?.categories?.length ?? 0) > 0;

    return hasTitle && hasSubtitle && hasCategories;
});

export function createDraftId(): string {
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
            db.drafts.where("userId").equals(userId).reverse().sortBy("updatedAt"),
        ).subscribe({
            next: set,
            error: console.error,
        });

        return () => subscription.unsubscribe();
    });
}

export async function createDraft(
    project?: ProjectProjectCreationDto,
    draftId = createDraftId(),
    isDirty = true,
    resources?: ProjectDraftResources,
) {
    const userId = getUserId();

    const draft: Draft = {
        draftId,
        userId,
        isDirty,
        apiSnapshot: resources,
        createProject: project ?? ({} as Partial<CreateProjectForm> as CreateProjectForm),
        wizardForm: {
            currentStep: 1,
            configuration: {
                projectDeadline: "minimum",
            },
            campaignInfo: {
                images: resources?.images ?? [],
                video: "",
                objectives: "",
                legacy: "",
                targetAudience: "",
                team: "",
            },
            rewards: resources?.rewards ?? [],
            collaborations: resources?.collaborations ?? [],
            budgetItems: resources?.budgetItems ?? {
                minimum: [],
                optimum: [],
            },
        },
        updatedAt: new Date(),
    };

    draft.createProject.categories = Object.values(project?.categories || []);

    await draftRepo.create(draft);
    currentDraft.set(draft);

    return draftId;
}

export async function loadDraft(draftId: string) {
    const draft = await draftRepo.get(draftId);

    if (!draft) return false;

    currentDraft.set(draft);
    hasUnsavedChanges.set(draft.isDirty ?? true);
    return true;
}

export async function initializeProjectDraft(
    project: ProjectProjectCreationDto,
    draftId: string,
    resources?: ProjectDraftResources,
) {
    const loadedDraft = await draftRepo.get(draftId);

    if (loadedDraft) {
        const isDirty = loadedDraft.isDirty ?? true;
        const nextDraft: Draft = {
            ...loadedDraft,
            apiSnapshot: resources ?? loadedDraft.apiSnapshot,
            createProject: isDirty ? loadedDraft.createProject : project,
            wizardForm:
                !isDirty && resources
                    ? {
                          ...loadedDraft.wizardForm,
                          rewards: resources.rewards,
                          collaborations: resources.collaborations,
                          budgetItems: resources.budgetItems,
                      }
                    : loadedDraft.wizardForm,
            updatedAt: new Date(),
        };

        currentDraft.set(nextDraft);
        hasUnsavedChanges.set(isDirty);

        return true;
    }

    await createDraft(project, draftId, false, resources);
    hasUnsavedChanges.set(false);
    return false;
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

    isSavingDraft.set(true);
    saveTimer = setTimeout(() => {
        const draft = get(currentDraft);
        if (!draft) return;

        try {
            const updatedDraft = {
                ...draft,
                updatedAt: new Date(),
            };

            currentDraft.set(updatedDraft);

            draftRepo.update(draft.draftId, draft.userId, updatedDraft);

            isSavingDraft.set(false);
            persistenceError.set(null);
        } catch (error) {
            console.error("Failed to persist draft:", error);

            // Handle QuotaExceededError specifically
            if (error instanceof DOMException && error.name === "QuotaExceededError") {
                persistenceError.set("storage_quota_exceeded");
            } else {
                persistenceError.set("storage_general_error");
            }

            // Keep isSavingDraft as true when persistence fails
            isSavingDraft.set(true);
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
export function updateWizard(data: Partial<Wizard>, options: { markUnsaved?: boolean } = {}) {
    const markUnsaved = options.markUnsaved ?? true;

    currentDraft.update((draft) => {
        if (!draft) return draft;

        const updated = {
            ...draft,
            isDirty: markUnsaved ? true : draft.isDirty,
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
    if (markUnsaved) {
        hasUnsavedChanges.set(true);
    }
}

export function updateConfiguration(data: Partial<WizardConfiguration>) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        configuration: {
            ...draft.wizardForm.configuration,
            ...data,
        },
    });
}

export function updateCampaignInfo(data: Partial<WizardCampaignInfo>) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        campaignInfo: {
            ...draft.wizardForm.campaignInfo,
            ...data,
        },
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

export function updateReward(index: number, reward: ProjectReward) {
    const errors = validateReward(reward);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return;

    const rewards = [...draft.wizardForm.rewards];

    rewards[index] = {
        ...rewards[index],
        ...reward,
    };

    updateWizard({
        rewards,
    });

    return {};
}

export function deleteReward(index: number) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        rewards: draft.wizardForm.rewards.filter((_, i) => i !== index),
    });
}

export function addCollaboration(collab: ProjectCollaboration): Record<string, string> {
    const errors = validateCollaboration(collab);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    updateWizard({
        collaborations: [...draft.wizardForm.collaborations, { ...collab }],
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

    collaborations[index] = {
        ...collaborations[index],
        ...collab,
    };

    updateWizard({
        collaborations,
    });

    return {};
}

export function deleteCollaboration(index: number) {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        collaborations: draft.wizardForm.collaborations.filter((_, i) => i !== index),
    });
}

export function addBudgetItem(item: ProjectBudgetItem) {
    const errors = validateBudgetItem(item);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    updateWizard({
        budgetItems: {
            ...draft.wizardForm.budgetItems,

            [item.deadline]: [...draft.wizardForm.budgetItems[item.deadline], item],
        },
    });

    return {};
}

export function updateBudgetItem(
    index: number,
    item: ProjectBudgetItem,
    previousDeadline: "minimum" | "optimum" = item.deadline,
) {
    const errors = validateBudgetItem(item);

    if (Object.keys(errors).length > 0) {
        return errors;
    }

    const draft = get(currentDraft);
    if (!draft) return {};

    const budgetItems = { ...draft.wizardForm.budgetItems };
    const previousItems = [...budgetItems[previousDeadline]];
    const existing = previousItems[index];
    const updatedItem = {
        ...existing,
        ...item,
    };

    if (previousDeadline === item.deadline) {
        previousItems[index] = updatedItem;
        budgetItems[item.deadline] = previousItems;
    } else {
        budgetItems[previousDeadline] = previousItems.filter((_, i) => i !== index);
        budgetItems[item.deadline] = [...budgetItems[item.deadline], updatedItem];
    }

    updateWizard({
        budgetItems,
    });

    return {};
}

export function deleteBudgetItem(index: number, deadline: "minimum" | "optimum") {
    const draft = get(currentDraft);
    if (!draft) return;

    updateWizard({
        budgetItems: {
            ...draft.wizardForm.budgetItems,

            [deadline]: draft.wizardForm.budgetItems[deadline].filter((_, i) => i !== index),
        },
    });

    hasUnsavedChanges.set(true);
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
            isDirty: true,
            createProject: {
                ...draft.createProject,
                ...data,
            },
        };

        return updated;
    });

    persistDraft();
    hasUnsavedChanges.set(true);
}

export function markCurrentDraftClean(resources?: ProjectDraftResources) {
    const draft = get(currentDraft);
    if (!draft) return;

    const nextResources = resources ?? {
        rewards: draft.wizardForm.rewards,
        collaborations: draft.wizardForm.collaborations,
        budgetItems: draft.wizardForm.budgetItems,
    };

    const cleanDraft = {
        ...draft,
        isDirty: false,
        apiSnapshot: nextResources,
        wizardForm: {
            ...draft.wizardForm,
            rewards: nextResources.rewards,
            collaborations: nextResources.collaborations,
            budgetItems: nextResources.budgetItems,
        },
        updatedAt: new Date(),
    };

    currentDraft.set(cleanDraft);
    draftRepo.update(cleanDraft.draftId, cleanDraft.userId, cleanDraft);
    hasUnsavedChanges.set(false);
}

export function deleteCurrentDraft(draftId: string, userId: number) {
    const current = get(currentDraft);

    if (current?.draftId === draftId) {
        currentDraft.set(null);
    }

    draftRepo.delete(draftId, userId);
    touchedFields.set(new Set());
    isSavingDraft.set(false);
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
