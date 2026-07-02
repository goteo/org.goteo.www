<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import ProjectCommunityAnonymous from "./ProjectCommunityAnonymous.svelte";
    import ProjectCommunityMatchfunding from "./ProjectCommunityMatchfunding.svelte";
    import ProjectCommunityMatchfundingModal from "./ProjectCommunityMatchfundingModal.svelte";
    import ProjectCommunityMessage from "./ProjectCommunityMessage.svelte";
    import ProjectCommunitySponsorModal from "./ProjectCommunitySponsorModal.svelte";
    import { t } from "../../i18n/store";
    import { apiProjectSupportsGetCollection } from "../../openapi/client/index";
    import ActionableButton from "../library/buttons/ActionableButton.svelte";
    import Loader from "../library/feedback/Loader.svelte";
    import Grid from "../library/layout/Grid.svelte";

    import type { Accounting, Project, ProjectSupport } from "../../openapi/client/index";

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const projectId = $derived(project.id?.toString());

    let projectsSupportItems = $state<ProjectSupport[]>([]);

    let selectedProjectSupport: ProjectSupport | null = $state(null);

    let isLoaded = $state(false);
    let openModal = $state(false);
    let hasMore = $state(false);
    let currentPage = $state(1);

    const groupedItems = $derived.by(() =>
        projectsSupportItems.reduce(
            (groups, item) => {
                const type = item.matchfunding ? "matchfunding" : "default";
                (groups[type] ??= []).push(item);
                return groups;
            },
            {} as Record<string, typeof projectsSupportItems>,
        ),
    );

    const PAGE_SIZE = 30;
    const FIRST_PAGE_SIZE = 29;

    async function fetchPage(page: number): Promise<ProjectSupport[]> {
        const itemsPerPage = page === 1 ? FIRST_PAGE_SIZE : PAGE_SIZE;
        const { data } = await apiProjectSupportsGetCollection({
            query: { project: projectId, anonymous: false, page, itemsPerPage },
        });

        const items = (data as ProjectSupport[]) ?? [];
        hasMore = items.length === itemsPerPage;

        return items;
    }

    const matchfundingCount = $derived(groupedItems.matchfunding?.length ?? 0);
    const hasMatchfunding = $derived(matchfundingCount > 0);
    const isSingleMatchfunding = $derived(matchfundingCount === 1);

    const visibleDefaultItems = $derived(
        hasMatchfunding
            ? groupedItems.default
            : groupedItems.default?.slice(
                  0,
                  PAGE_SIZE - 2 + Math.max(0, (currentPage - 1) * PAGE_SIZE),
              ),
    );

    $effect(() => {
        fetchPage(1).then((items) => {
            projectsSupportItems = items;
            isLoaded = true;
        });
    });

    async function loadMore() {
        const nextPage = currentPage + 1;
        const supports = await fetchPage(nextPage);
        projectsSupportItems = [...projectsSupportItems, ...supports];
        currentPage = nextPage;
    }
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
            {#if hasMatchfunding}
                <Grid
                    class={`grid-cols-1 gap-6 ${isSingleMatchfunding ? "md:grid-cols-2 lg:grid-cols-2" : "md:grid-cols-3"}`}
                >
                    {#each groupedItems.matchfunding as item (item.id)}
                        <ProjectCommunityMatchfunding
                            {item}
                            bind:openModal
                            bind:selectedProjectSupport
                        />
                    {/each}
                    <ProjectCommunityAnonymous {project} currency={accounting.balance?.currency!} />
                </Grid>
            {/if}

            {#if groupedItems.default?.length}
                <Grid class="grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {#if !hasMatchfunding}
                        <div class="row-span-2 h-full">
                            <ProjectCommunityAnonymous
                                {project}
                                currency={accounting.balance?.currency!}
                            />
                        </div>
                    {/if}
                    {#each visibleDefaultItems as item (item.id)}
                        <ProjectCommunityMessage
                            {item}
                            bind:openModal
                            bind:selectedProjectSupport
                        />
                    {/each}
                </Grid>
            {/if}

            {#if hasMore}
                <div class="flex w-full justify-center">
                    <ActionableButton action={loadMore} autoreset={0} class="w-32">
                        {$t("pages.project.view.tabs.community.loadMore")}
                    </ActionableButton>
                </div>
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
