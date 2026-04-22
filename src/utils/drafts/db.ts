import { Dexie, type EntityTable } from 'dexie';

import type { Draft } from '../../stores/drafts/projectDraft';

export const db = new Dexie('goteo-project-drafts') as Dexie & {
    drafts: EntityTable<Draft, 'draftId'>;
};

db.version(2).stores({
    drafts: "draftId, userId, [userId+updatedAt]",
});
