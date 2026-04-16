import { Dexie, type EntityTable } from 'dexie';

import type { Draft } from '../stores/projectDraft';

export const db = new Dexie('sveltelivequery') as Dexie & {
    drafts: EntityTable<Draft, 'draftId'>;
};

db.version(1).stores({
    drafts: "++draftId, createProject, wizardForm",
});
