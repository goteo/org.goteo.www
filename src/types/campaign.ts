import type { ApiMoney } from "../openapi/client";

export interface Campaign {
    id: string;
    title: string;
    image: string;
    obtained: ApiMoney;
    minimum: ApiMoney;
    hasMatchfunding?: boolean;
    tags?: string[];
    size: CampaignSize; // Add size to the campaign data
}

export type CampaignSize = "small" | "large";
