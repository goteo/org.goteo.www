import type { Money } from "$client";

export interface FundingItem {
    amount: Money;
    label: string;
    color: string;
}

export interface FundingData {
    items: FundingItem[];
    current: Money;
}

export interface FundingGoal {
    amount: Money;
    data: FundingData;
}
