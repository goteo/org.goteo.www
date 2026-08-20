import { derived, writable, type Readable } from "svelte/store";

import { draftsRepository, type ProjectDraft } from "../../repositories/drafts";

import type { Project } from "../../openapi/client";

export type ProjectDraftState = ProjectDraft & {
    /**
     * Latest Project's shape. From merged Draft's remote actual with local patch
     */
    readonly latest: Project;

    /**
     * If `true` it means there are unsent local changes to remote.
     */
    readonly isDirty: boolean;
};

export interface ProjectDraftStore extends Readable<ProjectDraftState> {
    setDraft(draft: ProjectDraft): void;
    update(update: Partial<ProjectDraft>): void;
    patch(patch: ProjectDraft["patch"]): void;
}

function merge(actual: Project, patch: ProjectDraft["patch"]): Project {
    const { video, ...rest } = patch;

    return {
        ...actual,
        ...rest,
        ...(video ? { video: { src: video } } : {}),
    };
}

/**
 * Store to sync changes in a ProjectDraft.
 *
 * @param draft The client-side living ProjectDraft record, a work-in-progress.
 */
export function createProjectDraftStore(draft: ProjectDraft): ProjectDraftStore {
    const draftState = writable(draft);

    const state = derived(draftState, ($draftState): ProjectDraftState => ({
        ...$draftState,
        latest: merge($draftState.actual, $draftState.patch),
        isDirty: Object.entries($draftState.patch).length > 0,
    }));

    return {
        subscribe: state.subscribe,

        setDraft(draft) {
            draftState.set(draft);
        },

        update(update) {
            draftState.update((draft) => {
                const next = {
                    ...draft,
                    ...update,
                    dateUpdated: new Date().toISOString(),
                };

                void draftsRepository.update(next);

                return next;
            });
        },

        patch(patch) {
            draftState.update((draft) => {
                const next = {
                    ...draft,
                    patch: { ...draft.patch, ...patch },
                    dateUpdated: new Date().toISOString(),
                };

                void draftsRepository.update(next);

                return next;
            });
        },
    };
}
