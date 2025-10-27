import { extractId } from "./extractId";
import { apiAccountingsIdGet, type ApiMoney } from "../openapi/client";

import type { Project } from "../openapi/client/types.gen";
import type { Campaign } from "../types/campaign";

/**
 * Transform API Project to Campaign format for search results
 * Follows the same pattern as home page components
 */
export async function transformProjectToCampaign(project: Project): Promise<Campaign> {
    // Fetch accounting data from API
    const accountingId = extractId(project.accounting);
    if (!accountingId) {
        throw new Error(`Missing accounting ID for project ${project.slug}`);
    }

    const { data: accounting } = await apiAccountingsIdGet({
        path: { id: accountingId },
    });

    // Get image URL - simple fallback to video thumbnail
    const image = (project as any).cover || project.video?.thumbnail || "";

    // Get minimum budget
    const minimum: ApiMoney = project.budget?.minimum?.money || { amount: 0, currency: "EUR" };

    // Get raised amount from fetched accounting data
    const obtained: ApiMoney = accounting?.balance || { amount: 0, currency: "EUR" };

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
export async function transformProjectsToCampaigns(projects: Project[]): Promise<Campaign[]> {
    return await Promise.all(projects.map((project) => transformProjectToCampaign(project)));
}
