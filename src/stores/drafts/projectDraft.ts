import { writable, readable, get, derived } from "svelte/store";

import type { Project, ProjectBudgetItem, ProjectCollaboration, ProjectReward } from "../../openapi/client";
import { liveQuery } from "dexie";
import { db } from "../../utils/drafts/db";
import { draftRepo } from "../../utils/drafts/repository";
import { validateDraft, validationErrors } from "./draftValidation";
import { session } from "../../auth/store";

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

    createProject: Project;
    wizardForm: Wizard;

    updatedAt: number;
}

export const drafts = writable<Draft[]>([]);

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

export function createDraftsStore(userId: number) {
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

export async function createDraft(project?: Project) {
    const draftId = createDraftId();
    const userId = getUserId();

    const draft: Draft = {
        draftId,
        userId,
        createProject: project ?? ({} as Partial<Project> as Project),
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

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Draft Autosave
 *
 * Autosaves the current draft into the draft indexedDB repository
 */
function persistDraft() {
    if (saveTimer) clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {
        const draft = get(currentDraft);
        if (!draft) return;

        const errors = validateDraft(draft);

        validationErrors.set(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        await draftRepo.update(draft.draftId, draft.userId, draft);
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
 * Merges new project updates with already existing project data.
 *
 * @param data - Partial object with Project API Type data that has been modified
 */
export function updateProject(data: Partial<Project>) {
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
