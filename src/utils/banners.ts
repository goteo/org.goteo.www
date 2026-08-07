export interface BannerRecord {
    title: string;
    description: string;
    cta_text: string;
    cta_link: string;
    starts_at: number;
    ends_at: number;
}

/** Converts a "YYYY-MM-DD" date input value into a unix timestamp (UTC midnight). */
export function toEpoch(date: string): number {
    const parsed = Date.parse(`${date}T00:00:00Z`);
    if (isNaN(parsed)) {
        throw new Error(`Invalid date: ${date}`);
    }
    return Math.floor(parsed / 1000);
}

export async function listBanners(db: D1Database): Promise<BannerRecord[]> {
    const { results } = await db
        .prepare(
            `SELECT title, description, cta_text, cta_link, starts_at, ends_at
             FROM banners
             ORDER BY created_at DESC`,
        )
        .all<BannerRecord>();

    return results;
}

export async function createBanner(
    db: D1Database,
    banner: {
        title: string;
        description: string;
        ctaText: string;
        ctaLink: string;
        startsAt: number;
        endsAt: number;
    },
): Promise<void> {
    await db
        .prepare(
            `INSERT INTO banners (title, description, cta_text, cta_link, starts_at, ends_at)
             VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(
            banner.title,
            banner.description,
            banner.ctaText,
            banner.ctaLink,
            banner.startsAt,
            banner.endsAt,
        )
        .run();
}
