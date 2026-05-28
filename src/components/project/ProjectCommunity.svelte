<script lang="ts">
    import { Modal } from "flowbite-svelte";

    import ProjectCommunityAnonymous from "./ProjectCommunityAnonymous.svelte";
    import ProjectCommunityMatchfunding from "./ProjectCommunityMatchfunding.svelte";
    import ProjectCommunityMatchfundingModal from "./ProjectCommunityMatchfundingModal.svelte";
    import ProjectCommunityMessage from "./ProjectCommunityMessage.svelte";
    import ProjectCommunitySponsorModal from "./ProjectCommunitySponsorModal.svelte";
    import { t } from "../../i18n/store";
    import { apiProjectSupportsGetCollection, apiUsersIdOrHandleGet } from "../../openapi/client/index";
    import Loader from "../../svgs/Loader.svelte";
    import { extractId } from "../../utils/extractId";
    import ActionableButton from "../library/ActionableButton.svelte";
    import Grid from "../library/Grid.svelte";

    import type { Accounting, Project, ProjectSupport } from "../../openapi/client/index";

    type EnrichedSupport = ProjectSupport & { displayName: string; avatar: string | undefined };

    let {
        project,
        accounting,
    }: {
        project: Project;
        accounting: Accounting;
    } = $props();

    const projectId = $derived(project.id?.toString());

    let projectsSupportItems = $state<EnrichedSupport[]>([]);

    let selectedProjectSupport: EnrichedSupport | null = $state(null);

    let isLoaded = $state(false);
    let openModal = $state(false);
    let hasMore = $state(false);
    let currentPage = $state(1);

    function getSupportType(item: EnrichedSupport) {
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

    const PAGE_SIZE = 30;
    const FIRST_PAGE_SIZE = 29;

    async function fetchPage(page: number): Promise<EnrichedSupport[]> {
        const itemsPerPage = page === 1 ? FIRST_PAGE_SIZE : PAGE_SIZE;
        const { data } = await apiProjectSupportsGetCollection({
            query: { project: projectId, anonymous: false, page, itemsPerPage },
        });

        const items = (data as ProjectSupport[]) ?? [];
        hasMore = items.length === itemsPerPage;

        return Promise.all(
            items.map(async (support) => {
                const id = extractId(support.origin!);
                const { data: user } = await apiUsersIdOrHandleGet({ path: { idOrHandle: id! } });
                return { ...support, displayName: user?.displayName ?? "", avatar: user?.avatar };
            }),
        );
    }

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
            {#if groupedItems.matchfunding?.length}
                <Grid class="grid-cols-2 gap-6 md:grid-cols-6 lg:grid-cols-6">
                    {#each groupedItems.matchfunding as item (item.id)}
                        <div class="col-span-2 md:col-span-3 flex flex-col">
                            <ProjectCommunityMatchfunding
                                {item}
                                bind:openModal
                                bind:selectedProjectSupport
                            />
                        </div>
                    {/each}
                    <div class="col-span-2 md:col-span-3">
                        <ProjectCommunityAnonymous {project} currency={accounting.balance?.currency!} />
                    </div>
                    {#each groupedItems.default ?? [] as item (item.id)}
                        <div class="col-span-2 md:col-span-2">
                            <ProjectCommunityMessage
                                {item}
                                bind:openModal
                                bind:selectedProjectSupport
                            />
                        </div>
                    {/each}
                </Grid>
            {:else}
                <Grid class="grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <ProjectCommunityAnonymous {project} currency={accounting.balance?.currency!} />
                    {#each groupedItems.default ?? [] as item (item.id)}
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
