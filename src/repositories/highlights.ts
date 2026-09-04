import { env } from "cloudflare:workers";

export interface HighlightRecord {
    id: number;
    type: string;
    layout: string;
    dateCreated: Date;
    dateUpdated: Date;
}

export interface HighlightSlotRecord {
    id: number;
    highlightId: number;
    position: number;
    projectSlug: string;
}

class HighlightRepository {
    db: D1Database;

    constructor(db: D1Database) {
        this.db = db;
    }

    public async get(): Promise<{ highlight: HighlightRecord | null; slots: HighlightSlotRecord[] }> {
        const highlight = await this.db
            .prepare(
                `SELECT
                    id,
                    type,
                    layout,
                    date_created AS dateCreated,
                    date_updated AS dateUpdated
                 FROM highlights
                 WHERE id = 1`,
            )
            .first<HighlightRecord>()
            .then((r) =>
                r
                    ? {
                          ...r,
                          dateCreated: new Date(r.dateCreated),
                          dateUpdated: new Date(r.dateUpdated),
                      }
                    : null,
            );

        if (!highlight) {
            return { highlight: null, slots: [] };
        }

        const slots = await this.db
            .prepare(
                `SELECT
                    id,
                    highlight_id AS highlightId,
                    position,
                    project_slug AS projectSlug
                 FROM highlight_slots
                 WHERE highlight_id = ?
                 ORDER BY position ASC`,
            )
            .bind(highlight.id)
            .all<HighlightSlotRecord>()
            .then((data) => data.results);

        return { highlight, slots };
    }

    public async save(type: string, layout: string, projectSlugs: string[]): Promise<void> {
        const now = Date.now();

        await this.db
            .prepare(
                `INSERT INTO highlights (id, type, layout, date_created, date_updated)
                 VALUES (1, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                    type = excluded.type,
                    layout = excluded.layout,
                    date_updated = excluded.date_updated`,
            )
            .bind(type, layout, now, now)
            .run();

        await this.db.prepare(`DELETE FROM highlight_slots WHERE highlight_id = 1`).run();

        if (projectSlugs.length > 0) {
            const stmt = this.db.prepare(
                `INSERT INTO highlight_slots (highlight_id, position, project_slug)
                 VALUES (1, ?, ?)`,
            );

            const batch = projectSlugs.map((slug, index) => stmt.bind(index, slug));
            await this.db.batch(batch);
        }
    }

    public async delete(): Promise<void> {
        await this.db.prepare(`DELETE FROM highlights WHERE id = 1`).run();
    }
}

export const highlightRepository = new HighlightRepository(env.DB);
