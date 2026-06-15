<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import ProjectCommunityAnonymous from "./ProjectCommunityAnonymous.svelte";
    import ProjectCommunityMatchfunding from "./ProjectCommunityMatchfunding.svelte";
    import ProjectCommunityMatchfundingModal from "./ProjectCommunityMatchfundingModal.svelte";
    import ProjectCommunityMessage from "./ProjectCommunityMessage.svelte";
    import ProjectCommunitySponsorModal from "./ProjectCommunitySponsorModal.svelte";
    import { t } from "../../i18n/store";
    import { apiProjectSupportsGetCollection } from "../../openapi/client/index";
    import Loader from "../../svgs/Loader.svelte";
    import Grid from "../library/Grid.svelte";

    import type { Accounting, Project, ProjectSupport } from "../../openapi/client/index";

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const projectId = $derived(project.id!.toString());

    let projectsSupportItems = $state<ProjectSupport[]>([]);

    let selectedProjectSupport: ProjectSupport | null = $state(null);

    let isLoaded = $state(false);
    let openModal = $state(false);

    function getSupportType(item: (typeof projectsSupportItems)[number]) {
        switch (true) {
            case item.matchfunding:
                return "matchfunding";
            default:
                return "default";
        }
    }

    const groupedItems = $derived.by(() =>
        projectsSupportItems.reduce(
            (groups, item) => {
                const type = getSupportType(item);
                (groups[type] ??= []).push(item);
                return groups;
            },
            {} as Record<string, typeof projectsSupportItems>,
        ),
    );

    $effect(() => {
        apiProjectSupportsGetCollection({
            query: { project: projectId, anonymous: false },
        }).then(({ data: publicSupports }) => {
            projectsSupportItems = publicSupports || [];
            isLoaded = true;
        });
    });
</script>

<div class="flex flex-col gap-10">
    {#if !isLoaded}
        <div class="flex items-center justify-center">
            <Loader />
        </div>
    {:else}
        <h2 class="text-secondary line-clamp-2 flex max-w-2xl text-4xl font-bold">
            {$t("pages.project.view.tabs.community.content.title")}
        </h2>
        <div class="flex flex-col gap-6">
            <Grid class="grid-cols-1 gap-6 md:grid-cols-2">
                {#each groupedItems.matchfunding as item (item.id)}
                    <ProjectCommunityMatchfunding
                        {item}
                        bind:openModal
                        bind:selectedProjectSupport
                    />
                {/each}
                <ProjectCommunityAnonymous {project} currency={accounting.balance?.currency!} />
            </Grid>

            {#if groupedItems.default?.length}
                <Grid class="grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {#each groupedItems.default as item (item.id)}
                        <ProjectCommunityMessage
                            {item}
                            bind:openModal
                            bind:selectedProjectSupport
                        />
                    {/each}
                </Grid>
            {/if}
        </div>
    {/if}
</div>

<Modal
    bind:open={openModal}
    closeBtnClass="top-4 end-7 bg-transparent text-secondary hover:bg-transparent hover:text-secondary  rounded-4xl hover:scale-110 transition-transform duration-200 transform focus:ring-0 shadow-none dark:text-secondary dark:hover:text-secondary dark:hover:bg-transparent"
    class="fixed top-1/2 left-1/2 w-full max-w-118.75 -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-lg backdrop:bg-[#878282B2] backdrop:backdrop-blur-[5px]"
    headerClass="py-2"
>
    {#if selectedProjectSupport}
        {#if selectedProjectSupport.matchfunding}
            <ProjectCommunityMatchfundingModal item={selectedProjectSupport} />
        {:else}
            <ProjectCommunitySponsorModal item={selectedProjectSupport} />
        {/if}
    {/if}
</Modal>
