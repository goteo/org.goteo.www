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
    import { type Category, type Project } from "../../../../../openapi/client";

    import type { Session } from "../../../../../auth/types";
    import {
        createDraft,
        currentDraft,
        deleteCurrentDraft,
        hasUnsavedChanges,
        loadDraft,
        updateWizard,
    } from "../../../../../stores/drafts/projectDraft";
    import { publishDraft } from "../../../../../utils/projectPublisher";
    import { onMount } from "svelte";
    import { session } from "../../../../../auth/store";

    let {
        project,
    }: {
        project: Project;
    } = $props();

    const user = $derived(($session: Session | null) => $session?.user);

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

        const isDraftExisting = loadDraft(project.id);

        if (isDraftExisting) {
            createDraft({
                title: project.title || "",
                subtitle: project.subtitle || "",
                categories: project.categories as Category[],
                release: project.calendar?.release ?? undefined,
                status: project.status || "in_draft",
            });
        }

        // Set the step from URL parameter if present
        if (initialStep !== 1) {
            updateWizard({ currentStep: initialStep });
        } else {
            updateWizard({
                currentStep: 1, // Start at step 1 by default
            });
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
    let errorMessage = $state("");

    async function saveToAPI() {
        if (!$currentDraft) return;

        try {
            const currentSession = get(session);

            if (!currentSession) {
                throw new Error("User session not found");
            }

            await publishDraft($currentDraft, currentSession, String(project.id));

            hasUnsavedChanges.set(false);
        } catch (err) {
            errorMessage = err instanceof Error ? err.message : "Unknown error";

            return;
        }
    }

    function handlePublish() {
        if (!$currentDraft) return;

        const idOrSlug = project.slug ?? project.id;

        deleteCurrentDraft($currentDraft.draftId, $currentDraft.userId);
        window.location.href = `/project/${idOrSlug}/publish`;
    }
</script>

<ProjectEditorShell {errorMessage} {project} onSave={saveToAPI} onPublish={handlePublish}>
    {@const StepComponent = getStepComponent(currentStep)}
    <StepComponent {project} />
</ProjectEditorShell>
