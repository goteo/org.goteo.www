import { Dexie, type EntityTable } from "dexie";

import { client } from "../openapi/client/client.gen";
import { apiUsersIdOrHandleGetUrl } from "../openapi/client/operation-paths.gen";

import type { ApiProjectsIdPatchData, Project, User } from "../openapi/client";

/**
 * A ProjectDraft is a client-side record that stores the work-in-progress during a Project's edition.
 */
export interface ProjectDraft {
    /**
     * Local identifier.
     */
    key: string;

    /**
     * IRI of the user operating this Draft locally.
     */
    actor: string;

    /**
     * Remote, actual Project resource.
     */
    actual: Project;

    /**
     * Local, current change-set in the Draft not sent to remote.
     */
    patch: ApiProjectsIdPatchData["body"];

    /**
     * ISO format datetime string for Draft's creation.
     */
    dateCreated: string;

    /**
     * ISO format datetime string for Draft's last update.
     */
    dateUpdated: string;
}

function generateKey(actor: User, actual?: Project): string {
    const pieces = {
        user: actor.id,
        project: actual?.id,
    };

    return Object.entries(pieces)
        .filter(([, val]) => val)
        .map(([part, val]) => `${part}:${val}`)
        .join(";");
}

function buildUserIri(user: User | string | number) {
    const id: string = typeof user === "object" ? String(user.id) : String(user);

    return client.buildUrl({
        url: apiUsersIdOrHandleGetUrl,
        path: { idOrHandle: String(id) },
    });
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

    public async getAllByActor(userIdOrHandle: string | number) {
        return getDb()
            .drafts.where({ actor: buildUserIri(userIdOrHandle) })
            .reverse()
            .sortBy("dateUpdated");
    }

    public async get(key: string) {
        return getDb().drafts.get(key);
    }

    public async getOrCreateFor(actor: User, actual: Project) {
        const plainProject = structuredClone(actual);
        const key = generateKey(actor, plainProject);

        const existing = await this.get(key);
        if (existing) {
            // Remote project might have changed, so we overwrite to avoid drift
            const current: ProjectDraft = { ...existing, actual: plainProject };
            this.update(current);

            return current;
        }

        return await this.create({
            key,
            actor: buildUserIri(actor),
            actual: plainProject,
            patch: {},
            dateCreated: new Date().toISOString(),
            dateUpdated: new Date().toISOString(),
        });
    }

    public async update(draft: Partial<ProjectDraft>) {
        if (!draft.key) return;

        const existing = await getDb().drafts.get(draft.key);
        if (!existing) return;

        await getDb().drafts.put({
            ...existing,
            ...draft,
        });
    }

    public async delete(draft: ProjectDraft) {
        await getDb().drafts.delete(draft.key);
    }
}

export const draftsRepository = new ProjectDraftRepository();
