import { env } from "cloudflare:workers";

export interface BannerRecord {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    startsAt: Date;
    endsAt: Date;
    dateCreated: Date;
}

class BannerRepository {
    db: D1Database;

    constructor(db: D1Database) {
        this.db = db;
    }

    public async getAll(): Promise<BannerRecord[]> {
        const { results } = await this.db
            .prepare(
                `SELECT *
             FROM banners
             ORDER BY created_at DESC`,
            )
            .all<BannerRecord>();

        return results;
    }

    public async create(banner: BannerRecord): Promise<void> {
        await this.db
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
                banner.dateCreated,
            )
            .run();
    }
}

export const bannerRepository = new BannerRepository(env.DB);
