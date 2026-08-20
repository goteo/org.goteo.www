<script lang="ts">
    import ProjectEditor from "./ProjectEditor.svelte";
    import { getStepComponent } from "./steps";
    import { draftsRepository } from "../../../repositories/drafts";
    import { createProjectDraftStore } from "../../../stores/drafts/draftsStore";
    import BrokenRobot from "../../errorpage/BrokenRobot.svelte";
    import ErrorPage from "../../errorpage/ErrorPage.svelte";
    import Spinner from "../../icons/status/Spinner.svelte";

    import type { Project } from "../../../openapi/client";
    import type { ProjectDraftStore } from "../../../stores/drafts/draftsStore";
    import { t } from "../../../i18n/store";

    let { project, idOrSlug }: { project?: Project; idOrSlug: string } = $props();

    let editor = $derived.by(async (): Promise<ProjectDraftStore | undefined> => {
        if (project) {
            const actual = $state.snapshot(project);
            const draft = await draftsRepository.getOrCreateForProject(actual);

            return createProjectDraftStore(draft, actual);
        }

        const draft = await draftsRepository.get(idOrSlug);

        if (!draft) {
            return undefined;
        }

        return createProjectDraftStore(draft);
    });

    let step = $derived.by(() => {
        let currentStep = "1";

        if (typeof window === "undefined") {
            return currentStep;
        }

        const url = new URL(window.location.href);
        const stepParam = url.searchParams.get("step");

        if (stepParam) {
            const parsedStep = parseInt(stepParam, 10);

            if (!isNaN(parsedStep) && parsedStep >= 1 && parsedStep <= 6) {
                currentStep = String(parsedStep);
            }
        }

        return currentStep;
    });

    function handleStepChange(newStep: string) {
        step = newStep;

        if (typeof window === "undefined") {
            return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set("step", newStep);

        window.history.replaceState(
            window.history.state,
            "",
            `${url.pathname}?${url.searchParams}`,
        );
    }
</script>

{#await editor}
    <div class="wrapper">
        <span class="absolute inset-0 flex items-center justify-center">
            <Spinner />
        </span>
    </div>
{:then draft}
    {#if draft}
        {@const StepComponent = getStepComponent(step)}
        <ProjectEditor {draft} {step} onStepChange={handleStepChange}>
            <StepComponent {draft} />
        </ProjectEditor>
    {:else}
        <ErrorPage
            code={404}
            title={$t("pages.404.title")}
            subtitle={$t("pages.404.subtitle")}
            ctaText={$t("common.goHome")}
        >
            <BrokenRobot />
        </ErrorPage>
    {/if}
{/await}
