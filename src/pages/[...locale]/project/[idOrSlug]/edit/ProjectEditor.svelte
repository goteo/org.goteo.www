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
        type Category,
        type Project,
    } from "../../../../../openapi/client";

    import type { Session } from "../../../../../auth/types";
    import {
        currentDraft,
        deleteCurrentDraft,
        persistDraft,
        updateProject,
        updateWizard,
    } from "../../../../../stores/drafts/projectDraft";
    import { publishDraft } from "../../../../../utils/projectPublisher";
    import { onMount } from "svelte";

    let {
        project,
        session,
    }: {
        project: Project;
        session: Session;
    } = $props();

    onMount(() => {
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
        updateProject({
            title: project.title || "",
            subtitle: project.subtitle || "",
            categories: project.categories as Category[],
            release: project.calendar?.release ?? undefined,
        });
        updateWizard({
            currentStep: 1, // Start at step 1 by default
        });

        // Set the step from URL parameter if present
        if (initialStep !== 1) {
            updateWizard({ currentStep: initialStep });
        }

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
    let saveState = $state<"idle" | "saving" | "saved">("idle");
    let errorMessage = $state("");

    async function handlePublish() {
        const draft = get(currentDraft);

        if (!draft) return;

        saveState = "saving";

        try {
            await publishDraft(draft, session, String(project.id));

            await deleteCurrentDraft(draft.draftId, draft.userId);

            window.location.href = "/project/" + (project.slug ?? project.id) + "/publish";
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Unknown error";

            saveState = "idle";
            return;
        }

        saveState = "saved";
    }
</script>

<ProjectEditorShell
    {errorMessage}
    {saveState}
    {project}
    onSave={persistDraft}
    onPublish={handlePublish}
>
    {@const StepComponent = getStepComponent(currentStep)}
    <StepComponent {project} onPublish={handlePublish} />
</ProjectEditorShell>
