import Dexie from "dexie";

import { db } from "./db";
import { toRichText } from "../richText";

import type { Draft } from "../../stores/drafts/projectDraft";

/**
 * Drafts saved before rich text moved to Tiptap JSON hold HTML strings. Convert them on read so
 * the rest of the app only ever sees JSON. No-op once the draft has been saved again.
 */
function normalizeRichText(draft: Draft): Draft {
    const { campaignInfo } = draft.wizardForm;

    return {
        ...draft,
        wizardForm: {
            ...draft.wizardForm,
            campaignInfo: {
                ...campaignInfo,
                objectives: toRichText(campaignInfo.objectives),
                legacy: toRichText(campaignInfo.legacy),
                targetAudience: toRichText(campaignInfo.targetAudience),
                team: toRichText(campaignInfo.team),
            },
        },
    };
}

export const draftRepo = {
    async create(draft: Draft) {
        await db.drafts.put(draft);
        return draft;
    },

    async update(draftId: string, userId: number, data: Partial<Draft>) {
        const existing = await db.drafts.get(draftId);

        if (!existing || existing.userId !== userId) return;

        await db.drafts.put({
            ...existing,
            ...data,
            updatedAt: new Date(),
        });
    },

    async get(draftId: string) {
        const draft = await db.drafts.get(draftId);

        if (!draft) return undefined;

        return normalizeRichText(draft);
    },

    async getAllByUser(userId: number) {
        return db.drafts
            .where("[userId+updatedAt]")
            .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
            .reverse()
            .toArray();
    },

    async delete(draftId: string, userId: number) {
        const draft = await db.drafts.get(draftId);

        if (!draft || draft.userId !== userId) return;

        await db.drafts.delete(draftId);
    },
};
