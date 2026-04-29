import { apiProjectsGetCollection } from "../openapi/client/sdk.gen";

import type { AuthError } from "../openapi/api";
import type { Project } from "../openapi/client/types.gen";
import type { SearchFilters } from "../stores/searchStore";

/**
 * Simple service wrapper for project API calls
 */
export class ProjectsService {
    /**
     * Search projects with filters and pagination
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
            const territoryParams = filters.territory
                ? {
                      country: filters.territory.country,
                      ...(filters.territory.subLvl1 && { subLvl1: filters.territory.subLvl1 }),
                      ...(filters.territory.subLvl2 && { subLvl2: filters.territory.subLvl2 }),
                  }
                : {};

            const response = await apiProjectsGetCollection({
                query: {
                    ...territoryParams,
                    // Text search
                    ...(filters.query?.trim() && { title: filters.query.trim() }),
                    // Categories
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

            const projects = (response.data as Project[]) || [];
            const limit = options?.limit || 20;
            const currentPage = options?.page || 1;

            // Infer hasNextPage: if we got exactly the requested amount, there might be more
            const hasNextPage = projects.length === limit;

            const totalCount = hasNextPage
                ? projects.length * currentPage + 1
                : (currentPage - 1) * limit + projects.length;

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
}

// Export singleton instance
export const projectsService = new ProjectsService();
