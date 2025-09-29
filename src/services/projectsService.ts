import { createAuthError, type AuthError } from "../openapi/api";
import { apiProjectsGetCollection } from "../openapi/client/sdk.gen";

import type { Project } from "../openapi/client/types.gen";
import type { SearchableCampaign, SearchFilters } from "../stores/searchStore";

// API response interface
export interface ProjectSearchResponse {
    data: SearchableCampaign[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    meta?: {
        searchTime?: number;
        filters?: Record<string, any>;
    };
}

/**
 * Service for handling project/campaign API interactions
 */
export class ProjectsService {
    /**
     * Search projects using the API with filtering and pagination
     */
    async searchProjects(
        filters: SearchFilters,
        options?: {
            page?: number;
            limit?: number;
            abortSignal?: AbortSignal;
        },
    ): Promise<ProjectSearchResponse> {
        const params = this.mapFiltersToApiParams(filters, options);

        try {
            const response = await apiProjectsGetCollection({
                query: params,
                ...(options?.abortSignal && { signal: options.abortSignal }),
            });

            if (!response.data) {
                throw new Error("No data received from API");
            }

            // API returns a direct array of Project objects
            const projects = response.data as Project[];

            const transformedData = this.transformApiResponse(projects);
            const pagination = this.extractPaginationData(
                projects,
                options?.page || 1,
                options?.limit || 20,
            );

            return {
                data: transformedData,
                pagination,
                meta: {
                    searchTime: Date.now(),
                    filters: params,
                },
            };
        } catch (error) {
            // Enhanced error handling with authentication error context
            if (error && typeof error === "object" && "type" in error && "message" in error) {
                // Re-throw authentication errors with additional context
                const authError = error as AuthError;
                throw createAuthError(new Error(`Search API ${authError.message}`));
            }

            // Re-throw with more context for other errors
            if (error instanceof Error) {
                throw new Error(`Projects API search failed: ${error.message}`);
            }
            throw new Error("Projects API search failed with unknown error");
        }
    }

    /**
     * Get initial projects for server-side rendering
     */
    async getInitialProjects(
        locale: string,
        options?: {
            limit?: number;
            abortSignal?: AbortSignal;
        },
    ): Promise<SearchableCampaign[]> {
        try {
            const initialParams = {
                page: 1,
                itemsPerPage: options?.limit || 12,
            };

            const response = await apiProjectsGetCollection({
                query: initialParams,
                headers: {
                    "Accept-Language": locale,
                },
                ...(options?.abortSignal && { signal: options.abortSignal }),
            });

            if (!response.data) {
                return [];
            }

            const transformed = this.transformApiResponse(response.data);

            return transformed;
        } catch {
            return [];
        }
    }

    /**
     * Map search filters to SDK-supported API parameters
     * Only uses parameters that are actually supported by the API
     */
    private mapFiltersToApiParams(
        filters: SearchFilters,
        options?: { page?: number; limit?: number },
    ): Record<string, any> {
        const params: Record<string, any> = {};

        // Map text search to title parameter (SDK supported)
        if (filters.query?.trim()) {
            params.title = filters.query.trim();
        }

        // Map categories array (SDK supported as 'category[]')
        if (filters.categories?.length > 0) {
            params["category[]"] = filters.categories;
        }

        // Map status filter (SDK supported as 'status[]' for multiple values)
        if (filters.statusFilter && filters.statusFilter !== "all") {
            switch (filters.statusFilter) {
                case "funding":
                    params["status[]"] = ["in_campaign", "in_funding"];
                    break;
                case "successful":
                    params.status = "funded";
                    break;
                case "completed":
                    params.status = "unfunded";
                    break;
            }
        }

        // Pagination parameters (SDK supported)
        params.page = options?.page || 1;
        params.itemsPerPage = options?.limit || 20;

        // Note: timeFilter and locationFilter are NOT supported by the SDK and are ignored

        return params;
    }

