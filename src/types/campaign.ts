export interface Campaign {
  id: string;
  title: string;
  image: string;
  daysRemaining: number;
  obtained: string;
  minimum: string;
  progressPercentage: number;
  hasMatchfunding?: boolean;
  tags?: string[];
  size: CampaignSize; // Add size to the campaign data
}

export type CampaignSize = "small" | "large";