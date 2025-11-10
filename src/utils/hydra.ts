export function toCollectionItems<T>(collection: unknown): T[] {
    if (Array.isArray(collection)) {
        return collection as T[];
    }

    if (collection && typeof collection === "object") {
        const hydraMembers = (collection as Record<string, unknown>)["hydra:member"];

        if (Array.isArray(hydraMembers)) {
            return hydraMembers as T[];
        }
    }

    return [];
}