    /**
     * Transform API Project array to SearchableCampaign format
     */
    private transformApiResponse(projects: Project[]): SearchableCampaign[] {
        // API always returns an array of Project objects
        return projects.map((project: Project) => this.transformSingleProject(project));
    }

    /**
     * Transform a single Project to SearchableCampaign
     */
    private transformSingleProject(project: Partial<Project>): SearchableCampaign {
        // Calculate days remaining from calendar
        let daysRemaining = 0;
        if (project.calendar?.minimum || project.calendar?.optimum) {
            const deadline = new Date(
                project.deadline === "optimum" && project.calendar.optimum
                    ? project.calendar.optimum
                    : project.calendar.minimum || project.calendar.optimum || "",
            );
            const now = new Date();
            const timeDiff = deadline.getTime() - now.getTime();
            // Handle invalid dates gracefully
            if (isNaN(timeDiff)) {
                daysRemaining = 0;
            } else {
                daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
            }
        }

        // Calculate progress percentage from budget
        const progressPercentage = this.calculateProgressPercentage(project);

        // Map status
        const status = this.mapProjectStatus(project.status);

        // Build SearchableCampaign object
        const campaign: SearchableCampaign = {
            id: project.slug || String(project.id || "unknown"),
            title: project.title || "",
            image: this.getProjectImage(project),
            daysRemaining,
            obtained: this.formatAmount(this.getRaisedAmount(project)),
            minimum: this.formatAmount(project.budget?.minimum?.money?.amount),
            progressPercentage,
            hasMatchfunding: this.hasMatchfunding(project),
            size: this.determineProjectSize(project),
            // SearchableCampaign specific fields
            description: project.description || "",
            location: this.getProjectLocation(project),
            status,
            category: this.mapProjectCategory(project.category || ""),
            createdDate: project.calendar?.release || new Date().toISOString(),
        };

        return campaign;
    }

    /**
     * Calculate project progress percentage from API accounting data
     */
    private calculateProgressPercentage(project: Partial<Project>): number {
        const minimumAmount = project.budget?.minimum?.money?.amount;
        if (!minimumAmount || minimumAmount <= 0) return 0;

        // Get raised amount from accounting data if available
        const raisedAmount = this.getRaisedAmount(project);

        return minimumAmount > 0 ? Math.round((raisedAmount / minimumAmount) * 100) : 0;
    }

    /**
     * Get raised amount from project accounting data
     */
    private getRaisedAmount(project: Partial<Project>): number {
        // Check for accounting data in the project
        if (project.accounting && typeof project.accounting === "object") {
            const accounting = project.accounting as any;

            // Try different possible fields for raised amount
            if (typeof accounting.raised === "number") {
                return accounting.raised;
            }
            if (typeof accounting.received === "number") {
                return accounting.received;
            }
            if (typeof accounting.amount === "number") {
                return accounting.amount;
            }
            if (accounting.money && typeof accounting.money.amount === "number") {
                return accounting.money.amount;
            }
        }

        // Check for investment data - use safe property access
        const projectAny = project as any;
        if (projectAny.investment && Array.isArray(projectAny.investment)) {
            return projectAny.investment.reduce((total: number, investment: any) => {
                if (investment && typeof investment.amount === "number") {
                    return total + investment.amount;
                }
                return total;
            }, 0);
        }

        // Fallback to 0 if no accounting data is available
        return 0;
    }

    /**
     * Determine if project has matchfunding based on project data
     */
    private hasMatchfunding(project: Partial<Project>): boolean {
        // Use safe property access for extended project properties
        const projectAny = project as any;

        // Check for matchfunding in project structure
        if (projectAny.matchfunding && typeof projectAny.matchfunding === "boolean") {
            return projectAny.matchfunding;
        }

        // Check for matchfunding calls or campaigns
        if (projectAny.calls && Array.isArray(projectAny.calls) && projectAny.calls.length > 0) {
            return projectAny.calls.some(
                (call: any) => call && typeof call === "object" && call.matchfunding === true,
            );
        }

        // Check budget for matchfunding amounts - use safe access
        const budget = project.budget as any;
        if (budget?.matchfunding?.money?.amount) {
            return budget.matchfunding.money.amount > 0;
        }

        return false;
    }

