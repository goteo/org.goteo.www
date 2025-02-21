export interface FundingItem {
  amount: number;
  label: string;
  color: string;
}

export interface FundingData {
  items: FundingItem[];
  current: number;
}

export interface FundingGoal {
  amount: number;
  data: FundingData;
}
