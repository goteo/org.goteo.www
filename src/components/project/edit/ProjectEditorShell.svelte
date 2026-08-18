<script lang="ts">
    import type { Project } from "../../../openapi/client";
    import { draftsRepository } from "../../../repositories/projectDraft";
    import ErrorPage from "../../errorpage/ErrorPage.svelte";
    import BrokenRobot from "../../errorpage/BrokenRobot.svelte";
    import { t } from "../../../i18n/store";

    let { project, idOrSlug }: { project?: Project; idOrSlug: string } = $props();

    let draft = $derived.by(async () => {
        if (project) {
            return draftsRepository.getForProject(project).then((draft) => {
                draftsRepository.update(draft);

                return draft;
            });
        }

        return draftsRepository.get(idOrSlug);
    });
</script>

{#await draft}
    <h1>Waiting</h1>
{:then draft}
    {#if draft}
        <h1>{draft.key}</h1>
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
