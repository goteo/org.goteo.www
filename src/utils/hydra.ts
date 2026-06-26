export function toCollectionItems<T>(collection: unknown): T[] {
    if (Array.isArray(collection)) {
        return collection as T[];
    }

    if (collection && typeof collection === "object") {
        const record = collection as Record<string, unknown>;
        const hydraMembers = record["hydra:member"];
        const members = record.member;

        if (Array.isArray(hydraMembers)) {
            return hydraMembers as T[];
        }

        if (Array.isArray(members)) {
            return members as T[];
        }
    }

    return [];
}
