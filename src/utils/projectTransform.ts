import type { ApiMoney } from "../openapi/client";
import type { Project } from "../openapi/client/types.gen";
import type { Campaign } from "../types/campaign";

/**
 * Transform API Project to Campaign format for search results
 * Follows the same pattern as home page components
 */
export function transformProjectToCampaign(project: Project): Campaign {
    // Use safe property access for extended project properties
    const projectAny = project as any;

    // Get image URL - simple fallback to video thumbnail
    const image = projectAny.cover || project.video?.thumbnail || "";

    // Get minimum budget
    const minimum: ApiMoney = project.budget?.minimum?.money || { amount: 0, currency: "EUR" };

    // Get raised amount from accounting
    const obtained: ApiMoney = projectAny.accounting?.balance || { amount: 0, currency: "EUR" };

    return {
        id: project.slug || String(project.id || "unknown"),
        title: project.title || "",
        image,
        obtained,
        minimum,
        size: "small",
    };
}

/**
 * Transform array of Projects to Campaigns
 */
export function transformProjectsToCampaigns(projects: Project[]): Campaign[] {
    return projects.map(transformProjectToCampaign);
}
