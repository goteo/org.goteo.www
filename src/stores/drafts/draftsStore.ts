import { derived, writable, type Readable } from "svelte/store";

import { draftsRepository, type ProjectDraft } from "../../repositories/drafts";

import type { Project } from "../../openapi/client";

function haveDrifted(draft: ProjectDraft, actual?: Project): boolean {
    if (!actual) return false;

    return draft.dateUpdated !== actual.dateUpdated;
}

export type ProjectDraftState = ProjectDraft & {
    readonly isDirty: boolean;
};

export interface ProjectDraftStore extends Readable<ProjectDraftState> {
    setDraft(draft: ProjectDraft): void;
    setActual(actual?: Project): void;
    update(update: Partial<ProjectDraft>): void;
}

/**
 * Store to sync changes in a ProjectDraft.
 *
 * @param draft The client-side living ProjectDraft record, a work-in-progress.
 * @param actual The Project as it is in the API.
 */
export function createProjectDraftStore(draft: ProjectDraft, actual?: Project): ProjectDraftStore {
    const draftState = writable(draft);
    const actualState = writable<Project | undefined>(actual);

    const state = derived(
        [draftState, actualState],
        ([$draftState, $actualState]): ProjectDraftState => ({
            ...$draftState,
            isDirty: haveDrifted($draftState, $actualState),
        }),
    );

    return {
        subscribe: state.subscribe,

        setDraft(draft) {
            draftState.set(draft);
        },

        setActual(actual) {
            actualState.set(actual);
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
    };
}
