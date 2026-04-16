<!--
    Wizard Application Component

    Root component that wraps the wizard shell and manages step routing.
    Handles:
    - Step content rendering
    - Save and publish callbacks
    - URL query parameter sync
-->
<script lang="ts">
    import { get } from "svelte/store";

    import ProjectEditorShell from "./ProjectEditorShell.svelte";
    import { getStepComponent } from "./steps";
    import {
        apiProjectBudgetItemsPost,
        apiProjectCollaborationsPost,
        apiProjectRewardsPost,
        apiProjectsIdPatch,
        type Project,
    } from "../../../../../openapi/client";
    import { apiProjectsGetCollectionUrl } from "../../../../../openapi/client/paths.gen";
    import {
        wizardState,
        initializeFromProject,
        clearLocalStorage,
    } from "../../../../../stores/wizard-state";

    import type { Session } from "../../../../../auth/types";

    let {
        project,
        session,
    }: {
        project: Project;
        session: Session;
    } = $props();

    // Initialize wizard state from project and set up URL sync
    $effect(() => {
        // Read URL parameter first (before initializing)
        let initialStep = 1;
        if (typeof window !== "undefined") {
            const url = new URL(window.location.href);
            const stepParam = url.searchParams.get("step");
            if (stepParam) {
                const step = parseInt(stepParam, 10);
                if (!isNaN(step) && step >= 1 && step <= 6) {
                    initialStep = step;
                }
            }
        }

        // Initialize from project
        initializeFromProject(project);

        // Set the step from URL parameter if present
        if (initialStep !== 1) {
            wizardState.update((state) => ({
                ...state,
                currentStep: initialStep,
            }));
        }

        // Listen for browser back/forward navigation (client-side only)
        if (typeof window !== "undefined") {
            const handlePopState = () => {
                const url = new URL(window.location.href);
                const stepParam = url.searchParams.get("step");
                if (stepParam) {
                    const step = parseInt(stepParam, 10);
                    if (!isNaN(step) && step >= 1 && step <= 6) {
                        wizardState.update((state) => ({
                            ...state,
                            currentStep: step,
                        }));
                    }
                }
            };

            window.addEventListener("popstate", handlePopState);

            return () => {
                window.removeEventListener("popstate", handlePopState);
            };
        }
    });

    // Reactive current step
    const currentStep = $derived($wizardState.currentStep);
    let saveState = $state<"idle" | "saving" | "saved">("idle");
    let errorMessage = $state("");

    /**
     * Handle save draft to API
     */
    async function handleSave() {
        saveState = "saving";

        try {
            const currentData = get(wizardState);
            const projectIri =
                apiProjectsGetCollectionUrl + "/" + (project.slug ? project.slug : project.id);

            if (currentData.rewards.length > 0) {
                currentData.rewards.forEach(async (reward) => {
                    const { error: rewardErr } = await apiProjectRewardsPost({
                        body: {
                            project: projectIri,
                            title: reward.title,
                            description: reward.description,
                            money: {
                                amount: reward.money.amount,
                                currency: reward.money.currency,
                            },
                            isFinite: reward.isFinite,
                            unitsTotal: reward.unitsTotal,
                        },
                        headers: session.token.asHttpHeaders,
                    });
                    if (rewardErr) throw rewardErr;
                });
            }

            if (currentData.collaborations.length > 0) {
                currentData.collaborations.forEach(async (collab) => {
                    const { error: collaborationErr } = await apiProjectCollaborationsPost({
                        body: {
                            project: projectIri,
                            title: collab.title,
                            description: collab.description,
                            isFulfilled: false,
                        },
                        headers: session.token.asHttpHeaders,
                    });
                    if (collaborationErr) throw collaborationErr;
                });
            }

            if (currentData.budgetItems.minimum.length > 0) {
                currentData.budgetItems.minimum.forEach(async (item) => {
                    const { error: budgetItemErr } = await apiProjectBudgetItemsPost({
                        body: {
                            project: projectIri,
                            type: item.type,
                            title: item.title,
                            description: item.description,
                            money: {
                                amount: item.money.amount,
                                currency: item.money.currency,
                            },
                            deadline: item.deadline,
                        },
                        headers: session.token.asHttpHeaders,
                    });
                    if (budgetItemErr) throw budgetItemErr;
                });
            }

            if (currentData.budgetItems.optimum.length > 0) {
                currentData.budgetItems.optimum.forEach(async (item) => {
                    const { error: budgetItemErr } = await apiProjectBudgetItemsPost({
                        body: {
                            project: projectIri,
                            type: item.type,
                            title: item.title,
                            description: item.description,
                            money: {
                                amount: item.money.amount,
                                currency: item.money.currency,
                            },
                            deadline: item.deadline,
                        },
                        headers: session.token.asHttpHeaders,
                    });
                    if (budgetItemErr) throw budgetItemErr;
                });
            }

            const { error: projectErr } = await apiProjectsIdPatch({
                path: { id: String(project.id) },
                body: {
                    title: currentData.title,
                    subtitle: currentData.subtitle,
                    video: currentData.campaignInfo.video,
                    description:
                        currentData.campaignInfo.objectives +
                        currentData.campaignInfo.legacy +
                        currentData.campaignInfo.targetAudience +
                        currentData.campaignInfo.team,
                    deadline: currentData.configuration.projectDeadline,
                },
                headers: session.token.asHttpHeaders,
            });

            if (projectErr) throw projectErr;
        } catch (err: any) {
            errorMessage = err;
            saveState = "idle";
        } finally {
            errorMessage = "";
            saveState = "saved";
        }
    }

    /**
     * Handle publish
     */
    async function handlePublish() {
        // In Phase 1, this is disabled until all steps are complete and sent to API
        clearLocalStorage();
        window.location.href =
            "/project/" + (project.slug ? project.slug : project.id) + "/publish";
    }
</script>

<ProjectEditorShell
    {errorMessage}
    {saveState}
    {project}
    onSave={handleSave}
    onPublish={handlePublish}
>
    {@const StepComponent = getStepComponent(currentStep)}
    <StepComponent {project} />
</ProjectEditorShell>
