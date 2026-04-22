import { db } from "./db";
import type { Draft } from "../../stores/projectDraft";
import Dexie from "dexie";

export const draftRepo = {
    async create(draft: Draft) {
        await db.drafts.put(draft);
        return draft;
    },

    async update(draftId: string, userId: string, data: Partial<Draft>) {
        const existing = await db.drafts.get(draftId);

        if (!existing || existing.userId !== userId) return;

        await db.drafts.put({
            ...existing,
            ...data,
            updatedAt: Date.now(),
        });
    },

    async get(draftId: string, userId: string) {
        const draft = await db.drafts.get(draftId);

        if (!draft || draft.userId !== userId) return undefined;

        return draft;
    },

    async getAll(userId: string) {
        return db.drafts
            .where("[userId+updatedAt]")
            .between([userId, Dexie.minKey], [userId, Dexie.maxKey])
            .reverse()
            .toArray()
    },

    async delete(draftId: string, userId: string) {
        const draft = await db.drafts.get(draftId);

        if (!draft || draft.userId !== userId) return;

        await db.drafts.delete(draftId);
    },
};
