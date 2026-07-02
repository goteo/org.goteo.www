/**
 * Public project states for the public search page.
 *
 * A project has many internal `status` values across its lifecycle. Only three
 * grouped "states" are exposed to public search. The UI multiselect works with
 * these states; the API receives the expanded `status[]` list.
 */
export type PublicProjectState = "in_campaign" | "funded" | "archived";

/**
 * Maps each public state (UI selection) to the real project `status` values it
 * covers. "funded" is the literal set of all post-campaign statuses that are not
 * archived.
 */
export const PUBLIC_STATE_TO_STATUSES: Record<PublicProjectState, string[]> = {
    in_campaign: ["in_campaign"],
    funded: [
        "to_funding_review",
        "in_funding_review",
        "in_funding_review.request_change",
        "funding_review.rejected",
        "to_funding",
        "in_funding",
        "funding.paid",
    ],
    archived: ["campaign.failed"],
};

export const ALL_PUBLIC_STATES: PublicProjectState[] = ["in_campaign", "funded", "archived"];

/**
 * Expands UI states into the `status[]` sent to the API. An empty selection
 * falls back to the union of all public states — public search must never query
 * a non-public status.
 */
export function expandStatesToStatuses(states: PublicProjectState[]): string[] {
    const src = states.length ? states : ALL_PUBLIC_STATES;
    return src.flatMap((state) => PUBLIC_STATE_TO_STATUSES[state]);
}

/**
 * Reads valid public states from URL params (`state[]`). Any injected value that
 * is not a public state is discarded; an empty result falls back to all states.
 */
export function parseStatesFromParams(params: URLSearchParams): PublicProjectState[] {
    const valid = params
        .getAll("state[]")
        .filter((state): state is PublicProjectState =>
            (ALL_PUBLIC_STATES as string[]).includes(state),
        );
    return valid.length ? valid : ALL_PUBLIC_STATES;
}
