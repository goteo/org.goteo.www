import { apiProjectsGetCollection } from "../openapi/client/sdk.gen";

import type { AuthError } from "../openapi/api";
import type { Project } from "../openapi/client/types.gen";
import type { SearchFilters } from "../stores/searchStore";

/**
 * Simple service wrapper for project API calls
 * Based on OpenAPI client documentation
 */
export class ProjectsService {
    /**
     * Search projects with filters and pagination
     * Returns raw Project[] from API
     */
    async searchProjects(
        filters: SearchFilters,
        options?: {
            page?: number;
            limit?: number;
            abortSignal?: AbortSignal;
        },
    ): Promise<{
        projects: Project[];
        totalCount: number;
        hasNextPage: boolean;
    }> {
        try {
            const response = await apiProjectsGetCollection({
                query: {
                    // Text search
                    ...(filters.query?.trim() && { title: filters.query.trim() }),
                    // Categories (array filter for OR logic) - Fixed: use "categories[]" not "category[]"
                    ...(filters.categories?.length && { "categories[]": filters.categories }),
                    // Status filter
                    ...(filters.statusFilter &&
                        filters.statusFilter !== "all" && { status: filters.statusFilter }),
                    // Pagination
                    page: options?.page || 1,
                    itemsPerPage: options?.limit || 20,
                },
                ...(options?.abortSignal && { signal: options.abortSignal }),
            });

            // According to OpenAPI types, response.data is Array<Project>
            const projects = (response.data as Project[]) || [];
            const limit = options?.limit || 20;

            // Infer hasNextPage: if we got exactly the requested amount, there might be more
            const hasNextPage = projects.length === limit;

            // Without Hydra metadata, we can only use the current page count
            // Multiply by current page to give a rough estimate
            const totalCount = hasNextPage
                ? projects.length * (options?.page || 1) + 1 // At least one more page
                : projects.length * (options?.page || 1);

            return {
                projects,
                totalCount,
                hasNextPage,
            };
        } catch (error) {
            // Re-throw auth errors as-is for component handling
            if (error && typeof error === "object" && "type" in error) {
                throw error as AuthError;
            }

            // Wrap other errors with context
            if (error instanceof Error) {
                throw new Error(`Project search failed: ${error.message}`);
            }
            throw new Error("Project search failed");
        }
    }

    /**
     * Get initial projects for SSR
     * Returns empty array on error
     */
    async getInitialProjects(
        locale: string,
        options?: {
            limit?: number;
            abortSignal?: AbortSignal;
        },
    ): Promise<Project[]> {
        try {
            const response = await apiProjectsGetCollection({
                query: {
                    page: 1,
                    itemsPerPage: options?.limit || 12,
                },
                headers: {
                    "Accept-Language": locale,
                },
                ...(options?.abortSignal && { signal: options.abortSignal }),
            });

            return response.data || [];
        } catch {
            return [];
        }
    }

    /**
     * Helper: Check if there are more pages
     * API doesn't return pagination metadata, so we infer from results
     */
    hasNextPage(projects: Project[], limit: number): boolean {
        return projects.length === limit;
    }
}

// Export singleton instance
export const projectsService = new ProjectsService();
