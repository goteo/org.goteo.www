import type { Project } from "../openapi/client";
import { Dexie, type EntityTable } from "dexie";
import { client } from "../openapi/client/client.gen";
import { apiUsersIdOrHandleGetUrl } from "../openapi/client/paths.gen";

export interface ProjectDraft extends Project {
    key: string;
}

export function generateDraftKey(project?: Project): string {
    return project?.id
        ? `project_${project.id}`
        : `draft_${crypto.randomUUID()}`;
}

type ProjectDraftDatabase = Dexie & {
    drafts: EntityTable<ProjectDraft, "key">;
};

let db: ProjectDraftDatabase | undefined;

function getDb(): ProjectDraftDatabase {
    if (typeof indexedDB === "undefined") {
        throw new Error("IndexedDB is only available in the browser");
    }

    if (!db) {
        db = new Dexie("project-drafts") as ProjectDraftDatabase;
        db.version(1).stores({
            drafts: "key",
        });
    }

    return db;
}

export class ProjectDraftRepository {
    public async create(draft: ProjectDraft) {
        await getDb().drafts.put(draft);

        return draft;
    }

    public async getAllByOwner(userIdOrHandle: string | number) {
        const owner = client.buildUrl({
            url: apiUsersIdOrHandleGetUrl,
            path: {
                idOrHandle: String(userIdOrHandle),
            },
        });

        return getDb()
            .drafts
            .where({ owner })
            .reverse()
            .sortBy("dateUpdated");
    }

    public async get(key: string) {
        return getDb().drafts.get(key);
    }

    public async getOrCreateForProject(project: Project) {
        const plainProject = structuredClone(project);
        const key = generateDraftKey(plainProject);

        const existing = await this.get(key);

        if (existing) {
            return existing;
        }

        const draft = {
            key,
            ...plainProject,
        };

        await this.create(draft);

        return draft;
    }

    public async update(draft: Partial<ProjectDraft>) {
        if (!draft.key) return;

        const existing = await getDb().drafts.get(draft.key);

        if (!existing) return;

        await getDb().drafts.put({
            ...existing,
            ...draft,
            dateUpdated: new Date().toISOString(),
        });
    }

    public async delete(draft: ProjectDraft) {
        await getDb().drafts.delete(draft.key);
    }
}

export const draftsRepository = new ProjectDraftRepository();