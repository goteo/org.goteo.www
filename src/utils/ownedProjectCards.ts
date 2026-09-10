import type { Project } from "../openapi/client/types.gen.ts";

export type ProjectStatus = NonNullable<Project["status"]>;

/**
 * Owned projects section tabs — each maps to the project statuses shown in it.
 */
export const tabStatusGroups: Record<string, ProjectStatus[]> = {
    draft: ["in_draft", "to_campaign_review"],
    review: [
        "to_campaign",
        "in_campaign_review",
        "in_campaign_review.to_change",
        "in_campaign_review.to_review",
        "campaign_review.rejected",
        "to_funding_review",
        "in_funding_review",
        "in_funding_review.to_change",
        "in_funding_review.to_review",
        "funding_review.rejected",
        "to_funding",
    ],
    active: ["in_campaign", "in_funding"],
    archived: ["campaign.failed", "campaign.cancelled", "funding.paid"],
};

export interface OwnedCardAction {
    key: string;
    kind: "primary" | "secondary" | "ghost";
}

type StatusCards = Record<ProjectStatus, { tagKey?: string; showMoney: boolean; actions: OwnedCardAction[] }>;

/**
 * Per-status card configuration for the "Tus Proyectos" section. Tag and action
 * labels are i18n key paths under `pages.me.ownedProjects`; the component
 * resolves them via `$t`.
 */
export const statusCards: StatusCards = {
    // Active
    in_campaign: { showMoney: true, actions: [{ key: "actions.manage", kind: "primary" }] },
    in_funding: { showMoney: true, actions: [{ key: "actions.manage", kind: "primary" }] },

    // Review
    to_campaign: { tagKey: "tags.readyToPublish", showMoney: false, actions: [{ key: "actions.publish", kind: "primary" }] },
    to_funding: { tagKey: "tags.readyToPublish", showMoney: false, actions: [{ key: "actions.publish", kind: "primary" }] },
    in_campaign_review: { tagKey: "tags.reviewing", showMoney: false, actions: [{ key: "actions.advisory", kind: "primary" }] },
    in_funding_review: { tagKey: "tags.reviewing", showMoney: false, actions: [{ key: "actions.advisory", kind: "primary" }] },
    "in_campaign_review.to_review": { tagKey: "tags.pendingReview", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }, { key: "actions.advisory", kind: "primary" }] },
    "in_funding_review.to_review": { tagKey: "tags.pendingReview", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }, { key: "actions.advisory", kind: "primary" }] },
    "in_campaign_review.to_change": { tagKey: "tags.needsChanges", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }, { key: "actions.advisory", kind: "primary" }] },
    "in_funding_review.to_change": { tagKey: "tags.needsChanges", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }, { key: "actions.advisory", kind: "primary" }] },
    "campaign_review.rejected": { tagKey: "tags.rejected", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }] },
    "funding_review.rejected": { tagKey: "tags.rejected", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }] },
    "to_funding_review": { tagKey: "tags.pendingReview", showMoney: false, actions: [{ key: "actions.edit", kind: "secondary" }, { key: "actions.advisory", kind: "primary" }] },

    // Draft
    in_draft: { tagKey: "tags.draft", showMoney: false, actions: [{ key: "actions.edit", kind: "primary" }] },
    to_campaign_review: { tagKey: "tags.pendingReview", showMoney: false, actions: [{ key: "actions.edit", kind: "primary" }] },

    // Archived
    "campaign.failed": { tagKey: "tags.campaignFailed", showMoney: false, actions: [{ key: "actions.view", kind: "primary" }] },
    "campaign.cancelled": { tagKey: "tags.campaignCancelled", showMoney: false, actions: [{ key: "actions.view", kind: "primary" }] },
    "funding.paid": { tagKey: "tags.fundingPaid", showMoney: false, actions: [{ key: "actions.view", kind: "primary" }] },
};

export function statusCardConfig(status: ProjectStatus | undefined) {
    if (!status) return undefined;
    return statusCards[status];
}