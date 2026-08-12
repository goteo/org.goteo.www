/**
 * Risk level assigned to a reviewed area of a project.
 *
 * Values match the `domain.review.risks.*` translation keys.
 */
export type ProjectReviewRisk = "low" | "medium" | "high";

/**
 * A single reviewable area of a project during campaign or funding review.
 *
 * NOTE: this is not part of the OpenAPI spec — the v4 API exposes no review
 * resources yet, so `src/openapi/client` has no generated equivalent. Replace
 * this interface with the generated type once the API ships those endpoints.
 */
export interface ProjectReviewArea {
    /** Name of the reviewed area. */
    title: string;
    /** Reviewer's summary of the findings for this area. */
    summary: string;
    /** Risk assessed for this area, if it has been evaluated. */
    risk?: ProjectReviewRisk;
    /** Number of chat messages exchanged about this area. */
    chatCount?: number;
    /** ISO 8601 date of the last message in this area's chat. */
    lastActivity?: string;
}
