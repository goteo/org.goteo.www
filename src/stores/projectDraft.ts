import { writable } from "svelte/store";

import type { Project } from "../openapi/client";

export const drafts = writable<Project[]>();

const STORAGE_PREFIX = "project";

export function buildStorageKey(hash: string) {
    return `${STORAGE_PREFIX}:${hash}`;
}
