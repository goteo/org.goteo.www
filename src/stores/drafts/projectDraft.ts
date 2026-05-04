import { liveQuery } from "dexie";
import { writable, readable, get, derived } from "svelte/store";

import { session } from "../../auth/store";
import { db } from "../../utils/drafts/db";
import { draftRepo } from "../../utils/drafts/repository";

import type { Budget, ProjectBudgetItem, ProjectCollaboration, ProjectProjectCreationDto, ProjectReward } from "../../openapi/client";

export interface WizardConfiguration {
    projectDeadline: "minimum" | "optimum"; // Default: minimum
}

export interface WizardCampaignInfo {
    // Media
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

export const drafts = readable(createDraftStore(getUserId()));

export const currentDraft = writable<Draft | null>(null);

export const wizard = derived(currentDraft, ($d) => $d?.wizardForm);
export const project = derived(currentDraft, ($d) => $d?.createProject);

export const touchedFields = writable<Set<string>>(new Set());

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

export function createDraftStore(userId: number) {
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

function persistDraft() {
    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {
        const draft = get(currentDraft);
        if (!draft) return;

        try {
            await draftRepo.update(draft.draftId, draft.userId, {
                ...draft,
                updatedAt: Date.now(),
            });
        } catch (error) {
            console.error("Failed to persist draft:", error);
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
            },
        };

        return updated;
    });

    persistDraft();
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

export async function deleteDraft(draftId: string, userId: number) {
    await draftRepo.delete(draftId, userId);

    const current = get(currentDraft);
    if (current?.draftId === draftId) {
        currentDraft.set(null);
    }
}
