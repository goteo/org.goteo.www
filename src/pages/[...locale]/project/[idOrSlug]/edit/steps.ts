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

/**
 * `astro check` and `svelte-check` model an imported `.svelte` module with
 * different types — Astro wraps it as `(props) => any`, Svelte types it as
 * `Component<Props>` — so no single annotation satisfies both tools. The cast
 * is confined here so consumers still see one shared component type.
 */
function toStep(id: number, component: unknown): ProjectEditorStep {
    return { id, component: component as Component<any> };
}

export const steps: ProjectEditorStep[] = [
    toStep(1, ConfigurationStep),
    toStep(2, CampaignInfoStep),
    toStep(3, RewardsStep),
    toStep(4, CollaborationsStep),
    toStep(5, BudgetStep),
    toStep(6, OwnerInfoStep),
];

export function getStepComponent(id: number): Component<any> {
    const step = steps.find((s) => s.id === id) || steps[0];

    return step.component;
}
