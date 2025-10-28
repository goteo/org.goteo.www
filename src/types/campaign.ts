import type { Money } from "../openapi/client";

export interface Campaign {
    id: string;
    title: string;
    image: string;
    obtained: Money;
    minimum: Money;
    hasMatchfunding?: boolean;
    tags?: string[];
    size: CampaignSize; // Add size to the campaign data
}

export type CampaignSize = "small" | "large";
