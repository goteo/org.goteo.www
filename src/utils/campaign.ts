/**
 * Campaign duration in days for each funding round choice.
 * Mirrors the server-side calendar computation: the minimum deadline is
 * 40 days after release, the optimum deadline 40 days after the minimum.
 */
export const CAMPAIGN_DURATION_DAYS: Record<"minimum" | "optimum", number> = {
    minimum: 40,
    optimum: 80,
};

/**
 * Parses a YYYY-MM-DD string into a local-midnight Date.
 * Returns undefined for empty or malformed values.
 */
export function parseMaxEndDate(raw: string | undefined): Date | undefined {
    if (!raw || raw === "") return undefined;

    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
    if (!match) {
        console.warn(`Invalid PUBLIC_CAMPAIGN_MAX_END_DATE value: ${raw}`);
        return undefined;
    }

    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/**
 * Latest allowed release date so a campaign with the given round choice
 * ends on or before the cutoff date.
 */
export function computeMaxReleaseDate(
    cutoff: Date,
    deadline: "minimum" | "optimum" = "minimum",
): Date {
    const maxRelease = new Date(cutoff);
    maxRelease.setDate(maxRelease.getDate() - CAMPAIGN_DURATION_DAYS[deadline]);
    return maxRelease;
}

/**
 * Last date a project may be in campaign, as configured by the platform owner.
 * Leave PUBLIC_CAMPAIGN_MAX_END_DATE empty to disable the limit.
 */
export const maxEndDate = parseMaxEndDate(import.meta.env.PUBLIC_CAMPAIGN_MAX_END_DATE);

/**
 * Is a campaign end limit configured?
 */
export const isEnabled = maxEndDate !== undefined;

/**
 * Latest allowed release date for the given round choice,
 * or undefined when no limit is configured.
 */
export function getMaxReleaseDate(deadline: "minimum" | "optimum" = "minimum"): Date | undefined {
    if (!maxEndDate) return undefined;
    return computeMaxReleaseDate(maxEndDate, deadline);
}
