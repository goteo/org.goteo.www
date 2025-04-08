/**
 * Extracts the ID from an IRI string such as "/v4/something/123" or "/v4/something/123/extra".
 *
 * The ID is expected to be in the 3rd segment of the path (index 2 after splitting by "/").
 *
 * @param iri - A string representing an IRI (Internationalized Resource Identifier)
 * @returns The extracted ID as a string, or null if not found
 */
export function extractId(iri?: string): string | null {
    if (!iri) return null;
    const parts = iri.split("/").filter(Boolean);
    return parts.length > 2 ? parts[2] : null;
}
