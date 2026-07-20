<!--
    Wizard Application Component

    Root component that wraps the wizard shell and manages step routing.
    Handles:
    - Step content rendering
    - Save and publish callbacks
    - URL query parameter sync
-->
<script lang="ts">
    import { onMount } from "svelte";

    import ProjectEditorShell from "./ProjectEditorShell.svelte";
    import { getStepComponent } from "./steps";
    import { session } from "../../../../../auth/store";
    import { type Project, type ProjectProjectCreationDto } from "../../../../../openapi/client";
    import { apiProjectsGetCollectionUrl } from "../../../../../openapi/client/paths.gen";
    import {
        currentDraft,
        deleteCurrentDraft,
        hasUnsavedChanges,
        initializeProjectDraft,
        loadDraft,
        markCurrentDraftClean,
        updateWizard,
    } from "../../../../../stores/drafts/projectDraft";
    import { publishDraft } from "../../../../../utils/projectPublisher";
    import { getProjectDraftResources } from "../../../../../utils/projectSubmissionApi";

    import type { Session } from "../../../../../auth/types";

    let {
        idOrSlug,
        project = null,
    }: {
        idOrSlug: string;
        project?: Project | null;
    } = $props();

    let resolvedProject = $state<Project | null>(project);
    let isInitialized = $state(false);
    let showSessionErrorToast = $state(false);
    const user = $derived(($session: Session | null) => $session?.user);

    function getInitialStep() {
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

        return initialStep;
    }

    function projectToDraft(project: Project): ProjectProjectCreationDto {
        return {
            title: project.title || "",
            subtitle: project.subtitle || "",
            categories: project.categories,
            release: project.calendar?.release ?? undefined,
            status: project.status || "in_draft",
        };
    }

    function projectToIri(project: Project) {
        return `${apiProjectsGetCollectionUrl}/${project.slug ?? project.id}`;
    }

    function draftToProject(idOrSlug: string): Project | null {
        if (!$currentDraft) return null;

        const numericId = Number(idOrSlug);

        return {
            id: Number.isNaN(numericId) ? undefined : numericId,
            slug: Number.isNaN(numericId) ? idOrSlug : undefined,
            title: $currentDraft.createProject.title,
            subtitle: $currentDraft.createProject.subtitle,
            categories: $currentDraft.createProject.categories,
            territory: {} as Project["territory"],
            description: "",
            deadline: $currentDraft.wizardForm.configuration.projectDeadline,
            budget: $currentDraft.wizardForm.budget,
            status: $currentDraft.createProject.status,
        };
    }

    function redirectToNotFound() {
        window.location.href = "/404";
    }

    onMount(() => {
        const initialStep = getInitialStep();

        async function initialize() {
            try {
                if (project?.id) {
                    const resources = $session
                        ? await getProjectDraftResources(projectToIri(project), $session)
                        : undefined;

                    const coverUrl = (project as any).cover as string | undefined;
                    if (coverUrl && resources) {
                        resources.images = [
                            {
                                id: crypto.randomUUID(),
                                url: coverUrl,
                                name: "Project cover",
                                size: 0,
                            },
                        ];
                    }

                    await initializeProjectDraft(
                        projectToDraft(project),
                        String(project.id),
                        resources,
                    );
                    resolvedProject = project;
                } else {
                    const hasDraft = await loadDraft(idOrSlug);

                    if (!hasDraft) {
                        redirectToNotFound();
                        return;
                    }

                    hasUnsavedChanges.set(true);
                    resolvedProject = draftToProject(idOrSlug);
                }

                updateWizard({ currentStep: initialStep }, { markUnsaved: false });
                isInitialized = true;
            } catch (err) {
                errorMessage = err instanceof Error ? err.message : "Unknown error";
                isInitialized = true;
            }
        }

        initialize();

        // Listen for browser back/forward navigation (client-side only)
        if (typeof window !== "undefined") {
            const handlePopState = () => {
                const url = new URL(window.location.href);
                const stepParam = url.searchParams.get("step");
                if (stepParam) {
                    const step = parseInt(stepParam, 10);
                    if (!isNaN(step) && step >= 1 && step <= 6) {
                        updateWizard({ currentStep: step });
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
    const currentStep = $derived($currentDraft?.wizardForm.currentStep ?? 1);
    let errorMessage = $state("");

    async function saveToAPI() {
        if (!$currentDraft) return;
        if (!resolvedProject?.id) {
            errorMessage = "Project not found in API";
            return;
        }

        try {
            if (!$session) {
                showSessionErrorToast = true;
                throw new Error("User session not found");
            }

            const result = await publishDraft($currentDraft, $session, String(resolvedProject.id));
            markCurrentDraftClean(result.resources);
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Unknown error";

            return;
        }
    }

    function handlePublish() {
        if (!$currentDraft || !resolvedProject) return;

        const idOrSlug = resolvedProject.slug ?? resolvedProject.id;

        deleteCurrentDraft($currentDraft.draftId, $currentDraft.userId);
        window.location.href = `/project/${idOrSlug}/publish`;
    }
</script>

{#if isInitialized && resolvedProject}
    <ProjectEditorShell
        {errorMessage}
        project={resolvedProject}
        {showSessionErrorToast}
        onSave={saveToAPI}
        onPublish={handlePublish}
    >
        {@const StepComponent = getStepComponent(currentStep)}
        <StepComponent project={resolvedProject} />
    </ProjectEditorShell>
{/if}
