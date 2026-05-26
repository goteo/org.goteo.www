import type { ProjectBudgetItem } from "../openapi/client";

export const budgetTypeColors = {
    infrastructure: "var(--color-secondary)",
    material: "var(--color-tertiary)",
    task: "var(--color-variant2)",
} as const satisfies Record<ProjectBudgetItem["type"], string>;

export const budgetTypeClasses = {
    infrastructure: "bg-secondary",
    material: "bg-tertiary",
    task: "bg-variant2",
} as const satisfies Record<ProjectBudgetItem["type"], string>;
