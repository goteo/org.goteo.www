import { derived, get, writable } from "svelte/store";
import z from "zod";

import { currentDraft, type Draft, type Wizard } from "./projectDraft";
import { projectCreationSchema } from "../../pages/[...locale]/create/validation";

import type { ProjectBudgetItem, ProjectCollaboration, ProjectReward } from "../../openapi/client";
import murmur from "murmurhash-js";

export type ValidationErrors = Record<string, string>;

export const validationErrors = writable<ValidationErrors>({});
export const isDraftValid = derived(validationErrors, ($errors) => {
    return Object.keys($errors).length === 0;
});

/**
 * Validates the entire create project form and updates the validation errors store.
 * Returns true if the form is valid, false otherwise.
 */
export function validateCreateForm(): boolean {
    const result = projectCreationSchema.safeParse(get(currentDraft));

    if (!result.success) {
        const errors: ValidationErrors = {};
        result.error.issues.forEach((issue) => {
            const fieldName = issue.path[0] as string;
            if (!errors[fieldName]) {
                errors[fieldName] = issue.message;
            }
        });
        validationErrors.set(errors);
        return false;
    } else {
        validationErrors.set({});
        return true;
    }
}

export function validateDraftPublish(draft: Draft): ValidationErrors {
    const wizard = draft.wizardForm;

    return {
        ...validateConfiguration(wizard),
        ...validateCampaignInfo(wizard),
    };
}

export function stripHtml(html: string): string {
    if (typeof document === "undefined") {
        return html.replace(/<[^>]*>/g, "").trim();
    }
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

/**
 * Validation schema for Configuration step
 */
export const configurationSchema = z.object({
    projectDeadline: z.union([z.literal(1), z.literal(2)]),
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
export function validateConfiguration(wizard: Wizard): boolean {
    const result = configurationSchema.safeParse(wizard.configuration);

    if (!result.success) {
        const errors: ValidationErrors = {};
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
export function validateCampaignInfo(wizard: Wizard): ValidationErrors {
    const data = wizard.campaignInfo;
    const errors: ValidationErrors = {};

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

export function validateReward(reward: ProjectReward): ValidationErrors {
    const errors: ValidationErrors = {};
    const hash = murmur(JSON.stringify(reward));

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

export function validateCollaboration(collab: ProjectCollaboration): ValidationErrors {
    const errors: ValidationErrors = {};
    const hash = murmur(JSON.stringify(collab));

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

export function validateBudgetItem(item: ProjectBudgetItem): ValidationErrors {
    const errors: ValidationErrors = {};
    const hash = murmur(JSON.stringify(item));

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

export function validateBudgetAmount(draft: Draft) {
    const budgetItems = draft.wizardForm.budgetItems;
    const budget = draft.createProject.budget;
    const errors: ValidationErrors = {};

    if (budgetItems.minimum.length <= 0) {
        errors.minimum_length = "pages.project.edit.budget.validation.minimumItemsLength";
    }

    let minimumItemsTotalAmount: number = 0;

    for (let i = 0; i < budgetItems.minimum.length - 1; i++) {
        minimumItemsTotalAmount += budgetItems.minimum[i].money.amount;
    }

    if (minimumItemsTotalAmount !== budget?.minimum?.money?.amount) {
        errors.minimum_length = "pages.project.edit.budget.validation.amountMinimum";
    }

    return errors;
}

export function validateField(field: string, draft: Draft) {
    const errors = get(validationErrors);

    switch (field) {
        case "objectives":
            if (draft.wizardForm.campaignInfo.objectives.length < 50) {
                errors.objectives = "min_length";
            } else {
                delete errors.objectives;
            }
            break;
    }

    validationErrors.set({ ...errors });
}
