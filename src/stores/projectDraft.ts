import { writable } from "svelte/store";

import type { Project, ProjectBudgetItem, ProjectCollaboration, ProjectReward } from "../openapi/client";

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

    // Validation tracking
    touched: Set<string>;
    errors: Record<string, string>;
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

export interface Draft extends Project {
    draftId: string;
    createProject: Project;
    wizardForm: Wizard;
}

export const drafts = writable<Project[]>();

const STORAGE_PREFIX = "project";

export function buildStorageKey(hash: string) {
    return `${STORAGE_PREFIX}:${hash}`;
}
