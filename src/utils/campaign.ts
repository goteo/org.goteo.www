/**
 * Parses a recurring DD-MM string into the next upcoming local-midnight Date.
 * The year is implicit: the cutoff recurs every year, so the value resolves to
 * the next occurrence of that day/month on or after today.
 * Returns undefined for empty or malformed values.
 */
export function parseMaxEndDate(raw: string | undefined, now: Date = new Date()): Date | undefined {
    if (!raw || raw === "") return undefined;

    const match = /^(\d{2})-(\d{2})$/.exec(raw);
    if (!match) {
        console.warn(`Invalid PUBLIC_CAMPAIGN_MAX_END_DATE value (expected DD-MM): ${raw}`);
        return undefined;
    }

    const day = Number(match[1]);
    const month = Number(match[2]);

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const cutoff = new Date(today.getFullYear(), month - 1, day);

    // Already passed this year → use next year's occurrence
    if (cutoff < today) {
        cutoff.setFullYear(cutoff.getFullYear() + 1);
    }

    return cutoff;
}

/**
 * Latest date a project may start its campaign, as configured by the platform
 * owner. PUBLIC_CAMPAIGN_MAX_END_DATE is a recurring DD-MM value (year implicit);
 * it resolves to the next upcoming occurrence. Leave empty to disable the limit.
 */
export const maxEndDate = parseMaxEndDate(import.meta.env.PUBLIC_CAMPAIGN_MAX_END_DATE);
