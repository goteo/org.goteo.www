import { derived, writable, type Readable } from "svelte/store";
import type { ProjectDraft } from "../../repositories/drafts";
import type { Project } from "../../openapi/client";

export type ProjectDraftState = ProjectDraft & {
    readonly isDirty: boolean;
};

export interface ProjectDraftStore extends Readable<ProjectDraftState | null> {
    setDraft(draft: ProjectDraft): void;
    setActual(actual?: Project): void;
    update(update: Partial<ProjectDraft>): void;
}

function haveDrifted(draft: ProjectDraft, actual?: Project): boolean {
    if (!actual) return false;

    return draft.dateUpdated !== actual.dateUpdated;
}

export function createProjectDraftStore(draft?: ProjectDraft, actual?: Project): ProjectDraftStore {
    const wip = writable<ProjectDraft | undefined>(draft);
    const final = writable<Project | undefined>(actual);

    const state = derived(
        [wip, final],
        ([$wip, $final]): ProjectDraftState | null => {
            if (!$wip) return null;

            return {
                ...$wip,
                isDirty: haveDrifted($wip, $final),
            };
        },
    );

    return {
        subscribe: state.subscribe,

        setDraft(draft) {
            wip.set(draft);
        },

        setActual(actual) {
            final.set(actual);
        },

        update(update) {
            wip.update((draft) =>
                draft
                    ? {
                        ...draft,
                        ...update,
                    }
                    : undefined,
            );
        },
    };
}

export const draftStore = createProjectDraftStore();