import BudgetStep from "../../../../../components/project/edit/BudgetStep.svelte";
import CampaignInfoStep from "../../../../../components/project/edit/CampaignInfoStep.svelte";
import CollaborationsStep from "../../../../../components/project/edit/CollaborationsStep.svelte";
import ConfigurationStep from "../../../../../components/project/edit/ConfigurationStep.svelte";
import OwnerInfoStep from "../../../../../components/project/edit/OwnerInfoStep.svelte";
import RewardsStep from "../../../../../components/project/edit/RewardsStep.svelte";

import type { Component } from "svelte";

export type ProjectEditorStep = {
    id: number;
    // Steps declare different prop shapes (project required/optional, onContinue,
    // onPublish), so the array is only typed as "some Svelte component".
    component: Component<any>;
};

export const steps: ProjectEditorStep[] = [
    { id: 1, component: ConfigurationStep },
    { id: 2, component: CampaignInfoStep },
    { id: 3, component: RewardsStep },
    { id: 4, component: CollaborationsStep },
    { id: 5, component: BudgetStep },
    { id: 6, component: OwnerInfoStep },
];

export function getStepComponent(id: number): Component<any> {
    const step = steps.find((s) => s.id === id) || steps[0];

    return step.component;
}
