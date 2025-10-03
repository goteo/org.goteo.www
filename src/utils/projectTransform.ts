import type { Project } from "../openapi/client/types.gen";
import type { Campaign } from "../types/campaign";

/**
 * Transform API Project to Campaign format for display components
 */
export function transformProjectToCampaign(project: Project): Campaign {
    // Use safe property access for extended project properties
    const projectAny = project as any;

    // Get raised amount from accounting
    const obtainedAmount = projectAny.accounting?.balance?.amount ?? 0;
    const obtainedCurrency = projectAny.accounting?.balance?.currency ?? "EUR";

    // Get minimum budget
    const minimumAmount = project.budget?.minimum?.money?.amount ?? 0;
    const minimumCurrency = project.budget?.minimum?.money?.currency ?? "EUR";

    // Determine size based on budget (over 50,000€ = 5,000,000 cents)
    const size = minimumAmount >= 5000000 ? "large" : "small";

    // Check for matchfunding
    const hasMatchfunding =
        projectAny.matchCallSubmissions &&
        Array.isArray(projectAny.matchCallSubmissions) &&
        projectAny.matchCallSubmissions.some((s: any) => s?.status === "accepted");

    // Get image URL
    let image = "https://placehold.co/400x300/4A90E2/FFFFFF/png?text=Project";
    if (projectAny.cover) {
        image = projectAny.cover;
    } else if (projectAny.video?.thumbnail) {
        image = projectAny.video.thumbnail;
    } else if (project.title) {
        const encodedTitle = encodeURIComponent(project.title);
        image = `https://placehold.co/400x300/4A90E2/FFFFFF/png?text=${encodedTitle}`;
    }

    return {
        id: project.slug || String(project.id || "unknown"),
        title: project.title || "",
        image,
        obtained: {
            amount: obtainedAmount,
            currency: obtainedCurrency,
        },
        minimum: {
            amount: minimumAmount,
            currency: minimumCurrency,
        },
        hasMatchfunding,
        size,
    };
}

/**
 * Transform array of Projects to Campaigns
 */
export function transformProjectsToCampaigns(projects: Project[]): Campaign[] {
    return projects.map(transformProjectToCampaign);
}
