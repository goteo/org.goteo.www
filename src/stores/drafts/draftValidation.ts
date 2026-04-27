import { derived, get, writable } from "svelte/store";
import type { Draft, Wizard } from "./projectDraft";
import { cyrb53 } from "../../utils/hash";

export type ValidationErrors = Record<string, string>;

export const validationErrors = writable<ValidationErrors>({});
export const isDraftValid = derived(validationErrors, ($errors) => {
    return Object.keys($errors).length === 0;
});

export function validateDraft(draft: Draft): ValidationErrors {
    return {
        ...validateConfiguration(draft.wizardForm),
        ...validateCampaignInfo(draft.wizardForm),
        ...validateRewards(draft.wizardForm),
        ...validateCollaborations(draft.wizardForm),
        ...validateBudget(draft.wizardForm),
    };
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

export function stripHtml(html: string): string {
    if (typeof document === "undefined") {
        return html.replace(/<[^>]*>/g, "").trim();
    }
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
}

export function validateConfiguration(wizard: Wizard): ValidationErrors {
    const errors: ValidationErrors = {};

    if (!wizard.configuration.projectDeadline) {
        errors.projectDeadline = "validation.projectDeadline.required";
    }

    return errors;
}

export function validateCampaignInfo(wizard: Wizard): ValidationErrors {
    const data = wizard.campaignInfo;
    const errors: ValidationErrors = {};

    if (data.images.length === 0 && !data.video) {
        errors.media = "validation.media.required";
    }

    const objectives = stripHtml(data.objectives);
    if (!objectives) {
        errors.objectives = "validation.objectives.required";
    } else if (objectives.length < 50) {
        errors.objectives = "validation.objectives.min";
    }

    const legacy = stripHtml(data.legacy);
    if (!legacy) {
        errors.legacy = "validation.legacy.required";
    }

    const target = stripHtml(data.targetAudience);
    if (!target) {
        errors.targetAudience = "validation.target.required";
    }

    const team = stripHtml(data.team);
    if (!team) {
        errors.team = "validation.team.required";
    }

    return errors;
}

export function validateRewards(wizard: Wizard): ValidationErrors {
    const errors: ValidationErrors = {};

    wizard.rewards.forEach((reward) => {
        const hash = cyrb53(JSON.stringify(reward));

        if (!reward.title?.trim()) {
            errors[`reward_title_${hash}`] = "validation.reward.title";
        }

        if (!reward.money?.amount || reward.money.amount <= 0) {
            errors[`reward_amount_${hash}`] = "validation.reward.amount";
        }

        if (reward.isFinite && (!reward.unitsTotal || reward.unitsTotal <= 0)) {
            errors[`reward_units_${hash}`] = "validation.reward.units";
        }
    });

    return errors;
}

export function validateCollaborations(wizard: Wizard): ValidationErrors {
    const errors: ValidationErrors = {};

    wizard.collaborations.forEach((c) => {
        const hash = cyrb53(JSON.stringify(c));

        if (!c.title?.trim()) {
            errors[`collab_title_${hash}`] = "validation.collab.title";
        }

        if (!c.description?.trim()) {
            errors[`collab_desc_${hash}`] = "validation.collab.description";
        }
    });

    return errors;
}

export function validateBudget(wizard: Wizard): ValidationErrors {
    const errors: ValidationErrors = {};

    wizard.budgetItems.minimum.forEach((item) => {
        const hash = cyrb53(JSON.stringify(item));

        if (!item.title?.trim()) {
            errors[`budget_title_${hash}`] = "validation.budget.title";
        }

        if (!item.money?.amount || item.money.amount <= 0) {
            errors[`budget_amount_${hash}`] = "validation.budget.amount";
        }
    });

    return errors;
}
