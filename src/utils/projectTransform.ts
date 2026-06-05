import { extractId } from "./extractId";
import { apiAccountingsIdGet, type Money } from "../openapi/client";

import type { Project } from "../openapi/client/types.gen";
import type { Campaign } from "../types/campaign";

export async function transformProjectToCampaign(project: Project): Promise<Campaign> {
    const minimum: Money = project.budget?.minimum?.money || { amount: 0, currency: "EUR" };
    const optimum: Money | undefined = project.budget?.optimum?.money;
    const image = (project as any).cover || project.video?.thumbnail || "";

    let obtained: Money = { amount: 0, currency: minimum.currency || "EUR" };

    const accountingId = extractId(project.accounting);
    if (accountingId) {
        try {
            const { data: accounting } = await apiAccountingsIdGet({
                path: { id: accountingId },
            });
            if (accounting?.balance) {
                obtained = accounting.balance;
            }
        } catch {
            // accounting fetch failed, use default obtained value
        }
    }

    return {
        ...project,
        slug: project.slug || "",
        id: project.slug || String(project.id || "unknown"),
        title: project.title || "",
        image,
        obtained,
        minimum,
        optimum,
        size: "small",
    };
}

export async function transformProjectsToCampaigns(projects: Project[]): Promise<Campaign[]> {
    const results = await Promise.allSettled(projects.map(transformProjectToCampaign));
    return results
        .filter((r): r is PromiseFulfilledResult<Campaign> => r.status === "fulfilled")
        .map((r) => r.value);
}
