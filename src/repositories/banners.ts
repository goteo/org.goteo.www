import { env } from "cloudflare:workers";

export interface BannerRecord {
    id: number;
    title: string;
    content: string;
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
        return await this.db
            .prepare(
                `SELECT
                    id,
                    title,
                    content,
                    cta_text AS ctaText,
                    cta_link AS ctaLink,
                    starts_at AS startsAt,
                    ends_at AS endsAt,
                    date_created AS dateCreated
             FROM banners
             ORDER BY date_created DESC`,
            )
            .all<BannerRecord>()
            .then((data) =>
                data.results.map((r) => ({
                    ...r,
                    startsAt: new Date(r.startsAt),
                    endsAt: new Date(r.endsAt),
                    dateCreated: new Date(r.dateCreated),
                })),
            );
    }

    public async create(banner: Omit<BannerRecord, "id">): Promise<void> {
        await this.db
            .prepare(
                `INSERT INTO banners (title, content, cta_text, cta_link, starts_at, ends_at, date_created)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            )
            .bind(
                banner.title,
                banner.content,
                banner.ctaText,
                banner.ctaLink,
                banner.startsAt.getTime(),
                banner.endsAt.getTime(),
                banner.dateCreated.getTime(),
            )
            .run();
    }

    public async delete(id: number): Promise<void> {
        await this.db.prepare(`DELETE FROM banners WHERE id = ?`).bind(id).run();
    }
}

export const bannerRepository = new BannerRepository(env.DB);
