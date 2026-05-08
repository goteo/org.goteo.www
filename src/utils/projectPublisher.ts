import {
    createReward,
    createCollaboration,
    createBudgetItem,
    patchProject,
} from "./projectSubmissionApi";

import type { Session } from "../auth/types";
import type { Draft } from "../stores/drafts/projectDraft";
import { validateDraftToPublish } from "../stores/drafts/draftValidation";

export class PublishValidationError extends Error {
    constructor(
        public errors: Record<string, string>,
    ) {
        super("Draft validation failed");
    }
}

export async function publishDraft(
    draft: Draft,
    session: Session,
    projectId: string,
) {
    const validationErrors = validateDraftToPublish(draft);

    if (Object.keys(validationErrors).length > 0) {
        throw new PublishValidationError(validationErrors);
    }

    const wizard = draft.wizardForm;

    await Promise.all([
        ...wizard.rewards.map((reward) =>
            createReward(reward, session),
        ),

        ...wizard.collaborations.map((collab) =>
            createCollaboration(collab, session),
        ),

        ...wizard.budgetItems.minimum.map((item) =>
            createBudgetItem(item, session),
        ),

        ...wizard.budgetItems.optimum.map((item) =>
            createBudgetItem(item, session),
        ),
    ]);

    const description = [
        wizard.campaignInfo.objectives,
        wizard.campaignInfo.legacy,
        wizard.campaignInfo.targetAudience,
        wizard.campaignInfo.team,
    ]
        .filter(Boolean)
        .join("\n\n");

    const result = await patchProject(
        projectId,
        {
            title: draft.createProject.title,
            subtitle: draft.createProject.subtitle,
            video: wizard.campaignInfo.video,
            description,
            deadline: wizard.configuration.projectDeadline,
        },
        session,
    );

    if (result.error) {
        throw result.error;
    }

    return result.data;
}
