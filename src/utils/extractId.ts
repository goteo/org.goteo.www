/**
 * Extracts the ID from an IRI string like "/v4/users/142" or "https://api.goteo.org/v4/accountings/2533".
 *
 * @param iri - A string representing an IRI (Internationalized Resource Identifier)
 * @returns The extracted ID as a string, or null if not available
 */
export function extractId(iri?: string): string | null {
    if (!iri) return null;
    const parts = iri.split("/").filter(Boolean);
    return parts.length ? parts[parts.length - 1] : null;
}
