import { Dexie, type EntityTable } from "dexie";

import { client } from "../openapi/client/client.gen";
import { apiUsersIdOrHandleGetUrl } from "../openapi/client/operation-paths.gen";

import type { ApiProjectsIdPatchData, Project, User } from "../openapi/client";

/**
 * A ProjectDraft is a client-side record that stores the work-in-progress during a Project's edition.
 */
export interface ProjectDraft {
    /**
     * Client-side identifier, might not be related to remote Project.
     */
    key: string;

    /**
     * Client-side editing User IRI, might not be related to remote Project owner.
     */
    actor: string;

    /**
     * The remote Project resource.
     */
    project: Project;

    /**
     * The current change-set in the draft.
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

function generateKey(owner: User, project?: Project): string {
    const pieces = {
        owner: owner.id,
        project: project?.id,
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

        return getDb().drafts.where({ actor: buildUserIri(userIdOrHandle) }).reverse().sortBy("dateUpdated");
    }

    public async get(key: string) {
        return getDb().drafts.get(key);
    }

    public async getOrCreateFor(user: User, project: Project) {
        const plainProject = structuredClone(project);
        const key = generateKey(user, plainProject);

        const existing = await this.get(key);
        if (existing) return existing;

        return await this.create({
            key,
            actor: buildUserIri(user),
            project: plainProject,
            patch: {},
            dateCreated: (new Date()).toISOString(),
            dateUpdated: (new Date()).toISOString(),
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
