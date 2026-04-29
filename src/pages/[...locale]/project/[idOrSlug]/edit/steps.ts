//@ts-expect-error svelte components do not export as ts
import BudgetStep from "../../../../../components/project/edit/BudgetStep.svelte";
//@ts-expect-error svelte components do not export as ts
import CampaignInfoStep from "../../../../../components/project/edit/CampaignInfoStep.svelte";
//@ts-expect-error svelte components do not export as ts
import CollaborationsStep from "../../../../../components/project/edit/CollaborationsStep.svelte";
//@ts-expect-error svelte components do not export as ts
import ConfigurationStep from "../../../../../components/project/edit/ConfigurationStep.svelte";
//@ts-expect-error svelte components do not export as ts
import OwnerInfoStep from "../../../../../components/project/edit/OwnerInfoStep.svelte";
//@ts-expect-error svelte components do not export as ts
import RewardsStep from "../../../../../components/project/edit/RewardsStep.svelte";

import type { Snippet } from "svelte";

export type ProjectEditorStep = {
    id: number;
    component: Snippet;
};

export const steps: ProjectEditorStep[] = [
    { id: 1, component: ConfigurationStep },
    { id: 2, component: CampaignInfoStep },
    { id: 3, component: RewardsStep },
    { id: 4, component: CollaborationsStep },
    { id: 5, component: BudgetStep },
    { id: 6, component: OwnerInfoStep },
];

export function getStepComponent(id: number): Snippet {
    const step = steps.find((s) => s.id === id) || steps[0];

    return step.component;
}