    /**
     * Determine project size based on budget amount
     */
    private determineProjectSize(project: Partial<Project>): "small" | "large" {
        const amount = project.budget?.minimum?.money?.amount;
        if (!amount || amount <= 0) return "small";

        // Projects with budget over 50,000€ are considered large
        return amount >= 50000 ? "large" : "small";
    }

    /**
     * Map API project status to our SearchableCampaign status
     */
    private mapProjectStatus(apiStatus?: string): "active" | "funded" | "expired" {
        if (!apiStatus) return "expired";

        switch (apiStatus) {
            case "in_campaign":
            case "in_funding":
                return "active";
            case "funded":
                return "funded";
            case "unfunded":
            case "rejected":
            default:
                return "expired";
        }
    }

    /**
     * Map API project category to our display format
     */
    private mapProjectCategory(apiCategory: string | null | undefined): string {
        if (!apiCategory) return "social";
        // Map API categories to display categories
        const categoryMap: Record<string, string> = {
            solidary: "social",
            "libre-software": "technology",
            employment: "social",
            design: "arts",
            journalism: "journalism",
            education: "education",
            culture: "arts",
            ecology: "environment",
            "health-and-cares": "social",
            "open-data": "technology",
            democracy: "social",
            equity: "social",
        };

        return categoryMap[apiCategory] || "social";
    }

    /**
     * Get project image URL with placehold.co fallback
     */
    private getProjectImage(project: Partial<Project>): string {
        // Use safe property access for extended project properties
        const projectAny = project as any;

        // Check for actual project image first
        if (projectAny.image && typeof projectAny.image === "string") {
            return projectAny.image;
        }

        // Check for media collection images
        if (projectAny.media && Array.isArray(projectAny.media) && projectAny.media.length > 0) {
            const firstMedia = projectAny.media[0];
            if (firstMedia && typeof firstMedia === "object" && "url" in firstMedia) {
                return String(firstMedia.url);
            }
        }

        // Fallback to placehold.co with project title
        const title = project.title || "Project";
        const encodedTitle = encodeURIComponent(title);
        return `https://placehold.co/400x300/4A90E2/FFFFFF/png?text=${encodedTitle}`;
    }

    /**
     * Get project location string from territory
     */
    private getProjectLocation(project: Partial<Project>): string {
        if (!project.territory || !project.territory.country) return "";

        // Map country codes to display names
        const countryMap: Record<string, string> = {
            ES: "España",
            FR: "Francia",
            IT: "Italia",
            DE: "Alemania",
            PT: "Portugal",
            // Add more as needed
        };

        return countryMap[project.territory.country] || project.territory.country || "";
    }

    /**
     * Format monetary amounts
     */
    private formatAmount(amount: number | null | undefined): string {
        if (amount === null || amount === undefined || amount === 0) {
            return "0 €";
        }
        // Use European formatting with dots as thousands separator
        const formatted = Math.abs(amount)
            .toString()
            .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
        return `${formatted} €`;
    }

    /**
     * Extract pagination data from API response
     * API supports pagination parameters but doesn't return metadata
     */
    private extractPaginationData(
        projects: Project[],
        page: number,
        limit: number,
    ): ProjectSearchResponse["pagination"] {
        // API supports pagination parameters but doesn't return total count
        // We can only infer pagination state from the number of returned items
        const receivedCount = projects.length;
        const hasNext = receivedCount === limit; // If we got full page, there might be more
        const hasPrev = page > 1;

        return {
            page,
            limit,
            total: receivedCount, // We only know current page count
            totalPages: hasNext ? page + 1 : page, // Estimate based on hasNext
            hasNext,
            hasPrev,
        };
    }
}

// Export singleton instance
export const projectsService = new ProjectsService();
