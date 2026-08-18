<!--
    Wizard Application Component

    Root component that wraps the wizard shell and manages step routing.
    Handles:
    - Step content rendering
    - Save and publish callbacks
    - URL query parameter sync
-->
<script lang="ts">
    import { onMount, untrack } from "svelte";

    import ProjectEditorShell from "./ProjectEditorShell.svelte";
    import { getStepComponent } from "./steps";
    import { session } from "../../../auth/store";
    import { type Project } from "../../../openapi/client";
    import { apiProjectsGetCollectionUrl } from "../../../openapi/client/paths.gen";
    import {
        type CreateProjectForm,
        currentDraft,
        deleteCurrentDraft,
        hasUnsavedChanges,
        initializeProjectDraft,
        loadDraft,
        markCurrentDraftClean,
        updateWizard,
    } from "../../../stores/drafts/projectDraft";
    import { publishDraft } from "../../../utils/projectPublisher";
    import { getProjectDraftResources } from "../../../utils/projectSubmissionApi";

    let {
        idOrSlug,
        project = null,
    }: {
        idOrSlug: string;
        project?: Project | null;
    } = $props();

    // Seeded from the server-rendered prop; refreshed on mount from the draft.
    let resolvedProject = $state<Project | null>(untrack(() => project));
    let isInitialized = $state(false);
    let showSessionErrorToast = $state(false);

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

    function projectToDraft(project: Project): CreateProjectForm {
        return {
            title: project.title || "",
            subtitle: project.subtitle || "",
            categories: project.categories,
            release: project.calendar?.release ?? undefined,
            status: project.status || "in_draft",
        };
    }

    /**
     * Image MIME types accepted by the uploader, mirroring the image entries of
     * `STORAGE_ALLOWEDTYPES` in `src/utils/objectStorage.ts`. That module cannot be
     * imported here because it instantiates a server-side S3 client.
     */
    const COVER_MIME_TYPES: Record<string, string> = {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        webp: "image/webp",
        png: "image/png",
        gif: "image/gif",
    };

    /**
     * The cover comes back as a bare URL, but `UploadedFile` needs a MIME type
     * for the uploader to recognise it as an image and render its preview.
     */
    function guessImageMimeType(url: string): string {
        const basename = url.split("?")[0].split(/[\\/]/).pop() ?? "";
        const dotIndex = basename.lastIndexOf(".");
        const extension = dotIndex < 1 ? "" : basename.slice(dotIndex + 1).toLowerCase();

        return COVER_MIME_TYPES[extension] ?? "image/jpeg";
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
            territory: $currentDraft.createProject.territory as Project["territory"],
            description: "",
            deadline: $currentDraft.wizardForm.configuration.deadline,
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
                                type: guessImageMimeType(coverUrl),
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
        {showSessionErrorToast}
        onSave={saveToAPI}
        onPublish={handlePublish}
    >
        {@const StepComponent = getStepComponent(currentStep)}
        <StepComponent project={resolvedProject} />
    </ProjectEditorShell>
{/if}
