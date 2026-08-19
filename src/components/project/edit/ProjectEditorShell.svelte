<script lang="ts">
    import type { Project } from "../../../openapi/client";
    import { draftsRepository } from "../../../repositories/drafts";
    import ErrorPage from "../../errorpage/ErrorPage.svelte";
    import BrokenRobot from "../../errorpage/BrokenRobot.svelte";
    import { t } from "../../../i18n/store";
    import Spinner from "../../icons/status/Spinner.svelte";
    import ProjectEditor from "./ProjectEditor.svelte";
    import { getStepComponent } from "./steps";

    let { project, idOrSlug }: { project?: Project; idOrSlug: string } = $props();

    let draft = $derived.by(async () => {
        if (project) {
            return draftsRepository.getOrCreateForProject($state.snapshot(project));
        }

        return draftsRepository.get(idOrSlug);
    });

    let step = $derived.by(() => {
        let currentStep = 1;

        if (typeof window == "undefined") {
            return currentStep;
        }

        const url = new URL(window.location.href);
        const stepParam = url.searchParams.get("step");
        if (stepParam) {
            const step = parseInt(stepParam, 10);
            if (!isNaN(step) && step >= 1 && step <= 6) {
                currentStep = step;
            }
        }

        return currentStep;
    });
</script>

{#await draft}
    <div class="wrapper">
        <span class="absolute inset-0 flex items-center justify-center">
            <Spinner />
        </span>
    </div>
{:then draft}
    {#if draft}
        <ProjectEditor {draft}>
            {@const StepComponent = getStepComponent(step)}
            <StepComponent project={draft} />
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
